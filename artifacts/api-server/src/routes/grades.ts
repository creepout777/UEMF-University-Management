import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { gradesTable, studentsTable, coursesTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { getTeacherCourseIds } from "../lib/scopeFilter";

const router: IRouter = Router();

function scoreToLetterGrade(score: number): { letter: string; points: number } {
  if (score >= 90) return { letter: "A+", points: 4.0 };
  if (score >= 85) return { letter: "A", points: 4.0 };
  if (score >= 80) return { letter: "A-", points: 3.7 };
  if (score >= 75) return { letter: "B+", points: 3.3 };
  if (score >= 70) return { letter: "B", points: 3.0 };
  if (score >= 65) return { letter: "B-", points: 2.7 };
  if (score >= 60) return { letter: "C+", points: 2.3 };
  if (score >= 55) return { letter: "C", points: 2.0 };
  if (score >= 50) return { letter: "C-", points: 1.7 };
  if (score >= 45) return { letter: "D", points: 1.0 };
  return { letter: "F", points: 0.0 };
}

router.get("/grades", async (req, res) => {
  try {
    const user = req.user!;
    let rows = await db.select().from(gradesTable);

    if (user.role === "teacher") {
      const courseIds = await getTeacherCourseIds(user);
      if (courseIds.length === 0) return res.json([]);
      rows = rows.filter((g) => courseIds.includes(g.courseId));
    } else if (user.role === "student") {
      rows = rows.filter((g) => g.studentId === user.linkedEntityId);
    }

    const filtered = rows.filter((g) => {
      if (req.query.studentId && g.studentId !== Number(req.query.studentId)) return false;
      if (req.query.courseId && g.courseId !== Number(req.query.courseId)) return false;
      return true;
    });

    const result = await Promise.all(
      filtered.map(async (g) => {
        const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, g.studentId));
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, g.courseId));
        return {
          ...g,
          score: Number(g.score),
          gradePoints: g.gradePoints ? Number(g.gradePoints) : null,
          gradedAt: g.gradedAt.toISOString(),
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

router.post("/grades", async (req, res) => {
  try {
    const { letter, points } = scoreToLetterGrade(req.body.score);
    const [g] = await db.insert(gradesTable).values({ ...req.body, letterGrade: letter, gradePoints: points.toString() }).returning();
    res.status(201).json({ ...g, score: Number(g.score), gradePoints: Number(g.gradePoints), gradedAt: g.gradedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/grades/:id", async (req, res) => {
  try {
    const { letter, points } = scoreToLetterGrade(req.body.score || 0);
    const [g] = await db.update(gradesTable).set({ ...req.body, letterGrade: req.body.letterGrade || letter, gradePoints: req.body.gradePoints?.toString() || points.toString() }).where(eq(gradesTable.id, Number(req.params.id))).returning();
    if (!g) return res.status(404).json({ error: "Not found" });
    res.json({ ...g, score: Number(g.score), gradePoints: Number(g.gradePoints), gradedAt: g.gradedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/grades/:id", async (req, res) => {
  try {
    await db.delete(gradesTable).where(eq(gradesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
