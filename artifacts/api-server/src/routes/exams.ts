import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { examsTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/exams", async (req, res) => {
  try {
    const rows = await db.select().from(examsTable);
    const filtered = rows.filter((e) => {
      if (req.query.courseId && e.courseId !== Number(req.query.courseId)) return false;
      if (req.query.semester && e.semester !== req.query.semester) return false;
      return true;
    });
    const result = await Promise.all(
      filtered.map(async (e) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, e.courseId));
        return { ...e, createdAt: e.createdAt.toISOString(), courseName: course?.name, courseCode: course?.courseCode };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/exams", async (req, res) => {
  try {
    const [e] = await db.insert(examsTable).values(req.body).returning();
    res.status(201).json({ ...e, createdAt: e.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/exams/:id", async (req, res) => {
  try {
    const [e] = await db.update(examsTable).set(req.body).where(eq(examsTable.id, Number(req.params.id))).returning();
    if (!e) return res.status(404).json({ error: "Not found" });
    res.json({ ...e, createdAt: e.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/exams/:id", async (req, res) => {
  try {
    await db.delete(examsTable).where(eq(examsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
