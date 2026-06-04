import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "kvltech-fallback-secret";

export function signToken(payload: { id: string; email: string; type: "client" | "admin" }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; email: string; type: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("kvl_token");
  return cookie?.value || null;
}

export function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.cookies.get("kvl_admin_token")?.value || null;
  if (!token) return null;
  const user = verifyToken(token);
  if (!user || user.type !== "admin") return null;
  return user;
}
