import { useState } from "react";
import { useListSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useListCourses, useListFaculty, getListSchedulesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
const TYPES = ["lecture","lab","tutorial","seminar"] as const;

const schema = z.object({
  courseId: z.coerce.number().min(1, "Required"),
  facultyId: z.coerce.number().optional(),
  dayOfWeek: z.enum(DAYS),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  room: z.string().min(1, "Required"),
  building: z.string().optional(),
  semester: z.string().min(1, "Required"),
  type: z.enum(TYPES),
});
type FormValues = z.infer<typeof schema>;

const dayColors: Record<string, string> = {
  monday: "bg-blue-100 text-blue-700",
  tuesday: "bg-purple-100 text-purple-700",
  wednesday: "bg-emerald-100 text-emerald-700",
  thursday: "bg-amber-100 text-amber-700",
  friday: "bg-rose-100 text-rose-700",
  saturday: "bg-orange-100 text-orange-700",
  sunday: "bg-gray-100 text-gray-600",
};

export default function Schedules() {
  const perms = usePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const schedules = useListSchedules();
  const courses = useListCourses();
  const faculty = useListFaculty();
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { courseId: 0, dayOfWeek: "monday", startTime: "09:00", endTime: "10:30", room: "", semester: "Fall-2024", type: "lecture" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ courseId: 0, dayOfWeek: "monday", startTime: "09:00", endTime: "10:30", room: "", semester: "Fall-2024", type: "lecture" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ courseId: item.courseId, facultyId: item.facultyId, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, room: item.room, building: item.building, semester: item.semester, type: item.type });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Schedule updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Schedule created" });
      }
      qc.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Schedule deleted" });
      qc.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Class Schedules"
        subtitle="Manage weekly timetable and room assignments"
        action={perms.canManageSchedules ? <Button onClick={openCreate} data-testid="button-add-schedule"><Plus className="w-4 h-4 mr-2" />Add Schedule</Button> : undefined}
      />

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Course</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Instructor</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Day</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Time</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Room</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Semester</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
            ) : (schedules.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No schedules found</TableCell></TableRow>
            ) : (
              (schedules.data ?? []).map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20" data-testid={`row-schedule-${s.id}`}>
                  <TableCell>
                    <div className="text-sm font-medium">{s.courseName}</div>
                    {s.courseCode && <div className="text-xs font-mono text-muted-foreground">{s.courseCode}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{s.facultyName ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize ${dayColors[s.dayOfWeek] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.dayOfWeek}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {s.startTime} — {s.endTime}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.room}{s.building ? `, ${s.building}` : ""}</TableCell>
                  <TableCell><StatusBadge status={s.type} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.semester}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {perms.canManageSchedules && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(s)} data-testid={`button-edit-schedule-${s.id}`}><Pencil className="w-3.5 h-3.5" /></Button>}
                      {perms.canManageSchedules && <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(s.id)} data-testid={`button-delete-schedule-${s.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Schedule" : "Add Schedule"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="courseId" render={({ field }) => (
                <FormItem><FormLabel>Course</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                    <FormControl><SelectTrigger data-testid="select-course"><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
                    <SelectContent>{(courses.data ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.courseCode} — {c.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="facultyId" render={({ field }) => (
                <FormItem><FormLabel>Instructor</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "__none__" ? undefined : Number(v))} value={field.value ? String(field.value) : "__none__"}>
                    <FormControl><SelectTrigger data-testid="select-faculty"><SelectValue placeholder="Select faculty" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {(faculty.data ?? []).map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.firstName} {f.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                  <FormItem><FormLabel>Day</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-day"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input data-testid="input-start-time" type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem><FormLabel>End Time</FormLabel><FormControl><Input data-testid="input-end-time" type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="room" render={({ field }) => (
                  <FormItem><FormLabel>Room</FormLabel><FormControl><Input data-testid="input-room" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="building" render={({ field }) => (
                  <FormItem><FormLabel>Building</FormLabel><FormControl><Input data-testid="input-building" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="semester" render={({ field }) => (
                <FormItem><FormLabel>Semester</FormLabel><FormControl><Input data-testid="input-semester" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-schedule">{editItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Schedule</DialogTitle></DialogHeader>
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
