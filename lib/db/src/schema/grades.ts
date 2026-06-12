import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gradesTable = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  letterGrade: text("letter_grade").notNull(),
  gradePoints: numeric("grade_points", { precision: 3, scale: 2 }),
  semester: text("semester").notNull(),
  assessmentType: text("assessment_type").notNull(),
  comments: text("comments"),
  gradedAt: timestamp("graded_at").defaultNow().notNull(),
});

export const insertGradeSchema = createInsertSchema(gradesTable).omit({ id: true, gradedAt: true });
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof gradesTable.$inferSelect;
