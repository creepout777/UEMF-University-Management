import { useGetDashboardStats, useGetRecentActivity, useGetEnrollmentTrends, useGetDepartmentStats } from "@workspace/api-client-react";
import { Users, GraduationCap, BookOpen, Building2, ClipboardList, DollarSign, FileText, Star } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(146,50%,36%)", "hsl(220,55%,35%)", "hsl(196,60%,45%)", "hsl(38,90%,55%)", "hsl(0,75%,55%)"];

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    student: <Users className="w-4 h-4" />,
    grade: <Star className="w-4 h-4" />,
    announcement: <FileText className="w-4 h-4" />,
    enrollment: <ClipboardList className="w-4 h-4" />,
    faculty: <GraduationCap className="w-4 h-4" />,
    payment: <DollarSign className="w-4 h-4" />,
    exam: <FileText className="w-4 h-4" />,
  };
  return <span className="text-primary">{iconMap[type] ?? <Star className="w-4 h-4" />}</span>;
}

export default function Dashboard() {
  const stats = useGetDashboardStats();
  const activity = useGetRecentActivity();
  const trends = useGetEnrollmentTrends();
  const deptStats = useGetDepartmentStats();

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">University overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard label="Total Students" value={stats.data?.totalStudents ?? 0} icon={Users} color="green" />
            <StatCard label="Faculty Members" value={stats.data?.totalFaculty ?? 0} icon={GraduationCap} color="navy" />
            <StatCard label="Courses" value={stats.data?.totalCourses ?? 0} icon={BookOpen} color="blue" />
            <StatCard label="Departments" value={stats.data?.totalDepartments ?? 0} icon={Building2} color="purple" />
            <StatCard label="Active Enrollments" value={stats.data?.activeEnrollments ?? 0} icon={ClipboardList} color="green" />
            <StatCard label="Pending Fees" value={`MAD ${(stats.data?.pendingFees ?? 0).toLocaleString()}`} icon={DollarSign} color="amber" />
            <StatCard label="Upcoming Exams" value={stats.data?.upcomingExams ?? 0} icon={FileText} color="red" />
            <StatCard label="Avg GPA" value={(stats.data?.averageGpa ?? 0).toFixed(2)} icon={Star} color="blue" subtitle="Grade Point Average" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Enrollment Trends */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Enrollment Trends</h2>
          {trends.isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends.data ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(146,50%,36%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(146,50%,36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,92%)" />
                <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="enrollments" stroke="hsl(146,50%,36%)" strokeWidth={2} fill="url(#enrollGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h2>
          {activity.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3 max-h-52 overflow-y-auto">
              {(activity.data ?? []).slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-start gap-3" data-testid={`activity-item-${item.id}`}>
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                </div>
              ))}
              {(activity.data ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Students by Department</h2>
          {deptStats.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptStats.data ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,92%)" />
                <XAxis dataKey="departmentName" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="studentCount" fill="hsl(146,50%,36%)" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Department Distribution</h2>
          {deptStats.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deptStats.data ?? []} dataKey="studentCount" nameKey="departmentName" cx="45%" cy="50%" outerRadius={70} label={false}>
                  {(deptStats.data ?? []).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
