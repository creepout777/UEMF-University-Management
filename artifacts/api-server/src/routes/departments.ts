import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { departmentsTable, facultyTable, studentsTable, coursesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/departments", async (req, res) => {
  try {
    const departments = await db.select().from(departmentsTable);
    const result = await Promise.all(
      departments.map(async (dept) => {
        const [studentCount] = await db.select({ count: count() }).from(studentsTable).where(eq(studentsTable.departmentId, dept.id));
        const [facultyCount] = await db.select({ count: count() }).from(facultyTable).where(eq(facultyTable.departmentId, dept.id));
        const [courseCount] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.departmentId, dept.id));
        let headFacultyName: string | undefined;
        if (dept.headFacultyId) {
          const [head] = await db.select().from(facultyTable).where(eq(facultyTable.id, dept.headFacultyId));
          if (head) headFacultyName = `${head.firstName} ${head.lastName}`;
        }
        return {
          ...dept,
          createdAt: dept.createdAt.toISOString(),
          headFacultyName,
          studentCount: Number(studentCount?.count ?? 0),
          facultyCount: Number(facultyCount?.count ?? 0),
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

router.post("/departments", async (req, res) => {
  try {
    const [dept] = await db.insert(departmentsTable).values(req.body).returning();
    res.status(201).json({ ...dept, createdAt: dept.createdAt.toISOString(), studentCount: 0, facultyCount: 0, courseCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/departments/:id", async (req, res) => {
  try {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, Number(req.params.id)));
    if (!dept) return res.status(404).json({ error: "Not found" });
    const [studentCount] = await db.select({ count: count() }).from(studentsTable).where(eq(studentsTable.departmentId, dept.id));
    const [facultyCount] = await db.select({ count: count() }).from(facultyTable).where(eq(facultyTable.departmentId, dept.id));
    const [courseCount] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.departmentId, dept.id));
    res.json({ ...dept, createdAt: dept.createdAt.toISOString(), studentCount: Number(studentCount?.count ?? 0), facultyCount: Number(facultyCount?.count ?? 0), courseCount: Number(courseCount?.count ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/departments/:id", async (req, res) => {
  try {
    const [dept] = await db.update(departmentsTable).set(req.body).where(eq(departmentsTable.id, Number(req.params.id))).returning();
    if (!dept) return res.status(404).json({ error: "Not found" });
    res.json({ ...dept, createdAt: dept.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/departments/:id", async (req, res) => {
  try {
    await db.delete(departmentsTable).where(eq(departmentsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
