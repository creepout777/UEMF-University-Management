import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, absencesTable, enrollmentsTable, coursesTable, schedulesTable, facultyTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { getStudentCourseIds } from "../lib/scopeFilter";

const router = Router();

const BOT_SECRET = process.env.TELEGRAM_BOT_SECRET ?? "uemf-telegram-secret-key";
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? "UemfManagementBot";

// Middleware to verify requests coming from the Telegram Bot (OpenClaw)
function requireBotSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-telegram-bot-secret"];
  if (!secret || secret !== BOT_SECRET) {
    res.status(401).json({ error: "Unauthorized Bot access" });
    return;
  }
  next();
}

/**
 * 1. Generate Link Token for Web App user
 * GET /api/telegram/link-token
 */
router.get("/telegram/link-token", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const token = `tg_link_${crypto.randomBytes(8).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.update(usersTable)
      .set({
        telegramLinkToken: token,
        telegramLinkExpires: expiresAt,
      })
      .where(eq(usersTable.id, user.userId));

    const botUrl = `https://t.me/${BOT_USERNAME}?start=${token}`;

    res.json({ token, botUrl, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 2. Verify Token and Link Telegram Chat ID
 * POST /api/telegram/verify
 */
router.post("/telegram/verify", requireBotSecret, async (req, res) => {
  try {
    const { token, chatId } = req.body;
    if (!token || !chatId) {
      res.status(400).json({ error: "Token and chatId are required" });
      return;
    }

    // Find user by valid unexpired token
    const now = new Date();
    const [user] = await db.select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.telegramLinkToken, token),
          gt(usersTable.telegramLinkExpires, now)
        )
      );

    if (!user) {
      res.status(404).json({ error: "Invalid or expired link token" });
      return;
    }

    // Link the chat ID and clear the token
    await db.update(usersTable)
      .set({
        telegramChatId: String(chatId),
        telegramLinkToken: null,
        telegramLinkExpires: null,
      })
      .where(eq(usersTable.id, user.id));

    res.json({
      success: true,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper: Get user by Telegram Chat ID
async function getUserByChatId(chatId: string) {
  const [user] = await db.select()
    .from(usersTable)
    .where(eq(usersTable.telegramChatId, chatId));
  return user;
}

/**
 * 3. Get Today's Planning
 * GET /api/telegram/planning/today?chatId=...
 */
router.get("/telegram/planning/today", requireBotSecret, async (req, res) => {
  try {
    const chatId = req.query.chatId as string;
    if (!chatId) {
      res.status(400).json({ error: "chatId query parameter required" });
      return;
    }

    const user = await getUserByChatId(chatId);
    if (!user) {
      res.status(404).json({ error: "No UEMF account linked to this Telegram account" });
      return;
    }

    // Determine day of week
    const todayName = new Date().toLocaleString("en-US", { weekday: "long" });

    // Fetch schedules
    let rows = await db.select().from(schedulesTable).where(eq(schedulesTable.dayOfWeek, todayName));

    const jwtUser = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      linkedEntityId: user.linkedEntityId ?? (user.role === "student" ? 1 : null),
    };

    if (user.role === "teacher") {
      rows = rows.filter((s) => s.facultyId === user.linkedEntityId);
    } else if (user.role === "student") {
      const courseIds = await getStudentCourseIds(jwtUser);
      if (courseIds.length === 0) return res.json({ today: todayName, schedules: [] });
      rows = rows.filter((s) => courseIds.includes(s.courseId));
    } else {
      return res.json({ today: todayName, schedules: [] });
    }

    const result = await Promise.all(
      rows.map(async (s) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, s.courseId));
        let facultyName: string | undefined;
        if (s.facultyId) {
          const [f] = await db.select().from(facultyTable).where(eq(facultyTable.id, s.facultyId));
          if (f) facultyName = `${f.firstName} ${f.lastName}`;
        }
        return {
          courseCode: course?.courseCode,
          courseName: course?.name,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          building: s.building,
          type: s.type,
          facultyName,
        };
      })
    );

    res.json({
      today: todayName,
      schedules: result.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 4. Get Week's Planning
 * GET /api/telegram/planning/week?chatId=...
 */
router.get("/telegram/planning/week", requireBotSecret, async (req, res) => {
  try {
    const chatId = req.query.chatId as string;
    if (!chatId) {
      res.status(400).json({ error: "chatId query parameter required" });
      return;
    }

    const user = await getUserByChatId(chatId);
    if (!user) {
      res.status(404).json({ error: "No UEMF account linked to this Telegram account" });
      return;
    }

    let rows = await db.select().from(schedulesTable);

    const jwtUser = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      linkedEntityId: user.linkedEntityId ?? (user.role === "student" ? 1 : null),
    };

    if (user.role === "teacher") {
      rows = rows.filter((s) => s.facultyId === user.linkedEntityId);
    } else if (user.role === "student") {
      const courseIds = await getStudentCourseIds(jwtUser);
      if (courseIds.length === 0) return res.json({ schedules: [] });
      rows = rows.filter((s) => courseIds.includes(s.courseId));
    } else {
      return res.json({ schedules: [] });
    }

    const result = await Promise.all(
      rows.map(async (s) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, s.courseId));
        let facultyName: string | undefined;
        if (s.facultyId) {
          const [f] = await db.select().from(facultyTable).where(eq(facultyTable.id, s.facultyId));
          if (f) facultyName = `${f.firstName} ${f.lastName}`;
        }
        return {
          dayOfWeek: s.dayOfWeek,
          courseCode: course?.courseCode,
          courseName: course?.name,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
          building: s.building,
          type: s.type,
          facultyName,
        };
      })
    );

    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    res.json({
      schedules: result.sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      }),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 5. Get Upcoming Exams
 * GET /api/telegram/exams?chatId=...
 */
router.get("/telegram/exams", requireBotSecret, async (req, res) => {
  try {
    const chatId = req.query.chatId as string;
    if (!chatId) {
      res.status(400).json({ error: "chatId query parameter required" });
      return;
    }

    const user = await getUserByChatId(chatId);
    if (!user) {
      res.status(404).json({ error: "No UEMF account linked to this Telegram account" });
      return;
    }

    const { examsTable } = await import("@workspace/db");
    const exams = await db.select().from(examsTable);

    // Filter exams by role if needed
    let filteredExams = exams;
    const jwtUser = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      linkedEntityId: user.linkedEntityId ?? (user.role === "student" ? 1 : null),
    };

    if (user.role === "teacher") {
      filteredExams = exams.filter((e) => e.facultyId === user.linkedEntityId);
    } else if (user.role === "student") {
      const courseIds = await getStudentCourseIds(jwtUser);
      filteredExams = exams.filter((e) => courseIds.includes(e.courseId));
    }

    const detailedExams = await Promise.all(
      filteredExams.map(async (e) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, e.courseId));
        return {
          id: e.id,
          title: e.title,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          room: e.room,
          courseCode: course?.courseCode,
          courseName: course?.name,
        };
      })
    );

    detailedExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({ exams: detailedExams });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 6. Get Student Progress
 * GET /api/telegram/progress?chatId=...
 */
router.get("/telegram/progress", requireBotSecret, async (req, res) => {
  try {
    const chatId = req.query.chatId as string;
    if (!chatId) {
      res.status(400).json({ error: "chatId query parameter required" });
      return;
    }

    const user = await getUserByChatId(chatId);
    if (!user) {
      res.status(404).json({ error: "No UEMF account linked to this Telegram account" });
      return;
    }

    if (user.role !== "student") {
      res.status(400).json({ error: "Progress tracking is only available for students" });
      return;
    }

    const studentId = user.linkedEntityId ?? 1;
    if (!studentId) {
      res.status(400).json({ error: "User is not correctly linked to a student record" });
      return;
    }

    const enrollments = await db.select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.studentId, studentId));

    const progressData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, enrollment.courseId));
        return {
          courseCode: course?.courseCode,
          courseName: course?.name,
          semester: enrollment.semester,
          status: enrollment.status,
          progressPercent: enrollment.progressPercent,
        };
      })
    );

    res.json({
      progress: progressData,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
