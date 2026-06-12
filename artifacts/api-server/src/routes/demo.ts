import { Router, type IRouter } from "express";

type Row = Record<string, any> & { id: number };

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

const demoUsers = [
  { id: 1, username: "admin", password: "admin123", email: "admin@uemf.ma", role: "admin" as const, linkedEntityId: null },
  { id: 2, username: "administration", password: "admin456", email: "admin@uemf.ma", role: "administration" as const, linkedEntityId: null },
  { id: 3, username: "teacher", password: "teacher123", email: "teacher@uemf.ma", role: "teacher" as const, linkedEntityId: 1 },
  { id: 4, username: "student", password: "student123", email: "student@uemf.ma", role: "student" as const, linkedEntityId: 1 },
];

const departments: Row[] = [
  { id: 1, name: "Computer Science", code: "CS", description: "Software, AI, and distributed systems", building: "Innovation Hall", phone: "+212 535 000 101", email: "cs@uemf.ma", createdAt: now() },
  { id: 2, name: "Business Administration", code: "BUS", description: "Management, finance, and entrepreneurship", building: "Business School", phone: "+212 535 000 102", email: "business@uemf.ma", createdAt: now() },
  { id: 3, name: "Civil Engineering", code: "CE", description: "Infrastructure, design, and sustainability", building: "Engineering Center", phone: "+212 535 000 103", email: "civil@uemf.ma", createdAt: now() },
];

const faculty: Row[] = [
  { id: 1, employeeId: "FAC24001", firstName: "Amina", lastName: "Benali", email: "amina.benali@uemf.ma", phone: "+212 600 111 001", departmentId: 1, title: "professor", specialization: "Distributed Systems", officeLocation: "I-204", officeHours: "Tue 10:00-12:00", status: "active", createdAt: now() },
  { id: 2, employeeId: "FAC24002", firstName: "Youssef", lastName: "El Fassi", email: "youssef.elfassi@uemf.ma", phone: "+212 600 111 002", departmentId: 2, title: "associate_professor", specialization: "Corporate Finance", officeLocation: "B-118", officeHours: "Wed 14:00-16:00", status: "active", createdAt: now() },
  { id: 3, employeeId: "FAC24003", firstName: "Sara", lastName: "Mernissi", email: "sara.mernissi@uemf.ma", phone: "+212 600 111 003", departmentId: 3, title: "assistant_professor", specialization: "Sustainable Materials", officeLocation: "E-022", officeHours: "Thu 09:00-11:00", status: "active", createdAt: now() },
];

const students: Row[] = [
  { id: 1, studentId: "STU24001", firstName: "Nour", lastName: "Amrani", email: "nour.amrani@student.uemf.ma", phone: "+212 611 222 001", departmentId: 1, enrollmentYear: 2024, status: "active", gender: "female", nationality: "Moroccan", gpa: 3.7, createdAt: now() },
  { id: 2, studentId: "STU24002", firstName: "Mehdi", lastName: "Tazi", email: "mehdi.tazi@student.uemf.ma", phone: "+212 611 222 002", departmentId: 2, enrollmentYear: 2023, status: "active", gender: "male", nationality: "Moroccan", gpa: 3.3, createdAt: now() },
  { id: 3, studentId: "STU24003", firstName: "Lina", lastName: "Berrada", email: "lina.berrada@student.uemf.ma", phone: "+212 611 222 003", departmentId: 3, enrollmentYear: 2022, status: "active", gender: "female", nationality: "Moroccan", gpa: 3.9, createdAt: now() },
  { id: 4, studentId: "STU24004", firstName: "Adam", lastName: "Rhani", email: "adam.rhani@student.uemf.ma", phone: "+212 611 222 004", departmentId: 1, enrollmentYear: 2024, status: "active", gender: "male", nationality: "Moroccan", gpa: 3.4, createdAt: now() },
];

const courses: Row[] = [
  { id: 1, courseCode: "CS301", name: "Distributed Applications", description: "Services, APIs, and scalable deployment", credits: 4, departmentId: 1, facultyId: 1, maxStudents: 40, semester: "Spring-2026", level: "undergraduate", createdAt: now() },
  { id: 2, courseCode: "BUS210", name: "Financial Management", description: "Budgeting, valuation, and reporting", credits: 3, departmentId: 2, facultyId: 2, maxStudents: 50, semester: "Spring-2026", level: "undergraduate", createdAt: now() },
  { id: 3, courseCode: "CE220", name: "Structural Analysis", description: "Frames, loads, and construction systems", credits: 4, departmentId: 3, facultyId: 3, maxStudents: 35, semester: "Spring-2026", level: "undergraduate", createdAt: now() },
];

const enrollments: Row[] = [
  { id: 1, studentId: 1, courseId: 1, semester: "Spring-2026", enrolledAt: now(), status: "enrolled" },
  { id: 2, studentId: 4, courseId: 1, semester: "Spring-2026", enrolledAt: now(), status: "enrolled" },
  { id: 3, studentId: 2, courseId: 2, semester: "Spring-2026", enrolledAt: now(), status: "enrolled" },
  { id: 4, studentId: 3, courseId: 3, semester: "Spring-2026", enrolledAt: now(), status: "enrolled" },
];

const grades: Row[] = [
  { id: 1, studentId: 1, courseId: 1, score: 92, letterGrade: "A-", gradePoints: 3.7, semester: "Spring-2026", assessmentType: "midterm", comments: "Strong system design work", gradedAt: now() },
  { id: 2, studentId: 2, courseId: 2, score: 86, letterGrade: "B+", gradePoints: 3.3, semester: "Spring-2026", assessmentType: "assignment", comments: "Clear financial model", gradedAt: now() },
  { id: 3, studentId: 3, courseId: 3, score: 95, letterGrade: "A", gradePoints: 4.0, semester: "Spring-2026", assessmentType: "exam", comments: "Excellent analysis", gradedAt: now() },
];

const schedules: Row[] = [
  { id: 1, courseId: 1, facultyId: 1, dayOfWeek: "monday", startTime: "09:00", endTime: "10:30", room: "I-301", building: "Innovation Hall", semester: "Spring-2026", type: "lecture", createdAt: now() },
  { id: 2, courseId: 2, facultyId: 2, dayOfWeek: "wednesday", startTime: "11:00", endTime: "12:30", room: "B-204", building: "Business School", semester: "Spring-2026", type: "seminar", createdAt: now() },
  { id: 3, courseId: 3, facultyId: 3, dayOfWeek: "thursday", startTime: "14:00", endTime: "15:30", room: "E-110", building: "Engineering Center", semester: "Spring-2026", type: "lab", createdAt: now() },
];

const exams: Row[] = [
  { id: 1, courseId: 1, title: "Distributed Applications Midterm", type: "midterm", date: today(), startTime: "10:00", endTime: "12:00", room: "I-301", semester: "Spring-2026", totalMarks: 100, instructions: "Bring laptop and student ID", createdAt: now() },
  { id: 2, courseId: 2, title: "Financial Management Final", type: "final", date: "2026-06-12", startTime: "09:00", endTime: "11:00", room: "B-101", semester: "Spring-2026", totalMarks: 100, instructions: "Calculator allowed", createdAt: now() },
  { id: 3, courseId: 3, title: "Structural Analysis Quiz", type: "quiz", date: "2026-06-03", startTime: "15:00", endTime: "16:00", room: "E-110", semester: "Spring-2026", totalMarks: 20, instructions: "Closed book", createdAt: now() },
];

const fees: Row[] = [
  { id: 1, studentId: 1, amount: 18000, feeType: "tuition", dueDate: "2026-06-01", paidDate: null, status: "pending", academicYear: "2025-2026", semester: "Spring-2026", description: "Tuition fee", createdAt: now() },
  { id: 2, studentId: 2, amount: 22000, feeType: "tuition", dueDate: "2026-05-20", paidDate: "2026-05-01", status: "paid", academicYear: "2025-2026", semester: "Spring-2026", description: "Tuition fee", createdAt: now() },
  { id: 3, studentId: 3, amount: 5500, feeType: "lab", dueDate: "2026-04-15", paidDate: null, status: "overdue", academicYear: "2025-2026", semester: "Spring-2026", description: "Lab fee", createdAt: now() },
];

const announcements: Row[] = [
  { id: 1, title: "Spring Exam Schedule Published", content: "The finalized spring examination schedule is now available for all departments.", category: "academic", priority: "high", authorId: 1, targetAudience: "students", expiresAt: "2026-06-30", isActive: true, publishedAt: now(), createdAt: now() },
  { id: 2, title: "Innovation Week Registration", content: "Students can register for project demos, startup workshops, and research talks.", category: "event", priority: "medium", authorId: 1, targetAudience: "all", expiresAt: "2026-06-10", isActive: true, publishedAt: now(), createdAt: now() },
];

const tables: Record<string, Row[]> = { departments, faculty, students, courses, enrollments, grades, schedules, exams, fees, announcements };

function nextId(rows: Row[]) {
  return Math.max(0, ...rows.map((row) => row.id)) + 1;
}

function departmentName(id: number) {
  return departments.find((dept) => dept.id === id)?.name;
}

function facultyName(id?: number | null) {
  const member = faculty.find((item) => item.id === id);
  return member ? `${member.firstName} ${member.lastName}` : undefined;
}

function studentName(id?: number | null) {
  const student = students.find((item) => item.id === id);
  return student ? `${student.firstName} ${student.lastName}` : undefined;
}

function course(id?: number | null) {
  return courses.find((item) => item.id === id);
}

function withStudent(row: Row) {
  return { ...row, studentName: studentName(row.studentId) };
}

function withCourse(row: Row) {
  const found = course(row.courseId);
  return { ...row, courseName: found?.name, courseCode: found?.courseCode };
}

function listRows(name: string, query: Record<string, any>) {
  const rows = tables[name].filter((row) => {
    if (query.departmentId && row.departmentId !== Number(query.departmentId)) return false;
    if (query.studentId && row.studentId !== Number(query.studentId)) return false;
    if (query.status && row.status !== query.status) return false;
    if (query.semester && row.semester !== query.semester) return false;
    if (query.search) {
      const q = String(query.search).toLowerCase();
      const haystack = Object.values(row).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return rows.map((row) => {
    if (name === "students") return { ...row, departmentName: departmentName(row.departmentId) };
    if (name === "courses") return { ...row, departmentName: departmentName(row.departmentId), facultyName: facultyName(row.facultyId), enrolledCount: enrollments.filter((enrollment) => enrollment.courseId === row.id).length };
    if (name === "faculty") return { ...row, departmentName: departmentName(row.departmentId), courseCount: courses.filter((item) => item.facultyId === row.id).length };
    if (name === "departments") return { ...row, studentCount: students.filter((item) => item.departmentId === row.id).length, facultyCount: faculty.filter((item) => item.departmentId === row.id).length, courseCount: courses.filter((item) => item.departmentId === row.id).length };
    if (name === "enrollments") return withCourse(withStudent(row));
    if (name === "grades") return withCourse(withStudent(row));
    if (name === "schedules") return { ...withCourse(row), facultyName: facultyName(row.facultyId) };
    if (name === "exams") return withCourse(row);
    if (name === "fees") return withStudent(row);
    return row;
  });
}

function upsertBody(name: string, body: Record<string, any>) {
  if (name === "students" && !body.studentId) {
    body.studentId = `STU26${String(nextId(students)).padStart(3, "0")}`;
  }
  if (name === "faculty" && !body.employeeId) {
    body.employeeId = `FAC26${String(nextId(faculty)).padStart(3, "0")}`;
  }
  return body;
}

function decodeToken(header?: string | null) {
  if (!header?.startsWith("Bearer ")) return null;
  const raw = header.slice(7);
  if (!raw.startsWith("demo:")) return null;
  const username = raw.slice(5);
  return demoUsers.find((user) => user.username === username) ?? null;
}

const demoRouter: IRouter = Router();

demoRouter.get("/healthz", (_req, res) => res.json({ status: "ok" }));

demoRouter.post("/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const user = demoUsers.find((item) => item.username === username && item.password === password);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = `demo:${user.username}`;
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      linkedEntityId: user.linkedEntityId,
    },
  });
});

demoRouter.get("/auth/me", (req, res) => {
  const user = decodeToken(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      linkedEntityId: user.linkedEntityId,
    },
  });
});

demoRouter.get("/dashboard/stats", (_req, res) => {
  const pendingFees = fees.filter((fee) => fee.status === "pending").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const averageGpa = students.reduce((sum, student) => sum + Number(student.gpa ?? 0), 0) / students.length;
  res.json({
    totalStudents: students.length,
    totalFaculty: faculty.length,
    totalCourses: courses.length,
    totalDepartments: departments.length,
    activeEnrollments: enrollments.filter((item) => item.status === "enrolled").length,
    pendingFees,
    upcomingExams: exams.filter((exam) => exam.date >= today()).length,
    averageGpa: Math.round(averageGpa * 100) / 100,
  });
});

demoRouter.get("/dashboard/recent-activity", (_req, res) => {
  res.json([
    ...students.slice(0, 3).map((student) => ({ id: student.id, type: "student", title: "Student Registered", description: `${student.firstName} ${student.lastName} joined ${departmentName(student.departmentId)}`, timestamp: student.createdAt })),
    ...grades.slice(0, 3).map((grade) => ({ id: grade.id + 100, type: "grade", title: "Grade Recorded", description: `${studentName(grade.studentId)} scored ${grade.score} in ${course(grade.courseId)?.name}`, timestamp: grade.gradedAt })),
    ...announcements.slice(0, 2).map((announcement) => ({ id: announcement.id + 200, type: "announcement", title: announcement.title, description: announcement.content, timestamp: announcement.publishedAt })),
  ]);
});

demoRouter.get("/dashboard/enrollment-trends", (_req, res) => {
  res.json([
    { semester: "Fall-2024", enrollments: 120, year: 2024 },
    { semester: "Spring-2025", enrollments: 145, year: 2025 },
    { semester: "Fall-2025", enrollments: 168, year: 2025 },
    { semester: "Spring-2026", enrollments: enrollments.length * 42, year: 2026 },
  ]);
});

demoRouter.get("/dashboard/department-stats", (_req, res) => {
  res.json(listRows("departments", {}).map((dept) => ({
    departmentName: dept.name,
    studentCount: dept.studentCount,
    courseCount: dept.courseCount,
    facultyCount: dept.facultyCount,
  })));
});

demoRouter.get("/fees/stats", (_req, res) => {
  const totalCollected = fees.filter((fee) => fee.status === "paid").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const totalPending = fees.filter((fee) => fee.status === "pending").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const totalOverdue = fees.filter((fee) => fee.status === "overdue").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const totalWaived = fees.filter((fee) => fee.status === "waived").reduce((sum, fee) => sum + Number(fee.amount), 0);
  const billable = totalCollected + totalPending + totalOverdue;
  res.json({
    totalCollected,
    totalPending,
    totalOverdue,
    totalWaived,
    collectionRate: billable > 0 ? Math.round((totalCollected / billable) * 10000) / 100 : 0,
  });
});

for (const name of Object.keys(tables)) {
  demoRouter.get(`/${name}`, (req, res) => res.json(listRows(name, req.query)));
  demoRouter.post(`/${name}`, (req, res) => {
    const rows = tables[name];
    const row = { id: nextId(rows), ...upsertBody(name, req.body), createdAt: req.body.createdAt ?? now() };
    rows.push(row);
    res.status(201).json(listRows(name, {}).find((item) => item.id === row.id) ?? row);
  });
  demoRouter.get(`/${name}/:id`, (req, res) => {
    const row = listRows(name, {}).find((item) => item.id === Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
  demoRouter.put(`/${name}/:id`, (req, res) => {
    const rows = tables[name];
    const index = rows.findIndex((row) => row.id === Number(req.params.id));
    if (index < 0) return res.status(404).json({ error: "Not found" });
    rows[index] = { ...rows[index], ...upsertBody(name, req.body) };
    res.json(listRows(name, {}).find((item) => item.id === rows[index].id) ?? rows[index]);
  });
  demoRouter.delete(`/${name}/:id`, (_req, res) => {
    res.status(204).send();
  });
}

demoRouter.get("/students/:id/grades", (req, res) => {
  res.json(listRows("grades", {}).filter((grade) => grade.studentId === Number(req.params.id)));
});

demoRouter.get("/students/:id/enrollments", (req, res) => {
  res.json(listRows("enrollments", {}).filter((enrollment) => enrollment.studentId === Number(req.params.id)));
});

export default demoRouter;
