import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { schedulesTable, coursesTable, facultyTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/schedules", async (req, res) => {
  try {
    const rows = await db.select().from(schedulesTable);
    const filtered = rows.filter((s) => {
      if (req.query.courseId && s.courseId !== Number(req.query.courseId)) return false;
      if (req.query.facultyId && s.facultyId !== Number(req.query.facultyId)) return false;
      return true;
    });
    const result = await Promise.all(
      filtered.map(async (s) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, s.courseId));
        let facultyName: string | undefined;
        if (s.facultyId) {
          const [f] = await db.select().from(facultyTable).where(eq(facultyTable.id, s.facultyId));
          if (f) facultyName = `${f.firstName} ${f.lastName}`;
        }
        return { ...s, createdAt: s.createdAt.toISOString(), courseName: course?.name, courseCode: course?.courseCode, facultyName };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schedules", async (req, res) => {
  try {
    const [s] = await db.insert(schedulesTable).values(req.body).returning();
    res.status(201).json({ ...s, createdAt: s.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/schedules/:id", async (req, res) => {
  try {
    const [s] = await db.update(schedulesTable).set(req.body).where(eq(schedulesTable.id, Number(req.params.id))).returning();
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ ...s, createdAt: s.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schedules/:id", async (req, res) => {
  try {
    await db.delete(schedulesTable).where(eq(schedulesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
