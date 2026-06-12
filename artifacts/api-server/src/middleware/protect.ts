import type { Request, Response, NextFunction } from "express";
import { requireAuth, requireRole, type UserRole } from "../lib/auth";

export { requireAuth };

export const adminOnly = requireRole("admin");
export const adminOrAdministration = requireRole("admin", "administration");
export const adminOrTeacher = requireRole("admin", "teacher");
export const adminAdministrationOrTeacher = requireRole("admin", "administration", "teacher");
export const allRoles = requireRole("admin", "administration", "teacher", "student");

export function requireRoles(...roles: UserRole[]) {
  return requireRole(...roles);
}
