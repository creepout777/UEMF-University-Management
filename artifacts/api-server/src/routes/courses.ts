import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { coursesTable, departmentsTable, facultyTable, enrollmentsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/courses", async (req, res) => {
  try {
    const rows = await db.select().from(coursesTable);
    const filtered = rows.filter((c) => {
      if (req.query.departmentId && c.departmentId !== Number(req.query.departmentId)) return false;
      if (req.query.search) {
        const q = String(req.query.search).toLowerCase();
        if (!(c.name.toLowerCase().includes(q) || c.courseCode.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    const result = await Promise.all(
      filtered.map(async (c) => {
        const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, c.departmentId));
        let facultyName: string | undefined;
        if (c.facultyId) {
          const [f] = await db.select().from(facultyTable).where(eq(facultyTable.id, c.facultyId));
          if (f) facultyName = `${f.firstName} ${f.lastName}`;
        }
        const [enrolled] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, c.id));
        return { ...c, createdAt: c.createdAt.toISOString(), departmentName: dept?.name, facultyName, enrolledCount: Number(enrolled?.count ?? 0) };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/courses", async (req, res) => {
  try {
    const [c] = await db.insert(coursesTable).values(req.body).returning();
    res.status(201).json({ ...c, createdAt: c.createdAt.toISOString(), enrolledCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const [c] = await db.select().from(coursesTable).where(eq(coursesTable.id, Number(req.params.id)));
    if (!c) return res.status(404).json({ error: "Not found" });
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, c.departmentId));
    const [enrolled] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, c.id));
    res.json({ ...c, createdAt: c.createdAt.toISOString(), departmentName: dept?.name, enrolledCount: Number(enrolled?.count ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const [c] = await db.update(coursesTable).set(req.body).where(eq(coursesTable.id, Number(req.params.id))).returning();
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json({ ...c, createdAt: c.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    await db.delete(coursesTable).where(eq(coursesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
