import { db } from "@workspace/db";
import { coursesTable, enrollmentsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import type { JwtPayload } from "./auth";

export async function getTeacherCourseIds(user: JwtPayload): Promise<number[]> {
  if (!user.linkedEntityId) return [];
  const rows = await db.select({ id: coursesTable.id }).from(coursesTable)
    .where(eq(coursesTable.facultyId, user.linkedEntityId));
  return rows.map((r) => r.id);
}

export async function getStudentCourseIds(user: JwtPayload): Promise<number[]> {
  if (!user.linkedEntityId) return [];
  const rows = await db.select({ courseId: enrollmentsTable.courseId }).from(enrollmentsTable)
    .where(eq(enrollmentsTable.studentId, user.linkedEntityId));
  return rows.map((r) => r.courseId);
}

export async function getTeacherStudentIds(user: JwtPayload): Promise<number[]> {
  const courseIds = await getTeacherCourseIds(user);
  if (courseIds.length === 0) return [];
  const rows = await db.select({ studentId: enrollmentsTable.studentId }).from(enrollmentsTable)
    .where(inArray(enrollmentsTable.courseId, courseIds));
  return [...new Set(rows.map((r) => r.studentId))];
}
