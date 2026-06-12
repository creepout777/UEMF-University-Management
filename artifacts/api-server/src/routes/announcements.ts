import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/announcements", async (req, res) => {
  try {
    const rows = await db.select().from(announcementsTable);
    res.json(rows.map((a) => ({ ...a, publishedAt: a.publishedAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    const [a] = await db.insert(announcementsTable).values(req.body).returning();
    res.status(201).json({ ...a, publishedAt: a.publishedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/announcements/:id", async (req, res) => {
  try {
    const [a] = await db.update(announcementsTable).set(req.body).where(eq(announcementsTable.id, Number(req.params.id))).returning();
    if (!a) return res.status(404).json({ error: "Not found" });
    res.json({ ...a, publishedAt: a.publishedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    await db.delete(announcementsTable).where(eq(announcementsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
