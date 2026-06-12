import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Helper
const q = (sql, params) => client.query(sql, params);

console.log("🌱 Seeding UEMF database...\n");

// ── 1. Departments ──────────────────────────────────────────────────────
console.log("📁 Seeding departments...");
const depts = [
  { name: "Computer Science & Engineering", code: "CSE", description: "Department of Computer Science, AI, and Software Engineering", building: "Building A", phone: "+212-535-001001", email: "cse@uemf.ma" },
  { name: "Electrical & Electronics Engineering", code: "EEE", description: "Department of Electrical, Electronics and Embedded Systems", building: "Building B", phone: "+212-535-001002", email: "eee@uemf.ma" },
  { name: "Business Administration", code: "BBA", description: "Department of Business, Management and Finance", building: "Building C", phone: "+212-535-001003", email: "bba@uemf.ma" },
  { name: "Civil Engineering", code: "CE", description: "Department of Civil Engineering and Construction", building: "Building D", phone: "+212-535-001004", email: "ce@uemf.ma" },
  { name: "Applied Mathematics", code: "MATH", description: "Department of Applied Mathematics and Statistics", building: "Building A", phone: "+212-535-001005", email: "math@uemf.ma" },
  { name: "Architecture & Design", code: "ARCH", description: "Department of Architecture, Urban Planning and Design", building: "Building E", phone: "+212-535-001006", email: "arch@uemf.ma" },
];
for (const d of depts) {
  await q(
    `INSERT INTO departments (name, code, description, building, phone, email)
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (code) DO NOTHING`,
    [d.name, d.code, d.description, d.building, d.phone, d.email]
  );
}
console.log(`  ✓ ${depts.length} departments`);

// ── 2. Faculty ──────────────────────────────────────────────────────────
console.log("👨‍🏫 Seeding faculty...");
const faculty = [
  { employeeId: "FAC-001", firstName: "Ahmed",    lastName: "Benali",     email: "a.benali@uemf.ma",    phone: "+212-661-100001", departmentId: 1, title: "Professor",           specialization: "Artificial Intelligence",        officeLocation: "A-201", officeHours: "Mon/Wed 10:00-12:00" },
  { employeeId: "FAC-002", firstName: "Fatima",   lastName: "El Amrani",  email: "f.elamrani@uemf.ma",  phone: "+212-661-100002", departmentId: 1, title: "Associate Professor", specialization: "Software Engineering",           officeLocation: "A-205", officeHours: "Tue/Thu 14:00-16:00" },
  { employeeId: "FAC-003", firstName: "Youssef",  lastName: "Tazi",       email: "y.tazi@uemf.ma",      phone: "+212-661-100003", departmentId: 2, title: "Professor",           specialization: "Power Systems",                 officeLocation: "B-102", officeHours: "Mon/Wed 09:00-11:00" },
  { employeeId: "FAC-004", firstName: "Nadia",    lastName: "Chafik",     email: "n.chafik@uemf.ma",    phone: "+212-661-100004", departmentId: 3, title: "Associate Professor", specialization: "Financial Management",           officeLocation: "C-305", officeHours: "Tue/Thu 10:00-12:00" },
  { employeeId: "FAC-005", firstName: "Khalid",   lastName: "Mansouri",   email: "k.mansouri@uemf.ma",  phone: "+212-661-100005", departmentId: 4, title: "Professor",           specialization: "Structural Engineering",         officeLocation: "D-110", officeHours: "Mon/Wed 14:00-16:00" },
  { employeeId: "FAC-006", firstName: "Sara",     lastName: "Bouazza",    email: "s.bouazza@uemf.ma",   phone: "+212-661-100006", departmentId: 5, title: "Assistant Professor", specialization: "Probability & Statistics",       officeLocation: "A-310", officeHours: "Wed/Fri 09:00-11:00" },
  { employeeId: "FAC-007", firstName: "Omar",     lastName: "Lahlou",     email: "o.lahlou@uemf.ma",    phone: "+212-661-100007", departmentId: 6, title: "Professor",           specialization: "Sustainable Architecture",       officeLocation: "E-201", officeHours: "Tue/Thu 09:00-11:00" },
  { employeeId: "FAC-008", firstName: "Amina",    lastName: "Hajji",      email: "a.hajji@uemf.ma",     phone: "+212-661-100008", departmentId: 1, title: "Lecturer",            specialization: "Cybersecurity",                 officeLocation: "A-208", officeHours: "Mon/Fri 10:00-12:00" },
  { employeeId: "FAC-009", firstName: "Rachid",   lastName: "Oukacha",    email: "r.oukacha@uemf.ma",   phone: "+212-661-100009", departmentId: 2, title: "Associate Professor", specialization: "Embedded Systems",               officeLocation: "B-205", officeHours: "Wed/Fri 14:00-16:00" },
  { employeeId: "FAC-010", firstName: "Laila",    lastName: "Zerhouni",   email: "l.zerhouni@uemf.ma",  phone: "+212-661-100010", departmentId: 3, title: "Lecturer",            specialization: "Marketing",                     officeLocation: "C-210", officeHours: "Tue/Thu 14:00-16:00" },
];
for (const f of faculty) {
  await q(
    `INSERT INTO faculty (employee_id, first_name, last_name, email, phone, department_id, title, specialization, office_location, office_hours, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active') ON CONFLICT (employee_id) DO NOTHING`,
    [f.employeeId, f.firstName, f.lastName, f.email, f.phone, f.departmentId, f.title, f.specialization, f.officeLocation, f.officeHours]
  );
}
console.log(`  ✓ ${faculty.length} faculty members`);

// ── 3. Students ─────────────────────────────────────────────────────────
console.log("🎓 Seeding students...");
const students = [
  { studentId: "STU-2024-001", firstName: "Yasmine",  lastName: "Ait Brahim",  email: "y.aitbrahim@etu.uemf.ma",  phone: "+212-662-200001", dob: "2002-03-15", gender: "Female", nationality: "Moroccan", address: "Fès, Morocco",         deptId: 1, year: 2024, gpa: "3.75" },
  { studentId: "STU-2024-002", firstName: "Mehdi",     lastName: "Fassi",       email: "m.fassi@etu.uemf.ma",      phone: "+212-662-200002", dob: "2001-07-22", gender: "Male",   nationality: "Moroccan", address: "Meknès, Morocco",      deptId: 1, year: 2024, gpa: "3.50" },
  { studentId: "STU-2023-003", firstName: "Imane",     lastName: "Kettani",     email: "i.kettani@etu.uemf.ma",    phone: "+212-662-200003", dob: "2001-11-08", gender: "Female", nationality: "Moroccan", address: "Casablanca, Morocco",   deptId: 2, year: 2023, gpa: "3.85" },
  { studentId: "STU-2023-004", firstName: "Amine",     lastName: "Berrada",     email: "a.berrada@etu.uemf.ma",    phone: "+212-662-200004", dob: "2002-01-30", gender: "Male",   nationality: "Moroccan", address: "Rabat, Morocco",       deptId: 3, year: 2023, gpa: "3.20" },
  { studentId: "STU-2024-005", firstName: "Salma",     lastName: "Tounsi",      email: "s.tounsi@etu.uemf.ma",     phone: "+212-662-200005", dob: "2003-05-14", gender: "Female", nationality: "Tunisian", address: "Tunis, Tunisia",       deptId: 1, year: 2024, gpa: "3.90" },
  { studentId: "STU-2023-006", firstName: "Hamza",     lastName: "El Idrissi",  email: "h.elidrissi@etu.uemf.ma",  phone: "+212-662-200006", dob: "2001-09-02", gender: "Male",   nationality: "Moroccan", address: "Tanger, Morocco",      deptId: 4, year: 2023, gpa: "3.10" },
  { studentId: "STU-2024-007", firstName: "Khadija",   lastName: "Mouline",     email: "k.mouline@etu.uemf.ma",    phone: "+212-662-200007", dob: "2002-12-19", gender: "Female", nationality: "Moroccan", address: "Oujda, Morocco",       deptId: 5, year: 2024, gpa: "3.65" },
  { studentId: "STU-2022-008", firstName: "Zakaria",   lastName: "Bouzidi",     email: "z.bouzidi@etu.uemf.ma",    phone: "+212-662-200008", dob: "2000-04-11", gender: "Male",   nationality: "Moroccan", address: "Marrakech, Morocco",   deptId: 6, year: 2022, gpa: "3.40" },
  { studentId: "STU-2024-009", firstName: "Nour",      lastName: "Alaoui",      email: "n.alaoui@etu.uemf.ma",     phone: "+212-662-200009", dob: "2003-08-25", gender: "Female", nationality: "Moroccan", address: "Agadir, Morocco",      deptId: 2, year: 2024, gpa: "3.55" },
  { studentId: "STU-2023-010", firstName: "Yassir",    lastName: "Chraibi",     email: "y.chraibi@etu.uemf.ma",    phone: "+212-662-200010", dob: "2002-02-07", gender: "Male",   nationality: "Moroccan", address: "Fès, Morocco",         deptId: 3, year: 2023, gpa: "2.95" },
  { studentId: "STU-2024-011", firstName: "Hiba",      lastName: "Bennani",     email: "h.bennani@etu.uemf.ma",    phone: "+212-662-200011", dob: "2003-06-30", gender: "Female", nationality: "Moroccan", address: "Kenitra, Morocco",     deptId: 1, year: 2024, gpa: "3.80" },
  { studentId: "STU-2022-012", firstName: "Othmane",   lastName: "Filali",      email: "o.filali@etu.uemf.ma",     phone: "+212-662-200012", dob: "2000-10-17", gender: "Male",   nationality: "Moroccan", address: "Settat, Morocco",      deptId: 4, year: 2022, gpa: "3.30" },
  { studentId: "STU-2023-013", firstName: "Rania",     lastName: "Sqalli",      email: "r.sqalli@etu.uemf.ma",     phone: "+212-662-200013", dob: "2001-01-25", gender: "Female", nationality: "Moroccan", address: "Tetouan, Morocco",     deptId: 5, year: 2023, gpa: "3.70" },
  { studentId: "STU-2024-014", firstName: "Adam",      lastName: "Zniber",      email: "a.zniber@etu.uemf.ma",     phone: "+212-662-200014", dob: "2003-11-03", gender: "Male",   nationality: "Moroccan", address: "Fès, Morocco",         deptId: 6, year: 2024, gpa: "3.45" },
  { studentId: "STU-2023-015", firstName: "Lina",      lastName: "Benkirane",   email: "l.benkirane@etu.uemf.ma",  phone: "+212-662-200015", dob: "2002-07-12", gender: "Female", nationality: "Moroccan", address: "Casablanca, Morocco",   deptId: 2, year: 2023, gpa: "3.60" },
];
for (const s of students) {
  await q(
    `INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, nationality, address, department_id, enrollment_year, status, gpa)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',$12) ON CONFLICT (student_id) DO NOTHING`,
    [s.studentId, s.firstName, s.lastName, s.email, s.phone, s.dob, s.gender, s.nationality, s.address, s.deptId, s.year, s.gpa]
  );
}
console.log(`  ✓ ${students.length} students`);

// ── 4. Courses ──────────────────────────────────────────────────────────
console.log("📚 Seeding courses...");
const courses = [
  { code: "CSE101", name: "Introduction to Programming",         desc: "Fundamentals of programming using Python",                  credits: 4, deptId: 1, facId: 1, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "CSE201", name: "Data Structures & Algorithms",        desc: "Core data structures and algorithm design",                 credits: 4, deptId: 1, facId: 2, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "CSE301", name: "Artificial Intelligence",             desc: "Foundations of AI: search, knowledge, learning",            credits: 3, deptId: 1, facId: 1, semester: "Spring 2026", level: "Undergraduate" },
  { code: "CSE401", name: "Cybersecurity Fundamentals",          desc: "Network security, encryption, and threat modeling",         credits: 3, deptId: 1, facId: 8, semester: "Spring 2026", level: "Undergraduate" },
  { code: "EEE101", name: "Circuit Analysis",                    desc: "Fundamentals of DC and AC circuit analysis",                credits: 4, deptId: 2, facId: 3, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "EEE201", name: "Embedded Systems Design",             desc: "Microcontroller programming and system design",             credits: 3, deptId: 2, facId: 9, semester: "Spring 2026", level: "Undergraduate" },
  { code: "BBA101", name: "Principles of Management",            desc: "Introduction to management theory and practice",            credits: 3, deptId: 3, facId: 4, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "BBA201", name: "Financial Accounting",                desc: "Fundamentals of financial reporting and analysis",           credits: 3, deptId: 3, facId: 4, semester: "Spring 2026", level: "Undergraduate" },
  { code: "BBA301", name: "Marketing Strategy",                  desc: "Strategic marketing planning and implementation",            credits: 3, deptId: 3, facId: 10,semester: "Fall 2025",   level: "Undergraduate" },
  { code: "CE101",  name: "Engineering Mechanics",               desc: "Statics and dynamics for civil engineers",                  credits: 4, deptId: 4, facId: 5, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "CE201",  name: "Structural Analysis",                 desc: "Analysis of beams, trusses and frames",                    credits: 3, deptId: 4, facId: 5, semester: "Spring 2026", level: "Undergraduate" },
  { code: "MATH101",name: "Calculus I",                          desc: "Limits, derivatives and integrals",                        credits: 4, deptId: 5, facId: 6, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "MATH201",name: "Probability & Statistics",            desc: "Probability theory, distributions, and statistical methods",credits: 3, deptId: 5, facId: 6, semester: "Spring 2026", level: "Undergraduate" },
  { code: "ARCH101",name: "Architectural Design Studio I",       desc: "Introduction to design thinking and spatial composition",   credits: 5, deptId: 6, facId: 7, semester: "Fall 2025",   level: "Undergraduate" },
  { code: "ARCH201",name: "History of Architecture",             desc: "Survey of architectural history from antiquity to modern",  credits: 3, deptId: 6, facId: 7, semester: "Spring 2026", level: "Undergraduate" },
];
for (const c of courses) {
  await q(
    `INSERT INTO courses (course_code, name, description, credits, department_id, faculty_id, max_students, semester, level)
     VALUES ($1,$2,$3,$4,$5,$6,40,$7,$8) ON CONFLICT (course_code) DO NOTHING`,
    [c.code, c.name, c.desc, c.credits, c.deptId, c.facId, c.semester, c.level]
  );
}
console.log(`  ✓ ${courses.length} courses`);

// ── 5. Enrollments ──────────────────────────────────────────────────────
console.log("📝 Seeding enrollments...");
const enrollments = [
  // CSE students → CSE courses
  { studentId: 1,  courseId: 1,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 1,  courseId: 2,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 2,  courseId: 1,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 2,  courseId: 3,  semester: "Spring 2026", status: "enrolled" },
  { studentId: 5,  courseId: 1,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 5,  courseId: 4,  semester: "Spring 2026", status: "enrolled" },
  { studentId: 11, courseId: 2,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 11, courseId: 3,  semester: "Spring 2026", status: "enrolled" },
  // EEE students
  { studentId: 3,  courseId: 5,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 3,  courseId: 6,  semester: "Spring 2026", status: "enrolled" },
  { studentId: 9,  courseId: 5,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 15, courseId: 5,  semester: "Fall 2025",   status: "enrolled" },
  // BBA students
  { studentId: 4,  courseId: 7,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 4,  courseId: 8,  semester: "Spring 2026", status: "enrolled" },
  { studentId: 10, courseId: 7,  semester: "Fall 2025",   status: "enrolled" },
  { studentId: 10, courseId: 9,  semester: "Fall 2025",   status: "enrolled" },
  // CE students
  { studentId: 6,  courseId: 10, semester: "Fall 2025",   status: "enrolled" },
  { studentId: 6,  courseId: 11, semester: "Spring 2026", status: "enrolled" },
  { studentId: 12, courseId: 10, semester: "Fall 2025",   status: "enrolled" },
  // MATH students
  { studentId: 7,  courseId: 12, semester: "Fall 2025",   status: "enrolled" },
  { studentId: 7,  courseId: 13, semester: "Spring 2026", status: "enrolled" },
  { studentId: 13, courseId: 12, semester: "Fall 2025",   status: "enrolled" },
  // ARCH students
  { studentId: 8,  courseId: 14, semester: "Fall 2025",   status: "enrolled" },
  { studentId: 8,  courseId: 15, semester: "Spring 2026", status: "enrolled" },
  { studentId: 14, courseId: 14, semester: "Fall 2025",   status: "enrolled" },
  // Cross-department (math for CS students)
  { studentId: 1,  courseId: 12, semester: "Fall 2025",   status: "enrolled" },
  { studentId: 5,  courseId: 12, semester: "Fall 2025",   status: "enrolled" },
];
for (const e of enrollments) {
  await q(
    `INSERT INTO enrollments (student_id, course_id, semester, status)
     VALUES ($1,$2,$3,$4)`,
    [e.studentId, e.courseId, e.semester, e.status]
  );
}
console.log(`  ✓ ${enrollments.length} enrollments`);

// ── 6. Grades ───────────────────────────────────────────────────────────
console.log("📊 Seeding grades...");
const grades = [
  { studentId: 1,  courseId: 1,  score: "92.50", letter: "A",  points: "4.00", semester: "Fall 2025",   type: "Final",   comments: "Excellent work" },
  { studentId: 1,  courseId: 2,  score: "88.00", letter: "A-", points: "3.70", semester: "Fall 2025",   type: "Midterm", comments: "Strong performance" },
  { studentId: 2,  courseId: 1,  score: "85.00", letter: "B+", points: "3.30", semester: "Fall 2025",   type: "Final",   comments: "Good understanding" },
  { studentId: 3,  courseId: 5,  score: "95.00", letter: "A+", points: "4.00", semester: "Fall 2025",   type: "Final",   comments: "Outstanding" },
  { studentId: 4,  courseId: 7,  score: "78.00", letter: "B",  points: "3.00", semester: "Fall 2025",   type: "Midterm", comments: "Solid effort" },
  { studentId: 5,  courseId: 1,  score: "97.50", letter: "A+", points: "4.00", semester: "Fall 2025",   type: "Final",   comments: "Top of the class" },
  { studentId: 6,  courseId: 10, score: "82.00", letter: "B+", points: "3.30", semester: "Fall 2025",   type: "Final",   comments: "Good practical skills" },
  { studentId: 7,  courseId: 12, score: "90.00", letter: "A",  points: "4.00", semester: "Fall 2025",   type: "Midterm", comments: "Very strong in proofs" },
  { studentId: 8,  courseId: 14, score: "87.50", letter: "A-", points: "3.70", semester: "Fall 2025",   type: "Final",   comments: "Creative designs" },
  { studentId: 9,  courseId: 5,  score: "73.00", letter: "B-", points: "2.70", semester: "Fall 2025",   type: "Final",   comments: "Needs improvement in labs" },
  { studentId: 10, courseId: 7,  score: "68.00", letter: "C+", points: "2.30", semester: "Fall 2025",   type: "Midterm", comments: "Review fundamentals" },
  { studentId: 11, courseId: 2,  score: "91.00", letter: "A",  points: "4.00", semester: "Fall 2025",   type: "Final",   comments: "Excellent algorithms" },
  { studentId: 12, courseId: 10, score: "80.00", letter: "B",  points: "3.00", semester: "Fall 2025",   type: "Final",   comments: "Consistent performance" },
  { studentId: 13, courseId: 12, score: "94.00", letter: "A",  points: "4.00", semester: "Fall 2025",   type: "Midterm", comments: "Exceptional" },
  { studentId: 14, courseId: 14, score: "86.00", letter: "A-", points: "3.70", semester: "Fall 2025",   type: "Final",   comments: "Strong design sense" },
  { studentId: 15, courseId: 5,  score: "89.00", letter: "A-", points: "3.70", semester: "Fall 2025",   type: "Final",   comments: "Great lab reports" },
];
for (const g of grades) {
  await q(
    `INSERT INTO grades (student_id, course_id, score, letter_grade, grade_points, semester, assessment_type, comments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [g.studentId, g.courseId, g.score, g.letter, g.points, g.semester, g.type, g.comments]
  );
}
console.log(`  ✓ ${grades.length} grades`);

// ── 7. Schedules ────────────────────────────────────────────────────────
console.log("📅 Seeding schedules...");
const schedules = [
  { courseId: 1,  facId: 1,  day: "Monday",    start: "08:30", end: "10:00", room: "A-101", building: "Building A", semester: "Fall 2025",   type: "lecture" },
  { courseId: 1,  facId: 1,  day: "Wednesday", start: "08:30", end: "10:00", room: "A-101", building: "Building A", semester: "Fall 2025",   type: "lecture" },
  { courseId: 1,  facId: 2,  day: "Friday",    start: "14:00", end: "16:00", room: "Lab-A1",building: "Building A", semester: "Fall 2025",   type: "lab" },
  { courseId: 2,  facId: 2,  day: "Tuesday",   start: "10:00", end: "11:30", room: "A-203", building: "Building A", semester: "Fall 2025",   type: "lecture" },
  { courseId: 2,  facId: 2,  day: "Thursday",  start: "10:00", end: "11:30", room: "A-203", building: "Building A", semester: "Fall 2025",   type: "lecture" },
  { courseId: 3,  facId: 1,  day: "Monday",    start: "14:00", end: "15:30", room: "A-301", building: "Building A", semester: "Spring 2026", type: "lecture" },
  { courseId: 3,  facId: 1,  day: "Wednesday", start: "14:00", end: "15:30", room: "A-301", building: "Building A", semester: "Spring 2026", type: "lecture" },
  { courseId: 5,  facId: 3,  day: "Monday",    start: "10:00", end: "11:30", room: "B-101", building: "Building B", semester: "Fall 2025",   type: "lecture" },
  { courseId: 5,  facId: 3,  day: "Wednesday", start: "10:00", end: "11:30", room: "B-101", building: "Building B", semester: "Fall 2025",   type: "lecture" },
  { courseId: 7,  facId: 4,  day: "Tuesday",   start: "08:30", end: "10:00", room: "C-201", building: "Building C", semester: "Fall 2025",   type: "lecture" },
  { courseId: 7,  facId: 4,  day: "Thursday",  start: "08:30", end: "10:00", room: "C-201", building: "Building C", semester: "Fall 2025",   type: "lecture" },
  { courseId: 10, facId: 5,  day: "Monday",    start: "08:30", end: "10:00", room: "D-101", building: "Building D", semester: "Fall 2025",   type: "lecture" },
  { courseId: 12, facId: 6,  day: "Tuesday",   start: "14:00", end: "15:30", room: "A-401", building: "Building A", semester: "Fall 2025",   type: "lecture" },
  { courseId: 12, facId: 6,  day: "Thursday",  start: "14:00", end: "15:30", room: "A-401", building: "Building A", semester: "Fall 2025",   type: "lecture" },
  { courseId: 14, facId: 7,  day: "Monday",    start: "09:00", end: "12:00", room: "E-Studio",building: "Building E", semester: "Fall 2025",   type: "lecture" },
  { courseId: 14, facId: 7,  day: "Wednesday", start: "09:00", end: "12:00", room: "E-Studio",building: "Building E", semester: "Fall 2025",   type: "lab" },
];
for (const s of schedules) {
  await q(
    `INSERT INTO schedules (course_id, faculty_id, day_of_week, start_time, end_time, room, building, semester, type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [s.courseId, s.facId, s.day, s.start, s.end, s.room, s.building, s.semester, s.type]
  );
}
console.log(`  ✓ ${schedules.length} schedules`);

// ── 8. Exams ────────────────────────────────────────────────────────────
console.log("📝 Seeding exams...");
const exams = [
  { courseId: 1,  title: "CSE101 - Midterm Exam",         type: "midterm", date: "2025-10-20", start: "09:00", end: "11:00", room: "Exam Hall A", semester: "Fall 2025",   marks: 100, instructions: "No electronic devices. Closed-book exam." },
  { courseId: 1,  title: "CSE101 - Final Exam",           type: "final",   date: "2025-12-15", start: "09:00", end: "12:00", room: "Exam Hall A", semester: "Fall 2025",   marks: 100, instructions: "Comprehensive. One cheat sheet allowed." },
  { courseId: 2,  title: "CSE201 - Midterm Exam",         type: "midterm", date: "2025-10-22", start: "14:00", end: "16:00", room: "Exam Hall B", semester: "Fall 2025",   marks: 80,  instructions: "Closed-book. Pseudocode accepted." },
  { courseId: 2,  title: "CSE201 - Final Exam",           type: "final",   date: "2025-12-17", start: "14:00", end: "17:00", room: "Exam Hall A", semester: "Fall 2025",   marks: 100, instructions: "Comprehensive final examination." },
  { courseId: 3,  title: "CSE301 - AI Midterm",           type: "midterm", date: "2026-03-15", start: "10:00", end: "12:00", room: "Exam Hall B", semester: "Spring 2026", marks: 80,  instructions: "Covers search, logic, and planning." },
  { courseId: 5,  title: "EEE101 - Midterm Exam",         type: "midterm", date: "2025-10-21", start: "09:00", end: "11:00", room: "Exam Hall C", semester: "Fall 2025",   marks: 100, instructions: "Formula sheet provided. Bring calculator." },
  { courseId: 5,  title: "EEE101 - Final Exam",           type: "final",   date: "2025-12-16", start: "09:00", end: "12:00", room: "Exam Hall C", semester: "Fall 2025",   marks: 100, instructions: "Comprehensive. Calculators allowed." },
  { courseId: 7,  title: "BBA101 - Midterm",              type: "midterm", date: "2025-10-23", start: "10:00", end: "12:00", room: "Exam Hall D", semester: "Fall 2025",   marks: 80,  instructions: "Case study analysis. Open notes." },
  { courseId: 10, title: "CE101 - Mechanics Midterm",     type: "midterm", date: "2025-10-24", start: "09:00", end: "11:00", room: "Exam Hall C", semester: "Fall 2025",   marks: 100, instructions: "Closed-book. Formula sheet provided." },
  { courseId: 12, title: "MATH101 - Calculus Midterm",    type: "midterm", date: "2025-10-25", start: "14:00", end: "16:00", room: "Exam Hall A", semester: "Fall 2025",   marks: 100, instructions: "No calculators. Show all work." },
  { courseId: 12, title: "MATH101 - Calculus Final",      type: "final",   date: "2025-12-18", start: "09:00", end: "12:00", room: "Exam Hall A", semester: "Fall 2025",   marks: 100, instructions: "Comprehensive. No calculators." },
  { courseId: 14, title: "ARCH101 - Design Review",       type: "final",   date: "2025-12-19", start: "09:00", end: "16:00", room: "E-Studio",    semester: "Fall 2025",   marks: 100, instructions: "Present portfolio and final design project." },
];
for (const e of exams) {
  await q(
    `INSERT INTO exams (course_id, title, type, date, start_time, end_time, room, semester, total_marks, instructions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [e.courseId, e.title, e.type, e.date, e.start, e.end, e.room, e.semester, e.marks, e.instructions]
  );
}
console.log(`  ✓ ${exams.length} exams`);

// ── 9. Fees ─────────────────────────────────────────────────────────────
console.log("💰 Seeding fees...");
const fees = [
  { studentId: 1,  type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: "2025-09-10", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  { studentId: 1,  type: "Library",       amount: "500.00",   due: "2025-09-15", paid: "2025-09-10", status: "paid",    semester: "Fall 2025",   desc: "Library access fee" },
  { studentId: 2,  type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: "2025-09-12", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  { studentId: 3,  type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: null,         status: "pending", semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  { studentId: 4,  type: "Tuition",       amount: "42000.00", due: "2025-09-15", paid: "2025-09-14", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (BBA)" },
  { studentId: 5,  type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: "2025-09-08", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  { studentId: 6,  type: "Tuition",       amount: "48000.00", due: "2025-09-15", paid: null,         status: "overdue", semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (CE)" },
  { studentId: 7,  type: "Tuition",       amount: "40000.00", due: "2025-09-15", paid: "2025-09-15", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (MATH)" },
  { studentId: 8,  type: "Tuition",       amount: "50000.00", due: "2025-09-15", paid: null,         status: "pending", semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (ARCH)" },
  { studentId: 9,  type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: "2025-09-11", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  { studentId: 10, type: "Tuition",       amount: "42000.00", due: "2025-09-15", paid: null,         status: "overdue", semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (BBA)" },
  { studentId: 11, type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: "2025-09-09", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  { studentId: 12, type: "Tuition",       amount: "48000.00", due: "2025-09-15", paid: "2025-09-13", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (CE)" },
  { studentId: 13, type: "Tuition",       amount: "40000.00", due: "2025-09-15", paid: null,         status: "waived",  semester: "Fall 2025",   desc: "Scholarship - full waiver" },
  { studentId: 14, type: "Tuition",       amount: "50000.00", due: "2025-09-15", paid: "2025-09-14", status: "paid",    semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee (ARCH)" },
  { studentId: 15, type: "Tuition",       amount: "45000.00", due: "2025-09-15", paid: null,         status: "pending", semester: "Fall 2025",   desc: "Fall 2025 Tuition Fee" },
  // Spring semester fees
  { studentId: 1,  type: "Tuition",       amount: "45000.00", due: "2026-02-15", paid: null,         status: "pending", semester: "Spring 2026", desc: "Spring 2026 Tuition Fee" },
  { studentId: 2,  type: "Tuition",       amount: "45000.00", due: "2026-02-15", paid: null,         status: "pending", semester: "Spring 2026", desc: "Spring 2026 Tuition Fee" },
  { studentId: 5,  type: "Tuition",       amount: "45000.00", due: "2026-02-15", paid: "2026-02-01", status: "paid",    semester: "Spring 2026", desc: "Spring 2026 Tuition Fee" },
];
for (const f of fees) {
  await q(
    `INSERT INTO fees (student_id, type, amount, due_date, paid_date, status, semester, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [f.studentId, f.type, f.amount, f.due, f.paid, f.status, f.semester, f.desc]
  );
}
console.log(`  ✓ ${fees.length} fee records`);

// ── 10. Announcements ───────────────────────────────────────────────────
console.log("📢 Seeding announcements...");
const announcements = [
  { title: "Welcome to Fall 2025 Semester",             content: "We are pleased to welcome all students to the new academic year at UEMF. Classes begin on September 8th. Please check your schedules on the student portal.", category: "academic",  priority: "high",   audience: "all",      authorId: 1 },
  { title: "Library Hours Extended for Exam Period",    content: "The UEMF library will remain open until midnight during the exam period (December 10-20). Study rooms can be reserved online.", category: "academic",  priority: "medium", audience: "students", authorId: 1 },
  { title: "Spring 2026 Registration Open",             content: "Online registration for Spring 2026 courses is now open. Deadline: January 15, 2026. Please consult with your academic advisor before registering.", category: "academic",  priority: "high",   audience: "students", authorId: 1 },
  { title: "Career Fair - February 2026",               content: "UEMF Annual Career Fair will be held on February 20, 2026. Over 50 companies from Morocco and Europe will participate. Bring your CVs!", category: "event",     priority: "medium", audience: "all",      authorId: 1 },
  { title: "Campus Wi-Fi Maintenance",                  content: "The campus Wi-Fi network will undergo scheduled maintenance on Saturday, October 5th from 02:00 to 06:00. Internet access may be intermittent during this window.", category: "general",   priority: "low",    audience: "all",      authorId: 1 },
  { title: "Faculty Research Symposium",                content: "The annual Faculty Research Symposium will take place on November 15, 2025 in the Main Auditorium. All faculty and graduate students are encouraged to attend.", category: "event",     priority: "medium", audience: "faculty",  authorId: 1 },
  { title: "Scholarship Applications Open",             content: "Applications for the UEMF Merit Scholarship (2026-2027) are now open. Eligible students must have a GPA of 3.5 or above. Deadline: March 1, 2026.", category: "financial", priority: "high",   audience: "students", authorId: 1 },
  { title: "Fee Payment Reminder",                      content: "This is a reminder that tuition fees for Spring 2026 are due by February 15, 2026. Late payments will incur a 5% surcharge.", category: "financial", priority: "high",   audience: "students", authorId: 1 },
];
for (const a of announcements) {
  await q(
    `INSERT INTO announcements (title, content, category, priority, target_audience, author_id, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,true)`,
    [a.title, a.content, a.category, a.priority, a.audience, a.authorId]
  );
}
console.log(`  ✓ ${announcements.length} announcements`);

// ── Update department heads ─────────────────────────────────────────────
console.log("\n🔗 Linking department heads...");
await q(`UPDATE departments SET head_faculty_id = 1 WHERE code = 'CSE'`);
await q(`UPDATE departments SET head_faculty_id = 3 WHERE code = 'EEE'`);
await q(`UPDATE departments SET head_faculty_id = 4 WHERE code = 'BBA'`);
await q(`UPDATE departments SET head_faculty_id = 5 WHERE code = 'CE'`);
await q(`UPDATE departments SET head_faculty_id = 6 WHERE code = 'MATH'`);
await q(`UPDATE departments SET head_faculty_id = 7 WHERE code = 'ARCH'`);
console.log("  ✓ Department heads linked");

await client.end();
console.log("\n✅ Seeding complete!");
