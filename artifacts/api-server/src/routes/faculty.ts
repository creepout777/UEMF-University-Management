import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { facultyTable, departmentsTable, coursesTable } from "@workspace/db";
import { eq, count, like, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/faculty", async (req, res) => {
  try {
    let query = db.select().from(facultyTable);
    const rows = await query;
    const filtered = rows.filter((f) => {
      if (req.query.departmentId && f.departmentId !== Number(req.query.departmentId)) return false;
      if (req.query.search) {
        const s = String(req.query.search).toLowerCase();
        if (!(`${f.firstName} ${f.lastName}`.toLowerCase().includes(s) || f.email.toLowerCase().includes(s))) return false;
      }
      return true;
    });
    const result = await Promise.all(
      filtered.map(async (f) => {
        const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, f.departmentId));
        const [courseCount] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.facultyId, f.id));
        return {
          ...f,
          createdAt: f.createdAt.toISOString(),
          departmentName: dept?.name,
          courseCount: Number(courseCount?.count ?? 0),
        };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/faculty", async (req, res) => {
  try {
    const count2 = await db.select({ count: count() }).from(facultyTable);
    const empNum = (Number(count2[0]?.count ?? 0) + 1).toString().padStart(4, "0");
    const data = { ...req.body, employeeId: req.body.employeeId || `EMP${empNum}` };
    const [f] = await db.insert(facultyTable).values(data).returning();
    res.status(201).json({ ...f, createdAt: f.createdAt.toISOString(), courseCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/faculty/:id", async (req, res) => {
  try {
    const [f] = await db.select().from(facultyTable).where(eq(facultyTable.id, Number(req.params.id)));
    if (!f) return res.status(404).json({ error: "Not found" });
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, f.departmentId));
    const [courseCount] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.facultyId, f.id));
    res.json({ ...f, createdAt: f.createdAt.toISOString(), departmentName: dept?.name, courseCount: Number(courseCount?.count ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/faculty/:id", async (req, res) => {
  try {
    const [f] = await db.update(facultyTable).set(req.body).where(eq(facultyTable.id, Number(req.params.id))).returning();
    if (!f) return res.status(404).json({ error: "Not found" });
    res.json({ ...f, createdAt: f.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/faculty/:id", async (req, res) => {
  try {
    await db.delete(facultyTable).where(eq(facultyTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
