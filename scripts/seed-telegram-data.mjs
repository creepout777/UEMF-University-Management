import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5433/uemf" });
await client.connect();

const q = (sql, params) => client.query(sql, params);

console.log("🌱 Seeding Absences and Progress data...");

// 1. Update enrollments to have random/realistic progress percentages
await q(`UPDATE enrollments SET progress_percent = 75 WHERE course_id = 1`);
await q(`UPDATE enrollments SET progress_percent = 40 WHERE course_id = 2`);
await q(`UPDATE enrollments SET progress_percent = 90 WHERE course_id = 5`);
await q(`UPDATE enrollments SET progress_percent = 15 WHERE course_id = 6`);
await q(`UPDATE enrollments SET progress_percent = 50 WHERE course_id = 12`);

// 2. Add some absences for Student 1 (Yasmine Ait Brahim)
const student1Id = 1;
const courseId1 = 1; // Introduction to Programming
const courseId2 = 12; // Calculus I

const absences = [
  { studentId: student1Id, courseId: courseId1, date: "2026-06-01 09:00:00", status: "unexcused", reason: null },
  { studentId: student1Id, courseId: courseId1, date: "2026-06-04 09:00:00", status: "excused", reason: "Medical certificate submitted" },
  { studentId: student1Id, courseId: courseId2, date: "2026-05-18 14:00:00", status: "unexcused", reason: null },
  { studentId: student1Id, courseId: courseId1, date: "2026-06-08 09:00:00", status: "unexcused", reason: null },
];

for (const a of absences) {
  await q(
    `INSERT INTO absences (student_id, course_id, date, status, reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [a.studentId, a.courseId, a.date, a.status, a.reason]
  );
}

console.log("✓ Absences and progress percentages seeded successfully!");
await client.end();
