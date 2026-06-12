import { useAuth } from "@/contexts/AuthContext";
import {
  useGetStudent, useListCourses, useListSchedules,
  useListGrades, useListExams, useListFees, useListAnnouncements,
} from "@workspace/api-client-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, FileText, DollarSign, Star, Clock,
  GraduationCap, Bell, Calendar, TrendingUp, CheckCircle2, AlertCircle,
} from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_COLORS: Record<string, string> = {
  monday: "bg-blue-100 text-blue-700 border-blue-200",
  tuesday: "bg-violet-100 text-violet-700 border-violet-200",
  wednesday: "bg-emerald-100 text-emerald-700 border-emerald-200",
  thursday: "bg-amber-100 text-amber-700 border-amber-200",
  friday: "bg-rose-100 text-rose-700 border-rose-200",
  saturday: "bg-orange-100 text-orange-700 border-orange-200",
  sunday: "bg-gray-100 text-gray-600 border-gray-200",
};

function gradeColor(letter: string) {
  if (letter?.startsWith("A")) return { bg: "bg-emerald-100 text-emerald-700", bar: "hsl(146,50%,36%)" };
  if (letter?.startsWith("B")) return { bg: "bg-blue-100 text-blue-700", bar: "hsl(214,80%,55%)" };
  if (letter?.startsWith("C")) return { bg: "bg-amber-100 text-amber-700", bar: "hsl(38,90%,55%)" };
  if (letter?.startsWith("D")) return { bg: "bg-orange-100 text-orange-700", bar: "hsl(25,90%,55%)" };
  return { bg: "bg-red-100 text-red-700", bar: "hsl(0,75%,55%)" };
}

function GPAMeter({ gpa }: { gpa: number }) {
  const pct = Math.min((gpa / 4.0) * 100, 100);
  const data = [{ name: "GPA", value: pct, fill: "hsl(146,50%,36%)" }];
  return (
    <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={210} endAngle={-30} data={data} barSize={8}>
          <RadialBar background={{ fill: "hsl(220,16%,94%)" }} dataKey="value" cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{gpa.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">/ 4.00</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.linkedEntityId ?? 0;

  const profile = useGetStudent(studentId);
  const courses = useListCourses();
  const schedules = useListSchedules();
  const grades = useListGrades();
  const exams = useListExams();
  const fees = useListFees();
  const announcements = useListAnnouncements();

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todaySchedule = [...(schedules.data ?? [])]
    .filter((s) => s.dayOfWeek === todayKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const upcomingExams = (exams.data ?? [])
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const pendingFees = (fees.data ?? []).filter((f) => f.status === "pending" || f.status === "overdue");
  const pendingTotal = pendingFees.reduce((s, f) => s + Number(f.amount), 0);

  const gpa = profile.data?.gpa ? Number(profile.data.gpa) : 0;

  const recentAnnouncements = [...(announcements.data ?? [])]
    .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
    .slice(0, 4);

  const gradesByCourse = (courses.data ?? []).map((c) => {
    const cGrades = (grades.data ?? []).filter((g) => g.courseId === c.id);
    const avg = cGrades.length > 0
      ? cGrades.reduce((s, g) => s + Number(g.score), 0) / cGrades.length
      : null;
    const best = cGrades.length > 0 ? cGrades[0] : null;
    return { course: c, avg, letter: best?.letterGrade ?? null };
  });

  const isLoading = courses.isLoading || grades.isLoading || fees.isLoading;

  const firstName = profile.data?.firstName ?? user?.username ?? "Student";

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">

      {/* Welcome header */}
      <div className="rounded-2xl overflow-hidden shadow-sm"
           style={{ background: "linear-gradient(135deg, hsl(146,50%,22%) 0%, hsl(146,48%,30%) 50%, hsl(196,55%,35%) 100%)" }}>
        <div className="px-6 py-7 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
               style={{ background: "rgba(255,255,255,0.15)" }}>
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            {profile.isLoading
              ? <Skeleton className="h-7 w-48 bg-white/20 mb-2" />
              : <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                  Welcome back, {firstName}!
                </h1>
            }
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {profile.data?.studentId && (
                <span className="text-xs font-mono text-white/70 bg-white/10 px-2 py-0.5 rounded">
                  {profile.data.studentId}
                </span>
              )}
              {profile.data?.departmentName && (
                <span className="text-xs text-white/60">{profile.data.departmentName}</span>
              )}
              {profile.data?.status && (
                <span className="text-xs bg-white/15 text-white/80 px-2 py-0.5 rounded-full capitalize">
                  {profile.data.status}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{(courses.data ?? []).length}</div>
              <div className="text-xs text-white/60">Courses</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{gpa.toFixed(2)}</div>
              <div className="text-xs text-white/60">GPA</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{upcomingExams.length}</div>
              <div className="text-xs text-white/60">Exams Soon</div>
            </div>
          </div>
        </div>
        <div className="px-6 py-2 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.12)" }}>
          <Calendar className="w-3.5 h-3.5 text-white/50" />
          <span className="text-xs text-white/50">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          {todaySchedule.length > 0 && (
            <span className="ml-2 text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
              {todaySchedule.length} class{todaySchedule.length !== 1 ? "es" : ""} today
            </span>
          )}
          {pendingFees.length > 0 && (
            <span className="ml-auto text-xs bg-red-500/30 text-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {pendingFees.length} pending fee{pendingFees.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : <>
            <StatCard label="Enrolled Courses" value={(courses.data ?? []).length} icon={BookOpen} color="green" />
            <StatCard label="My GPA" value={gpa.toFixed(2)} icon={Star} color="blue" subtitle="Grade Point Average" />
            <StatCard label="Upcoming Exams" value={upcomingExams.length} icon={FileText} color="red" />
            <StatCard label="Pending Fees" value={`MAD ${pendingTotal.toLocaleString()}`} icon={DollarSign} color="amber" subtitle={`${pendingFees.length} unpaid`} />
          </>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's schedule */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-card-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Today's Classes
            </h2>
            <span className="text-xs text-muted-foreground capitalize">{todayKey}</span>
          </div>
          <div className="p-4 space-y-2">
            {schedules.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
              : todaySchedule.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">No classes today — enjoy your day! 🎉</p>
                : todaySchedule.map((s) => (
                  <div key={s.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                      <span className="text-xs font-bold text-foreground leading-tight">{s.startTime}</span>
                      <div className="w-px h-3 bg-border my-0.5" />
                      <span className="text-xs text-muted-foreground leading-tight">{s.endTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight truncate">{s.courseName}</p>
                      {s.facultyName && <p className="text-xs text-muted-foreground truncate">{s.facultyName}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{s.room}{s.building ? ` · ${s.building}` : ""}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium self-start flex-shrink-0 ${DAY_COLORS[s.dayOfWeek ?? "monday"]}`}>
                      {s.type}
                    </span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* My Grades by Course */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-card-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> My Grades
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              : gradesByCourse.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">No courses enrolled</p>
                : gradesByCourse.map(({ course, avg, letter }) => {
                  const pct = avg != null ? Math.round(avg) : null;
                  const gc = letter ? gradeColor(letter) : null;
                  return (
                    <div key={course.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground leading-tight truncate">{course.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{course.courseCode}</p>
                        </div>
                        {letter && gc
                          ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${gc.bg}`}>{letter}</span>
                          : <span className="text-xs text-muted-foreground ml-2">No grades</span>
                        }
                      </div>
                      {pct != null && (
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: gc?.bar ?? "hsl(220,16%,70%)" }} />
                        </div>
                      )}
                      {pct != null && <p className="text-[10px] text-muted-foreground mt-1">{pct}/100</p>}
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* GPA meter + Upcoming exams */}
        <div className="space-y-4">
          {/* GPA Card */}
          <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Academic Standing
            </h2>
            {profile.isLoading
              ? <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              : <GPAMeter gpa={gpa} />
            }
            <p className="text-center text-xs text-muted-foreground mt-2">
              {gpa >= 3.7 ? "Excellent standing" : gpa >= 3.0 ? "Good standing" : gpa >= 2.0 ? "Satisfactory" : "Needs improvement"}
            </p>
          </div>

          {/* Upcoming exams */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-card-border">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Upcoming Exams
              </h2>
            </div>
            <div className="p-3 space-y-2">
              {exams.isLoading
                ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
                : upcomingExams.length === 0
                  ? <p className="text-xs text-muted-foreground text-center py-4">No upcoming exams</p>
                  : upcomingExams.map((e) => {
                    const d = new Date(e.date);
                    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
                    return (
                      <div key={e.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                        <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-red-600 leading-tight">{d.getDate()}</span>
                          <span className="text-[9px] text-red-500">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{e.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{e.courseName}</p>
                        </div>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${daysLeft <= 3 ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"}`}>
                          {daysLeft}d
                        </span>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-card-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Latest Announcements
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
          {announcements.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 m-4 rounded-lg" />)
            : recentAnnouncements.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-8 col-span-4">No announcements</p>
              : recentAnnouncements.map((a) => (
                <div key={a.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-2 mb-2">
                    <StatusBadge status={a.priority} />
                    <StatusBadge status={a.category} />
                  </div>
                  <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{a.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                  {a.publishedAt && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}
