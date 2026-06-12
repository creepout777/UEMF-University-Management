import { useState } from "react";
import { useListStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, useListDepartments, getListStudentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
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
import { useLocation } from "wouter";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  departmentId: z.coerce.number().min(1, "Required"),
  enrollmentYear: z.coerce.number().min(2000, "Required"),
  status: z.enum(["active", "inactive", "graduated", "suspended"]),
});
type FormValues = z.infer<typeof schema>;

export default function Students() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const perms = usePermissions();

  const params: any = {};
  if (search) params.search = search;
  if (deptFilter) params.departmentId = Number(deptFilter);
  if (statusFilter) params.status = statusFilter;

  const students = useListStudents(params);
  const departments = useListDepartments();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", departmentId: 0, enrollmentYear: new Date().getFullYear(), status: "active" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ firstName: "", lastName: "", email: "", departmentId: 0, enrollmentYear: new Date().getFullYear(), status: "active" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ firstName: item.firstName, lastName: item.lastName, email: item.email, phone: item.phone, dateOfBirth: item.dateOfBirth, gender: item.gender, nationality: item.nationality, address: item.address, departmentId: item.departmentId, enrollmentYear: item.enrollmentYear, status: item.status });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Student updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Student created" });
      }
      qc.invalidateQueries({ queryKey: getListStudentsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Student deleted" });
      qc.invalidateQueries({ queryKey: getListStudentsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Students"
        subtitle="Manage student records and enrollment"
        action={perms.canManageStudents ? <Button onClick={openCreate} data-testid="button-add-student"><Plus className="w-4 h-4 mr-2" />Add Student</Button> : undefined}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-students" placeholder="Search by name, email, ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={deptFilter || "__all__"} onValueChange={(v) => setDeptFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-44" data-testid="select-filter-department"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Departments</SelectItem>
            {(departments.data ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-36" data-testid="select-filter-status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Student</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">ID</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Department</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Year</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">GPA</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : (students.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No students found</TableCell></TableRow>
            ) : (
              (students.data ?? []).map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setLocation(`/students/${s.id}`)} data-testid={`row-student-${s.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{s.studentId}</TableCell>
                  <TableCell className="text-sm">{s.departmentName ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.enrollmentYear}</TableCell>
                  <TableCell className="text-sm font-medium">{s.gpa ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setLocation(`/students/${s.id}`)} data-testid={`button-view-student-${s.id}`}><Eye className="w-3.5 h-3.5" /></Button>
                      {perms.canManageStudents && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(s)} data-testid={`button-edit-student-${s.id}`}><Pencil className="w-3.5 h-3.5" /></Button>}
                      {perms.canManageStudents && <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(s.id)} data-testid={`button-delete-student-${s.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Student" : "Add Student"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input data-testid="input-first-name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input data-testid="input-last-name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input data-testid="input-email" type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input data-testid="input-phone" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input data-testid="input-dob" type="date" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl><SelectTrigger data-testid="select-gender"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input data-testid="input-nationality" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input data-testid="input-address" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem><FormLabel>Department</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger data-testid="select-department"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {(departments.data ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="enrollmentYear" render={({ field }) => (
                  <FormItem><FormLabel>Enrollment Year</FormLabel><FormControl><Input data-testid="input-enrollment-year" type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-student">
                  {editItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Student</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this student? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
