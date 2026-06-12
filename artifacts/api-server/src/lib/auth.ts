import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export type UserRole = "admin" | "administration" | "teacher" | "student";

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  linkedEntityId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.SESSION_SECRET ?? "uemf-jwt-secret-fallback";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: "Unauthorized" }); return; }
    if (!roles.includes(req.user.role)) { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  };
}
