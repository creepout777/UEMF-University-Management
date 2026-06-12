import { useAuth } from "@/contexts/AuthContext";
import {
  useGetFaculty, useListCourses, useListSchedules,
  useListGrades, useListExams, useListEnrollments,
} from "@workspace/api-client-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Users, FileText, Star, Clock, ChevronRight,
  GraduationCap, TrendingUp, Calendar,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};
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
  if (letter?.startsWith("A")) return "text-emerald-600 bg-emerald-50";
  if (letter?.startsWith("B")) return "text-blue-600 bg-blue-50";
  if (letter?.startsWith("C")) return "text-amber-600 bg-amber-50";
  if (letter?.startsWith("D")) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const facultyId = user?.linkedEntityId ?? 0;

  const profile = useGetFaculty(facultyId);
  const courses = useListCourses();
  const schedules = useListSchedules();
  const grades = useListGrades();
  const exams = useListExams();
  const enrollments = useListEnrollments();

  const todayKey = DAY_KEYS[new Date().getDay()];
  const todaySchedule = (schedules.data ?? []).filter((s) => s.dayOfWeek === todayKey);
  const sortedSchedule = [...todaySchedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const upcomingExams = (exams.data ?? [])
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentGrades = [...(grades.data ?? [])]
    .sort((a, b) => new Date(b.gradedAt ?? 0).getTime() - new Date(a.gradedAt ?? 0).getTime())
    .slice(0, 6);

  const totalStudents = new Set((enrollments.data ?? []).map((e) => e.studentId)).size;

  const avgScore =
    (grades.data ?? []).length > 0
      ? (grades.data ?? []).reduce((s, g) => s + Number(g.score), 0) / (grades.data ?? []).length
      : 0;

  const radarData = (courses.data ?? []).map((c) => {
    const cGrades = (grades.data ?? []).filter((g) => g.courseId === c.id);
    const avg = cGrades.length > 0 ? cGrades.reduce((s, g) => s + Number(g.score), 0) / cGrades.length : 0;
    return { subject: c.courseCode ?? c.name.slice(0, 6), avg: Math.round(avg) };
  });

  const name = profile.data
    ? `${profile.data.title?.replace(/_/g, " ")} ${profile.data.firstName} ${profile.data.lastName}`
    : user?.username ?? "Teacher";

  const isLoading = courses.isLoading || schedules.isLoading || grades.isLoading || exams.isLoading;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">

      {/* Welcome header */}
      <div className="rounded-2xl overflow-hidden shadow-sm"
           style={{ background: "linear-gradient(135deg, hsl(220,55%,16%) 0%, hsl(220,55%,22%) 60%, hsl(146,45%,28%) 100%)" }}>
        <div className="px-6 py-7 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
               style={{ background: "rgba(255,255,255,0.15)" }}>
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            {profile.isLoading
              ? <Skeleton className="h-7 w-48 bg-white/20 mb-2" />
              : <h1 className="text-xl md:text-2xl font-bold text-white leading-tight truncate">{name}</h1>}
            <p className="text-sm text-white/60 mt-0.5">
              {profile.data?.specialization ?? "Faculty Member"}
              {profile.data?.departmentName && ` · ${profile.data.departmentName}`}
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{(courses.data ?? []).length}</div>
              <div className="text-xs text-white/60">Courses</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalStudents}</div>
              <div className="text-xs text-white/60">Students</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{avgScore.toFixed(1)}</div>
              <div className="text-xs text-white/60">Avg Score</div>
            </div>
          </div>
        </div>
        {/* Today's label bar */}
        <div className="px-6 py-2 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.15)" }}>
          <Calendar className="w-3.5 h-3.5 text-white/50" />
          <span className="text-xs text-white/50">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          {todaySchedule.length > 0 && (
            <span className="ml-2 text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
              {todaySchedule.length} class{todaySchedule.length !== 1 ? "es" : ""} today
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : <>
            <StatCard label="My Courses" value={(courses.data ?? []).length} icon={BookOpen} color="green" />
            <StatCard label="My Students" value={totalStudents} icon={Users} color="navy" />
            <StatCard label="Upcoming Exams" value={upcomingExams.length} icon={FileText} color="red" />
            <StatCard label="Avg Score" value={avgScore.toFixed(1)} icon={Star} color="blue" subtitle="Across all courses" />
          </>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Schedule */}
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
              : sortedSchedule.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">No classes scheduled today</p>
                : sortedSchedule.map((s) => (
                  <div key={s.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                      <span className="text-xs font-bold text-foreground leading-tight">{s.startTime}</span>
                      <div className="w-px h-3 bg-border my-0.5" />
                      <span className="text-xs text-muted-foreground leading-tight">{s.endTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight truncate">{s.courseName}</p>
                      {s.courseCode && <p className="text-xs font-mono text-muted-foreground">{s.courseCode}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{s.room}{s.building ? ` · ${s.building}` : ""}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium self-start flex-shrink-0 ${DAY_COLORS[s.dayOfWeek ?? "monday"]}`}>
                      {DAY_LABELS[s.dayOfWeek ?? "monday"]}
                    </span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-card-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> My Courses
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {courses.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              : (courses.data ?? []).length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">No courses assigned</p>
                : (courses.data ?? []).map((c) => {
                  const enrolled = (enrollments.data ?? []).filter((e) => e.courseId === c.id).length;
                  const cGrades = (grades.data ?? []).filter((g) => g.courseId === c.id);
                  const avg = cGrades.length > 0
                    ? (cGrades.reduce((s, g) => s + Number(g.score), 0) / cGrades.length).toFixed(0)
                    : "—";
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.courseCode}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-foreground">{enrolled}</p>
                        <p className="text-xs text-muted-foreground">students</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-primary">{avg}</p>
                        <p className="text-xs text-muted-foreground">avg</p>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-card-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Upcoming Exams
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {exams.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              : upcomingExams.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">No upcoming exams</p>
                : upcomingExams.map((e) => {
                  const d = new Date(e.date);
                  const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
                  return (
                    <div key={e.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-red-600 leading-tight">{d.getDate()}</span>
                        <span className="text-[10px] text-red-500 leading-tight">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.courseName}</p>
                        <p className="text-xs text-muted-foreground">{e.startTime} · {e.room}</p>
                      </div>
                      <span className={`text-xs font-medium self-start flex-shrink-0 px-1.5 py-0.5 rounded ${daysLeft <= 3 ? "text-red-600 bg-red-50" : daysLeft <= 7 ? "text-amber-600 bg-amber-50" : "text-muted-foreground bg-muted"}`}>
                        {daysLeft}d
                      </span>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* Recent Grades + Performance Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent grades */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-card-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Recently Recorded Grades
            </h2>
          </div>
          <div className="divide-y divide-border">
            {grades.isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 mx-4 my-2 rounded-lg" />)
              : recentGrades.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-8">No grades recorded yet</p>
                : recentGrades.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{g.studentName ?? `Student #${g.studentId}`}</p>
                      <p className="text-xs text-muted-foreground truncate">{g.courseName} · {g.assessmentType}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-foreground">{Number(g.score).toFixed(0)}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor(g.letterGrade ?? "")}`}>
                        {g.letterGrade}
                      </span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Performance radar */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Course Performance Overview
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Average score by course</p>
          {grades.isLoading || courses.isLoading
            ? <Skeleton className="h-44 w-full rounded-xl" />
            : radarData.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-12">No grade data yet</p>
              : (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData} margin={{ top: 4, right: 24, left: 24, bottom: 4 }}>
                    <PolarGrid stroke="hsl(220,16%,92%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} />
                    <Radar name="Avg Score" dataKey="avg" stroke="hsl(146,50%,36%)" fill="hsl(146,50%,36%)" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}/100`, "Avg Score"]} />
                  </RadarChart>
                </ResponsiveContainer>
              )
          }
        </div>
      </div>
    </div>
  );
}
