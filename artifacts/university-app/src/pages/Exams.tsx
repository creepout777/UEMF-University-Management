import { useState } from "react";
import { useListExams, useCreateExam, useUpdateExam, useDeleteExam, useListCourses, getListExamsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, CalendarClock } from "lucide-react";
import { usePermissions } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

const TYPES = ["midterm","final","quiz","practical"] as const;

const schema = z.object({
  courseId: z.coerce.number().min(1, "Required"),
  title: z.string().min(1, "Required"),
  type: z.enum(TYPES),
  date: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  room: z.string().min(1, "Required"),
  semester: z.string().min(1, "Required"),
  totalMarks: z.coerce.number().min(1, "Required"),
  instructions: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Exams() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const perms = usePermissions();
  const today = new Date().toISOString().split("T")[0];

  const exams = useListExams();
  const courses = useListCourses();
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();
  const deleteMutation = useDeleteExam();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { courseId: 0, title: "", type: "final", date: today, startTime: "09:00", endTime: "12:00", room: "", semester: "Fall-2024", totalMarks: 100 },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ courseId: 0, title: "", type: "final", date: today, startTime: "09:00", endTime: "12:00", room: "", semester: "Fall-2024", totalMarks: 100 });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ courseId: item.courseId, title: item.title, type: item.type, date: item.date, startTime: item.startTime, endTime: item.endTime, room: item.room, semester: item.semester, totalMarks: item.totalMarks, instructions: item.instructions });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Exam updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Exam created" });
      }
      qc.invalidateQueries({ queryKey: getListExamsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Exam deleted" });
      qc.invalidateQueries({ queryKey: getListExamsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  const upcoming = (exams.data ?? []).filter((e) => e.date >= today!);
  const past = (exams.data ?? []).filter((e) => e.date < today!);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Exams"
        subtitle="Manage examination schedule"
        action={perms.canManageExams ? <Button onClick={openCreate} data-testid="button-add-exam"><Plus className="w-4 h-4 mr-2" />Add Exam</Button> : undefined}
      />

      {exams.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Exams ({upcoming.length})</h2>
              <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Title</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Course</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Room</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Marks</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((e) => (
                      <TableRow key={e.id} className="hover:bg-muted/20" data-testid={`row-exam-${e.id}`}>
                        <TableCell className="font-medium text-sm">{e.title}</TableCell>
                        <TableCell>
                          <div className="text-sm">{e.courseName}</div>
                          {e.courseCode && <div className="text-xs font-mono text-muted-foreground">{e.courseCode}</div>}
                        </TableCell>
                        <TableCell><StatusBadge status={e.type} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarClock className="w-3 h-3 text-muted-foreground" />
                            {e.date}
                          </div>
                          <div className="text-xs text-muted-foreground">{e.startTime} — {e.endTime}</div>
                        </TableCell>
                        <TableCell className="text-sm">{e.room}</TableCell>
                        <TableCell className="text-sm font-medium">{e.totalMarks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {perms.canManageExams && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(e)} data-testid={`button-edit-exam-${e.id}`}><Pencil className="w-3.5 h-3.5" /></Button>}
                            {perms.canManageExams && <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(e.id)} data-testid={`button-delete-exam-${e.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Past Exams ({past.length})</h2>
              <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden opacity-70">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Title</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Course</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Room</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {past.map((e) => (
                      <TableRow key={e.id} className="hover:bg-muted/20" data-testid={`row-past-exam-${e.id}`}>
                        <TableCell className="text-sm">{e.title}</TableCell>
                        <TableCell className="text-sm">{e.courseCode} {e.courseName}</TableCell>
                        <TableCell><StatusBadge status={e.type} /></TableCell>
                        <TableCell className="text-sm">{e.date}</TableCell>
                        <TableCell className="text-sm">{e.room}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {(exams.data ?? []).length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">No exams scheduled</div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Exam" : "Add Exam"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-exam-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="courseId" render={({ field }) => (
                  <FormItem><FormLabel>Course</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger data-testid="select-course"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{(courses.data ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.courseCode}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-exam-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input data-testid="input-exam-date" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="totalMarks" render={({ field }) => (
                  <FormItem><FormLabel>Total Marks</FormLabel><FormControl><Input data-testid="input-total-marks" type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem><FormLabel>Start</FormLabel><FormControl><Input data-testid="input-start-time" type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem><FormLabel>End</FormLabel><FormControl><Input data-testid="input-end-time" type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="room" render={({ field }) => (
                  <FormItem><FormLabel>Room</FormLabel><FormControl><Input data-testid="input-room" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="semester" render={({ field }) => (
                  <FormItem><FormLabel>Semester</FormLabel><FormControl><Input data-testid="input-semester" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="instructions" render={({ field }) => (
                <FormItem><FormLabel>Instructions</FormLabel><FormControl><Textarea data-testid="textarea-instructions" rows={2} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-exam">{editItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Exam</DialogTitle></DialogHeader>
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
