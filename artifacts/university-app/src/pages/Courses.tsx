import { useState } from "react";
import { useListCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useListDepartments, useListFaculty, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

const schema = z.object({
  courseCode: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  credits: z.coerce.number().min(1, "Required"),
  departmentId: z.coerce.number().min(1, "Required"),
  facultyId: z.coerce.number().optional(),
  maxStudents: z.coerce.number().optional(),
  semester: z.string().min(1, "Required"),
  level: z.enum(["undergraduate", "graduate", "doctoral"]),
});
type FormValues = z.infer<typeof schema>;

export default function Courses() {
  const perms = usePermissions();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const params: any = {};
  if (search) params.search = search;
  if (deptFilter) params.departmentId = Number(deptFilter);

  const courses = useListCourses(params);
  const departments = useListDepartments();
  const faculty = useListFaculty();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { courseCode: "", name: "", credits: 3, departmentId: 0, semester: "Fall-2024", level: "undergraduate" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ courseCode: "", name: "", credits: 3, departmentId: 0, semester: "Fall-2024", level: "undergraduate" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ courseCode: item.courseCode, name: item.name, description: item.description, credits: item.credits, departmentId: item.departmentId, facultyId: item.facultyId, maxStudents: item.maxStudents, semester: item.semester, level: item.level });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Course updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Course created" });
      }
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Course deleted" });
      qc.invalidateQueries({ queryKey: getListCoursesQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Courses"
        subtitle="Manage academic courses and curriculum"
        action={perms.canManageCourses ? <Button onClick={openCreate} data-testid="button-add-course"><Plus className="w-4 h-4 mr-2" />Add Course</Button> : undefined}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-courses" placeholder="Search courses..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={deptFilter || "__all__"} onValueChange={(v) => setDeptFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Departments</SelectItem>
            {(departments.data ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Code</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Course Name</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Department</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Credits</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Enrolled</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Level</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Semester</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
            ) : (courses.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No courses found</TableCell></TableRow>
            ) : (
              (courses.data ?? []).map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/20" data-testid={`row-course-${c.id}`}>
                  <TableCell className="font-mono text-xs font-medium text-muted-foreground">{c.courseCode}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{c.name}</div>
                    {c.facultyName && <div className="text-xs text-muted-foreground">{c.facultyName}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{c.departmentName ?? "—"}</TableCell>
                  <TableCell className="text-sm font-medium">{c.credits}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {c.enrolledCount ?? 0}{c.maxStudents ? `/${c.maxStudents}` : ""}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={c.level} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.semester}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {perms.canManageCourses && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(c)} data-testid={`button-edit-course-${c.id}`}><Pencil className="w-3.5 h-3.5" /></Button>}
                      {perms.canManageCourses && <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(c.id)} data-testid={`button-delete-course-${c.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
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
          <DialogHeader><DialogTitle>{editItem ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="courseCode" render={({ field }) => (
                  <FormItem><FormLabel>Course Code</FormLabel><FormControl><Input data-testid="input-course-code" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="credits" render={({ field }) => (
                  <FormItem><FormLabel>Credits</FormLabel><FormControl><Input data-testid="input-credits" type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Course Name</FormLabel><FormControl><Input data-testid="input-course-name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea data-testid="textarea-description" rows={2} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem><FormLabel>Department</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger data-testid="select-course-department"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{(departments.data ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="facultyId" render={({ field }) => (
                  <FormItem><FormLabel>Instructor</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === "__none__" ? undefined : Number(v))} value={field.value ? String(field.value) : "__none__"}>
                      <FormControl><SelectTrigger data-testid="select-faculty"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {(faculty.data ?? []).map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.firstName} {f.lastName}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="semester" render={({ field }) => (
                  <FormItem><FormLabel>Semester</FormLabel><FormControl><Input data-testid="input-semester" placeholder="Fall-2024" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="maxStudents" render={({ field }) => (
                  <FormItem><FormLabel>Max Students</FormLabel><FormControl><Input data-testid="input-max-students" type="number" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="level" render={({ field }) => (
                <FormItem><FormLabel>Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-level"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="doctoral">Doctoral</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-course">{editItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Course</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
