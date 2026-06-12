import { useState } from "react";
import { useListEnrollments, useCreateEnrollment, useDeleteEnrollment, useListStudents, useListCourses, getListEnrollmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

const schema = z.object({
  studentId: z.coerce.number().min(1, "Required"),
  courseId: z.coerce.number().min(1, "Required"),
  semester: z.string().min(1, "Required"),
});
type FormValues = z.infer<typeof schema>;

export default function Enrollments() {
  const [semesterFilter, setSemesterFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const params: any = {};
  if (semesterFilter) params.semester = semesterFilter;

  const enrollments = useListEnrollments(params);
  const students = useListStudents();
  const courses = useListCourses();
  const createMutation = useCreateEnrollment();
  const deleteMutation = useDeleteEnrollment();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: 0, courseId: 0, semester: "Fall-2024" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createMutation.mutateAsync({ data: values });
      toast({ title: "Student enrolled successfully" });
      qc.invalidateQueries({ queryKey: getListEnrollmentsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Enrollment removed" });
      qc.invalidateQueries({ queryKey: getListEnrollmentsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Enrollments"
        subtitle="Manage course enrollments"
        action={<Button onClick={() => { form.reset({ studentId: 0, courseId: 0, semester: "Fall-2024" }); setDialogOpen(true); }} data-testid="button-add-enrollment"><Plus className="w-4 h-4 mr-2" />Enroll Student</Button>}
      />

      <div className="flex gap-3 mb-4">
        <Input placeholder="Filter by semester (e.g. Fall-2024)" className="max-w-xs" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} data-testid="input-filter-semester" />
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Student</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Course</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Semester</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Enrolled</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
            ) : (enrollments.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No enrollments found</TableCell></TableRow>
            ) : (
              (enrollments.data ?? []).map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/20" data-testid={`row-enrollment-${e.id}`}>
                  <TableCell className="text-sm font-medium">{e.studentName ?? `Student #${e.studentId}`}</TableCell>
                  <TableCell>
                    <div className="text-sm">{e.courseName}</div>
                    {e.courseCode && <div className="text-xs font-mono text-muted-foreground">{e.courseCode}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{e.semester}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(e.enrolledAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(e.id)} data-testid={`button-drop-enrollment-${e.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enroll Student</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="studentId" render={({ field }) => (
                <FormItem><FormLabel>Student</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                    <FormControl><SelectTrigger data-testid="select-student"><SelectValue placeholder="Select student" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(students.data ?? []).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="courseId" render={({ field }) => (
                <FormItem><FormLabel>Course</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                    <FormControl><SelectTrigger data-testid="select-course"><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(courses.data ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.courseCode} — {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="semester" render={({ field }) => (
                <FormItem><FormLabel>Semester</FormLabel><FormControl><Input data-testid="input-semester" placeholder="Fall-2024" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-enrollment">Enroll</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Drop Enrollment</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Remove this student from the course?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending} data-testid="button-confirm-drop">Drop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
