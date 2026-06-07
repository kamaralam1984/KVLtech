import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { PermissionAction } from "@prisma/client"

// ─── helpers ────────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

/** Recursively attach children to build a full tree node */
async function buildTree(roleId: string): Promise<unknown> {
  const role = await db.customRole.findUnique({
    where: { id: roleId },
    include: {
      permissions: { include: { permission: true } },
      admins: true,
      parent: { select: { id: true, name: true, color: true } },
      children: { select: { id: true } },
    },
  })
  if (!role) return null

  const children = await Promise.all(role.children.map(c => buildTree(c.id)))

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    color: role.color,
    isSystem: role.isSystem,
    department: role.department,
    parentRole: role.parent,
    childrenCount: role.children.length,
    createdAt: role.createdAt,
    permissionsCount: role.permissions.length,
    adminsCount: role.admins.length,
    permissions: role.permissions.map(rp => ({
      module: rp.permission.module,
      action: rp.permission.action,
    })),
    children,
  }
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department")
    const includeHierarchy = searchParams.get("includeHierarchy") === "true"

    const whereClause = department ? { department } : {}

    // Department stats
    const allRoles = await db.customRole.findMany({ select: { department: true } })
    const deptStats: Record<string, number> = {}
    for (const r of allRoles) {
      const d = r.department || "Unassigned"
      deptStats[d] = (deptStats[d] || 0) + 1
    }

    if (includeHierarchy) {
      // Return tree: only top-level roles (no parent or parent filtered out)
      const topLevel = await db.customRole.findMany({
        where: { ...whereClause, parentRoleId: null },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      })
      const tree = await Promise.all(topLevel.map(r => buildTree(r.id)))
      return NextResponse.json({ roles: tree, departmentStats: deptStats })
    }

    const roles = await db.customRole.findMany({
      where: whereClause,
      include: {
        permissions: { include: { permission: true } },
        admins: true,
        parent: { select: { id: true, name: true, color: true } },
        children: { select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    const result = roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      color: r.color,
      isSystem: r.isSystem,
      department: r.department,
      parentRole: r.parent ? { id: r.parent.id, name: r.parent.name, color: r.parent.color } : null,
      childrenCount: r.children.length,
      createdAt: r.createdAt,
      permissionsCount: r.permissions.length,
      adminsCount: r.admins.length,
      permissions: r.permissions.map(rp => ({
        module: rp.permission.module,
        action: rp.permission.action,
      })),
    }))

    return NextResponse.json({ roles: result, departmentStats: deptStats })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name, description, color, department, parentRoleId, permissions } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 })

    // Validate parent role if provided
    let parentRole: { id: string; name: string; permissions: { permission: { module: string; action: PermissionAction } }[] } | null = null
    if (parentRoleId) {
      parentRole = await db.customRole.findUnique({
        where: { id: parentRoleId },
        include: { permissions: { include: { permission: true } } },
      })
      if (!parentRole) return NextResponse.json({ error: "Parent role not found" }, { status: 404 })
    }

    const role = await db.customRole.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || "#6366F1",
        department: department || null,
        parentRoleId: parentRoleId || null,
      },
    })

    // Collect all permissions: user-specified + inherited from parent
    const explicitPerms: Array<{ module: string; action: string }> = permissions || []
    const inheritedPerms: Array<{ module: string; action: string }> = parentRole
      ? parentRole.permissions.map(rp => ({
          module: rp.permission.module,
          action: rp.permission.action,
        }))
      : []

    // Merge: use a set to avoid duplicates
    const permSet = new Map<string, { module: string; action: string }>()
    for (const p of [...inheritedPerms, ...explicitPerms]) {
      permSet.set(`${p.module}:${p.action}`, p)
    }

    const allPerms = Array.from(permSet.values())

    for (const { module, action } of allPerms) {
      const perm = await db.permission.upsert({
        where: { module_action: { module, action: action as PermissionAction } },
        create: { module, action: action as PermissionAction },
        update: {},
      })
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      })
    }

    // Audit log
    await db.permissionAuditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.email,
        roleId: role.id,
        roleName: role.name,
        action: "ROLE_CREATED",
        changes: JSON.stringify({
          name: role.name,
          department: role.department,
          permissions: explicitPerms,
          inheritedFrom: parentRole?.name || null,
          inheritedPermissions: inheritedPerms,
        }),
        ip: getClientIp(req),
      },
    })

    return NextResponse.json({ success: true, role })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error"
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, name, description, color, department, parentRoleId, permissions } = await req.json()

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const existing = await db.customRole.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    })
    if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 })

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (color) updateData.color = color
    if (department !== undefined) updateData.department = department || null
    if (parentRoleId !== undefined) updateData.parentRoleId = parentRoleId || null

    const role = await db.customRole.update({ where: { id }, data: updateData })

    // Compute permission diff for audit log
    if (permissions !== undefined) {
      const oldPerms = existing.permissions.map(rp => `${rp.permission.module}.${rp.permission.action}`)
      const newPermKeys = (permissions as Array<{ module: string; action: string }>).map(
        p => `${p.module}.${p.action}`
      )

      const added = newPermKeys.filter(k => !oldPerms.includes(k))
      const removed = oldPerms.filter(k => !newPermKeys.includes(k))

      // Replace permissions
      await db.rolePermission.deleteMany({ where: { roleId: id } })

      for (const { module, action } of permissions as Array<{ module: string; action: string }>) {
        const perm = await db.permission.upsert({
          where: { module_action: { module, action: action as PermissionAction } },
          create: { module, action: action as PermissionAction },
          update: {},
        })
        await db.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        })
      }

      // Only log if there was actually a change
      if (added.length > 0 || removed.length > 0) {
        await db.permissionAuditLog.create({
          data: {
            adminId: admin.id,
            adminName: admin.email,
            roleId: role.id,
            roleName: role.name,
            action: "ROLE_UPDATED",
            changes: JSON.stringify({ added, removed }),
            ip: getClientIp(req),
          },
        })
      }
    }

    return NextResponse.json({ success: true, role })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const role = await db.customRole.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    })
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 })
    if (role.isSystem)
      return NextResponse.json({ error: "Cannot delete system roles" }, { status: 403 })

    // Audit log BEFORE deletion (so we have role info)
    await db.permissionAuditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.email,
        roleId: role.id,
        roleName: role.name,
        action: "ROLE_DELETED",
        changes: JSON.stringify({
          name: role.name,
          permissions: role.permissions.map(rp => `${rp.permission.module}.${rp.permission.action}`),
        }),
        ip: getClientIp(req),
      },
    })

    await db.customRole.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
