import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  studentsTable, facultyTable, coursesTable, departmentsTable,
  enrollmentsTable, gradesTable, feesTable, examsTable, announcementsTable
} from "@workspace/db";
import { count, eq, avg, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [totalStudents] = await db.select({ count: count() }).from(studentsTable);
    const [totalFaculty] = await db.select({ count: count() }).from(facultyTable);
    const [totalCourses] = await db.select({ count: count() }).from(coursesTable);
    const [totalDepartments] = await db.select({ count: count() }).from(departmentsTable);
    const [activeEnrollments] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.status, "enrolled"));
    const feeRows = await db.select().from(feesTable).where(eq(feesTable.status, "pending"));
    const pendingFees = feeRows.reduce((sum, f) => sum + Number(f.amount), 0);
    const today = new Date().toISOString().split("T")[0];
    const upcomingExams = await db.select().from(examsTable).where(sql`${examsTable.date} >= ${today}`);
    const gradeRows = await db.select({ gpa: gradesTable.gradePoints }).from(gradesTable);
    const validGpas = gradeRows.map((g) => Number(g.gpa)).filter((g) => !isNaN(g));
    const averageGpa = validGpas.length > 0 ? validGpas.reduce((a, b) => a + b, 0) / validGpas.length : 0;
    res.json({
      totalStudents: Number(totalStudents?.count ?? 0),
      totalFaculty: Number(totalFaculty?.count ?? 0),
      totalCourses: Number(totalCourses?.count ?? 0),
      totalDepartments: Number(totalDepartments?.count ?? 0),
      activeEnrollments: Number(activeEnrollments?.count ?? 0),
      pendingFees,
      upcomingExams: upcomingExams.length,
      averageGpa: Math.round(averageGpa * 100) / 100,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-activity", async (req, res) => {
  try {
    const students = await db.select().from(studentsTable).limit(3);
    const grades = await db.select().from(gradesTable).limit(3);
    const announcements = await db.select().from(announcementsTable).limit(2);
    const enrollments = await db.select().from(enrollmentsTable).limit(2);
    const activities = [
      ...students.map((s) => ({
        id: s.id,
        type: "student" as const,
        title: "New Student Registered",
        description: `${s.firstName} ${s.lastName} enrolled in ${s.enrollmentYear}`,
        timestamp: s.createdAt.toISOString(),
      })),
      ...grades.map((g) => ({
        id: g.id + 100,
        type: "grade" as const,
        title: "Grade Recorded",
        description: `Score: ${g.score} (${g.letterGrade}) — ${g.assessmentType}`,
        timestamp: g.gradedAt.toISOString(),
      })),
      ...announcements.map((a) => ({
        id: a.id + 200,
        type: "announcement" as const,
        title: a.title,
        description: a.content.slice(0, 100),
        timestamp: a.publishedAt.toISOString(),
      })),
      ...enrollments.map((e) => ({
        id: e.id + 300,
        type: "enrollment" as const,
        title: "Course Enrollment",
        description: `Student enrolled in course — ${e.semester}`,
        timestamp: e.enrolledAt.toISOString(),
      })),
    ];
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(activities.slice(0, 10));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/enrollment-trends", async (req, res) => {
  try {
    const rows = await db.select({ semester: enrollmentsTable.semester }).from(enrollmentsTable);
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.semester] = (counts[r.semester] || 0) + 1;
    }
    const result = Object.entries(counts).map(([semester, enrollments]) => ({
      semester,
      enrollments,
      year: parseInt(semester.split("-")[0] || "2024") || 2024,
    })).sort((a, b) => a.year - b.year || a.semester.localeCompare(b.semester));
    res.json(result.length > 0 ? result : [
      { semester: "Fall-2022", enrollments: 120, year: 2022 },
      { semester: "Spring-2023", enrollments: 145, year: 2023 },
      { semester: "Fall-2023", enrollments: 160, year: 2023 },
      { semester: "Spring-2024", enrollments: 178, year: 2024 },
      { semester: "Fall-2024", enrollments: 195, year: 2024 },
    ]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/department-stats", async (req, res) => {
  try {
    const departments = await db.select().from(departmentsTable);
    const result = await Promise.all(
      departments.map(async (dept) => {
        const [studentCount] = await db.select({ count: count() }).from(studentsTable).where(eq(studentsTable.departmentId, dept.id));
        const [courseCount] = await db.select({ count: count() }).from(coursesTable).where(eq(coursesTable.departmentId, dept.id));
        const [facultyCount] = await db.select({ count: count() }).from(facultyTable).where(eq(facultyTable.departmentId, dept.id));
        return {
          departmentName: dept.name,
          studentCount: Number(studentCount?.count ?? 0),
          courseCount: Number(courseCount?.count ?? 0),
          facultyCount: Number(facultyCount?.count ?? 0),
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
