import { useParams, useLocation } from "wouter";
import { useGetStudent, useGetStudentGrades, useGetStudentEnrollments, getGetStudentQueryKey, getGetStudentGradesQueryKey, getGetStudentEnrollmentsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const studentId = Number(id);

  const student = useGetStudent(studentId, { query: { enabled: !!studentId, queryKey: getGetStudentQueryKey(studentId) } });
  const grades = useGetStudentGrades(studentId, { query: { enabled: !!studentId, queryKey: getGetStudentGradesQueryKey(studentId) } });
  const enrollments = useGetStudentEnrollments(studentId, { query: { enabled: !!studentId, queryKey: getGetStudentEnrollmentsQueryKey(studentId) } });

  if (student.isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl mb-6" />
      </div>
    );
  }

  const s = student.data;
  if (!s) return <div className="p-6 text-sm text-muted-foreground">Student not found.</div>;

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => setLocation("/students")} data-testid="button-back">
        <ArrowLeft className="w-4 h-4 mr-2" />Back to Students
      </Button>

      {/* Profile Card */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
            {s.firstName[0]}{s.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">{s.firstName} {s.lastName}</h1>
                <p className="text-sm text-muted-foreground font-mono">{s.studentId}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {s.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{s.phone}</span>
                </div>
              )}
              {s.departmentName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span>{s.departmentName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Enrolled {s.enrollmentYear}</span>
              </div>
              {s.gpa && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span>GPA {s.gpa}</span>
                </div>
              )}
              {s.nationality && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{s.nationality}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Grades</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-xs">Course</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Score</TableHead>
                <TableHead className="text-xs">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))
              ) : (grades.data ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">No grades recorded</TableCell></TableRow>
              ) : (
                (grades.data ?? []).map((g) => (
                  <TableRow key={g.id} data-testid={`row-grade-${g.id}`}>
                    <TableCell className="text-xs">{g.courseCode} {g.courseName}</TableCell>
                    <TableCell><StatusBadge status={g.assessmentType} /></TableCell>
                    <TableCell className="text-xs font-medium">{Number(g.score).toFixed(1)}</TableCell>
                    <TableCell>
                      <span className={`font-bold text-sm ${Number(g.score) >= 70 ? "text-emerald-600" : Number(g.score) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {g.letterGrade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enrollments */}
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Enrollments</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-xs">Course</TableHead>
                <TableHead className="text-xs">Semester</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))
              ) : (enrollments.data ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">No enrollments</TableCell></TableRow>
              ) : (
                (enrollments.data ?? []).map((e) => (
                  <TableRow key={e.id} data-testid={`row-enrollment-${e.id}`}>
                    <TableCell className="text-xs">{e.courseCode} {e.courseName}</TableCell>
                    <TableCell className="text-xs">{e.semester}</TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
