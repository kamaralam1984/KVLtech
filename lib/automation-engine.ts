import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email-service"
import { sendOrderConfirmationSMS } from "@/lib/sms"

function interpolate(template: string, context: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] ?? "")
}

function buildContext(data: Record<string, unknown>): Record<string, string> {
  const lead = (data.lead as Record<string, unknown>) ?? data
  return {
    name: String(lead.name ?? data.name ?? ""),
    phone: String(lead.phone ?? data.phone ?? ""),
    service: String(lead.service ?? data.service ?? ""),
    company: String(lead.company ?? data.company ?? ""),
  }
}

export async function runAutomationTrigger(
  trigger: string,
  context: Record<string, unknown>
): Promise<void> {
  try {
    const rules = await db.automationRule.findMany({
      where: { trigger, isActive: true },
    })

    for (const rule of rules) {
      if (rule.delayHours > 0) {
        console.log(
          `[AutomationEngine] Rule "${rule.name}" scheduled: delay ${rule.delayHours}h, trigger=${trigger}`
        )
        continue
      }

      await executeRule(rule, context)
    }
  } catch (err) {
    console.error("[AutomationEngine] runAutomationTrigger error:", err)
  }
}

async function executeRule(
  rule: { id: string; name: string; action: string; template: string | null; channel: string },
  context: Record<string, unknown>
): Promise<void> {
  const vars = buildContext(context)
  const lead = (context.lead as Record<string, unknown>) ?? context
  const leadId = String(lead.id ?? "")
  const template = rule.template ?? ""
  const body = interpolate(template, vars)

  try {
    if (rule.action === "send_email") {
      const to = String(lead.email ?? vars.name ?? "")
      if (to && to.includes("@")) {
        await sendEmail(to, `KVL TECH — ${rule.name}`, `<p>${body.replace(/\n/g, "<br>")}</p>`)
      }
    } else if (rule.action === "send_sms") {
      const phone = String(lead.phone ?? vars.phone ?? "")
      if (phone) {
        await sendOrderConfirmationSMS(phone, vars.name, rule.name)
      }
    } else if (rule.action === "send_whatsapp") {
      console.log(`[AutomationEngine] WhatsApp rule "${rule.name}" → ${vars.phone}: ${body}`)
      if (leadId) {
        await db.activity.create({
          data: {
            leadId,
            type: "WHATSAPP",
            title: rule.name,
            description: body,
          },
        })
      }
    } else if (rule.action === "create_task") {
      if (leadId) {
        await db.activity.create({
          data: {
            leadId,
            type: "TASK",
            title: rule.name,
            description: body || `Automated task from rule: ${rule.name}`,
            scheduledAt: new Date(),
          },
        })
      }
    }

    await db.automationRule.update({
      where: { id: rule.id },
      data: { runCount: { increment: 1 } },
    })

    console.log(`[AutomationEngine] Rule "${rule.name}" executed (action=${rule.action})`)
  } catch (err) {
    console.error(`[AutomationEngine] Rule "${rule.name}" execution failed:`, err)
  }
}

export async function checkTimeBasedAutomations(): Promise<void> {
  try {
    const timeRules = await db.automationRule.findMany({
      where: {
        isActive: true,
        trigger: { in: ["time_after_lead", "no_contact_days"] },
      },
    })

    for (const rule of timeRules) {
      const hours = rule.triggerValue ? parseInt(rule.triggerValue, 10) : rule.delayHours

      if (rule.trigger === "time_after_lead") {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000)
        const until = new Date(Date.now() - (hours - 1) * 60 * 60 * 1000)

        const leads = await db.contactLead.findMany({
          where: {
            createdAt: { gte: since, lt: until },
            status: { in: ["NEW", "CONTACTED"] },
          },
        })

        for (const lead of leads) {
          await executeRule(rule, { lead })
        }
      } else if (rule.trigger === "no_contact_days") {
        const days = hours
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

        const leads = await db.contactLead.findMany({
          where: {
            status: { in: ["NEW", "CONTACTED"] },
            updatedAt: { lt: cutoff },
          },
          include: { activities: { orderBy: { createdAt: "desc" }, take: 1 } },
        })

        const staleLeads = leads.filter((l) => {
          if (l.activities.length === 0) return true
          const lastActivity = l.activities[0].createdAt
          return lastActivity < cutoff
        })

        for (const lead of staleLeads) {
          await executeRule(rule, { lead })
        }
      }
    }
  } catch (err) {
    console.error("[AutomationEngine] checkTimeBasedAutomations error:", err)
  }
}
