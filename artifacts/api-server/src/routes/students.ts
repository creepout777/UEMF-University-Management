import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { studentsTable, departmentsTable, gradesTable, enrollmentsTable, coursesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/students", async (req, res) => {
  try {
    const rows = await db.select().from(studentsTable);
    const filtered = rows.filter((s) => {
      if (req.query.departmentId && s.departmentId !== Number(req.query.departmentId)) return false;
      if (req.query.status && s.status !== req.query.status) return false;
      if (req.query.search) {
        const q = String(req.query.search).toLowerCase();
        if (!(`${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    const result = await Promise.all(
      filtered.map(async (s) => {
        const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, s.departmentId));
        return { ...s, gpa: s.gpa ? Number(s.gpa) : null, createdAt: s.createdAt.toISOString(), departmentName: dept?.name };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/students", async (req, res) => {
  try {
    const [cnt] = await db.select({ count: count() }).from(studentsTable);
    const num = (Number(cnt?.count ?? 0) + 1).toString().padStart(5, "0");
    const year = new Date().getFullYear().toString().slice(2);
    const data = { ...req.body, studentId: req.body.studentId || `STU${year}${num}` };
    const [s] = await db.insert(studentsTable).values(data).returning();
    res.status(201).json({ ...s, gpa: s.gpa ? Number(s.gpa) : null, createdAt: s.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/:id", async (req, res) => {
  try {
    const [s] = await db.select().from(studentsTable).where(eq(studentsTable.id, Number(req.params.id)));
    if (!s) return res.status(404).json({ error: "Not found" });
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, s.departmentId));
    res.json({ ...s, gpa: s.gpa ? Number(s.gpa) : null, createdAt: s.createdAt.toISOString(), departmentName: dept?.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const [s] = await db.update(studentsTable).set(req.body).where(eq(studentsTable.id, Number(req.params.id))).returning();
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ ...s, gpa: s.gpa ? Number(s.gpa) : null, createdAt: s.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    await db.delete(studentsTable).where(eq(studentsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/:id/grades", async (req, res) => {
  try {
    const rows = await db.select().from(gradesTable).where(eq(gradesTable.studentId, Number(req.params.id)));
    const result = await Promise.all(
      rows.map(async (g) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, g.courseId));
        const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, g.studentId));
        return {
          ...g,
          score: Number(g.score),
          gradePoints: g.gradePoints ? Number(g.gradePoints) : null,
          gradedAt: g.gradedAt.toISOString(),
          courseName: course?.name,
          courseCode: course?.courseCode,
          studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
        };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/:id/enrollments", async (req, res) => {
  try {
    const rows = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.studentId, Number(req.params.id)));
    const result = await Promise.all(
      rows.map(async (e) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, e.courseId));
        const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, e.studentId));
        return {
          ...e,
          enrolledAt: e.enrolledAt.toISOString(),
          courseName: course?.name,
          courseCode: course?.courseCode,
          studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
        };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
