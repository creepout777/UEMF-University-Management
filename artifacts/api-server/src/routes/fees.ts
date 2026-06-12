import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { feesTable, studentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/fees", async (req, res) => {
  try {
    const rows = await db.select().from(feesTable);
    const filtered = rows.filter((f) => {
      if (req.query.studentId && f.studentId !== Number(req.query.studentId)) return false;
      if (req.query.status && f.status !== req.query.status) return false;
      return true;
    });
    const result = await Promise.all(
      filtered.map(async (f) => {
        const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, f.studentId));
        return { ...f, amount: Number(f.amount), createdAt: f.createdAt.toISOString(), studentName: student ? `${student.firstName} ${student.lastName}` : undefined };
      })
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/fees", async (req, res) => {
  try {
    const [f] = await db.insert(feesTable).values({ ...req.body, amount: req.body.amount.toString() }).returning();
    res.status(201).json({ ...f, amount: Number(f.amount), createdAt: f.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/fees/:id", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.amount !== undefined) body.amount = body.amount.toString();
    const [f] = await db.update(feesTable).set(body).where(eq(feesTable.id, Number(req.params.id))).returning();
    if (!f) return res.status(404).json({ error: "Not found" });
    res.json({ ...f, amount: Number(f.amount), createdAt: f.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fees/stats", async (req, res) => {
  try {
    const rows = await db.select().from(feesTable);
    const totalCollected = rows.filter((f) => f.status === "paid").reduce((sum, f) => sum + Number(f.amount), 0);
    const totalPending = rows.filter((f) => f.status === "pending").reduce((sum, f) => sum + Number(f.amount), 0);
    const totalOverdue = rows.filter((f) => f.status === "overdue").reduce((sum, f) => sum + Number(f.amount), 0);
    const totalWaived = rows.filter((f) => f.status === "waived").reduce((sum, f) => sum + Number(f.amount), 0);
    const total = totalCollected + totalPending + totalOverdue;
    const collectionRate = total > 0 ? (totalCollected / total) * 100 : 0;
    res.json({ totalCollected, totalPending, totalOverdue, totalWaived, collectionRate: Math.round(collectionRate * 100) / 100 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
