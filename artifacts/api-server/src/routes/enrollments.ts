import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, studentsTable, coursesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getTeacherCourseIds } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/enrollments", async (req, res) => {
  try {
    const user = req.user!;
    let rows = await db.select().from(enrollmentsTable);

    if (user.role === "teacher") {
      const courseIds = await getTeacherCourseIds(user);
      if (courseIds.length === 0) return res.json([]);
      rows = rows.filter((e) => courseIds.includes(e.courseId));
    } else if (user.role === "student") {
      rows = rows.filter((e) => e.studentId === user.linkedEntityId);
    }

    const filtered = rows.filter((e) => {
      if (req.query.studentId && e.studentId !== Number(req.query.studentId)) return false;
      if (req.query.courseId && e.courseId !== Number(req.query.courseId)) return false;
      if (req.query.semester && e.semester !== req.query.semester) return false;
      return true;
    });

    const result = await Promise.all(
      filtered.map(async (e) => {
        const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, e.studentId));
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, e.courseId));
        return {
          ...e,
          enrolledAt: e.enrolledAt.toISOString(),
          studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
          courseName: course?.name,
          courseCode: course?.courseCode,
        };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/enrollments", async (req, res) => {
  try {
    const [e] = await db.insert(enrollmentsTable).values({ ...req.body, status: "enrolled" }).returning();
    res.status(201).json({ ...e, enrolledAt: e.enrolledAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/enrollments/:id", async (req, res) => {
  try {
    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
