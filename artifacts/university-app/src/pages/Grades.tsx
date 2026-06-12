import { useState } from "react";
import { useListGrades, useCreateGrade, useUpdateGrade, useDeleteGrade, useListStudents, useListCourses, getListGradesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

const ASSESSMENT_TYPES = ["midterm", "final", "assignment", "quiz", "project"] as const;

const schema = z.object({
  studentId: z.coerce.number().min(1, "Required"),
  courseId: z.coerce.number().min(1, "Required"),
  score: z.coerce.number().min(0).max(100),
  semester: z.string().min(1, "Required"),
  assessmentType: z.enum(ASSESSMENT_TYPES),
  comments: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function GradePill({ score, letter }: { score: number; letter: string }) {
  const cls = score >= 70 ? "bg-emerald-100 text-emerald-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold", cls)}>
      {Number(score).toFixed(1)} <span className="font-medium opacity-80">({letter})</span>
    </span>
  );
}

export default function Grades() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const grades = useListGrades();
  const students = useListStudents();
  const courses = useListCourses();
  const createMutation = useCreateGrade();
  const updateMutation = useUpdateGrade();
  const deleteMutation = useDeleteGrade();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: 0, courseId: 0, score: 0, semester: "Fall-2024", assessmentType: "final" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ studentId: 0, courseId: 0, score: 0, semester: "Fall-2024", assessmentType: "final" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ studentId: item.studentId, courseId: item.courseId, score: item.score, semester: item.semester, assessmentType: item.assessmentType, comments: item.comments });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Grade updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Grade recorded" });
      }
      qc.invalidateQueries({ queryKey: getListGradesQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Grade deleted" });
      qc.invalidateQueries({ queryKey: getListGradesQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Grades"
        subtitle="Record and manage student grades"
        action={<Button onClick={openCreate} data-testid="button-add-grade"><Plus className="w-4 h-4 mr-2" />Record Grade</Button>}
      />

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Student</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Course</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Assessment</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Semester</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
            ) : (grades.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No grades recorded</TableCell></TableRow>
            ) : (
              (grades.data ?? []).map((g) => (
                <TableRow key={g.id} className="hover:bg-muted/20" data-testid={`row-grade-${g.id}`}>
                  <TableCell className="text-sm font-medium">{g.studentName ?? `Student #${g.studentId}`}</TableCell>
                  <TableCell>
                    <div className="text-sm">{g.courseName}</div>
                    {g.courseCode && <div className="text-xs font-mono text-muted-foreground">{g.courseCode}</div>}
                  </TableCell>
                  <TableCell><StatusBadge status={g.assessmentType} /></TableCell>
                  <TableCell><GradePill score={Number(g.score)} letter={g.letterGrade} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{g.semester}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(g)} data-testid={`button-edit-grade-${g.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(g.id)} data-testid={`button-delete-grade-${g.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Grade" : "Record Grade"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="studentId" render={({ field }) => (
                <FormItem><FormLabel>Student</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                    <FormControl><SelectTrigger data-testid="select-student"><SelectValue placeholder="Select student" /></SelectTrigger></FormControl>
                    <SelectContent>{(students.data ?? []).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="courseId" render={({ field }) => (
                <FormItem><FormLabel>Course</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                    <FormControl><SelectTrigger data-testid="select-course"><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
                    <SelectContent>{(courses.data ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.courseCode} — {c.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="score" render={({ field }) => (
                  <FormItem><FormLabel>Score (0-100)</FormLabel><FormControl><Input data-testid="input-score" type="number" min={0} max={100} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="assessmentType" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-assessment-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{ASSESSMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="semester" render={({ field }) => (
                <FormItem><FormLabel>Semester</FormLabel><FormControl><Input data-testid="input-semester" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="comments" render={({ field }) => (
                <FormItem><FormLabel>Comments</FormLabel><FormControl><Input data-testid="input-comments" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-grade">{editItem ? "Update" : "Record"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Grade</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
