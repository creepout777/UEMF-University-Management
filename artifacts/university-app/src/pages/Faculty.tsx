import { useState } from "react";
import { useListFaculty, useCreateFaculty, useUpdateFaculty, useDeleteFaculty, useListDepartments, getListFacultyQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, MapPin, Clock } from "lucide-react";
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

const TITLES = ["professor", "associate_professor", "assistant_professor", "lecturer", "instructor"] as const;

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.coerce.number().min(1, "Required"),
  title: z.enum(TITLES),
  specialization: z.string().optional(),
  officeLocation: z.string().optional(),
  officeHours: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]),
});
type FormValues = z.infer<typeof schema>;

export default function Faculty() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const perms = usePermissions();

  const params: any = {};
  if (search) params.search = search;
  if (deptFilter) params.departmentId = Number(deptFilter);

  const faculty = useListFaculty(params);
  const departments = useListDepartments();
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();
  const deleteMutation = useDeleteFaculty();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", departmentId: 0, title: "lecturer", status: "active" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ firstName: "", lastName: "", email: "", departmentId: 0, title: "lecturer", status: "active" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ firstName: item.firstName, lastName: item.lastName, email: item.email, phone: item.phone, departmentId: item.departmentId, title: item.title, specialization: item.specialization, officeLocation: item.officeLocation, officeHours: item.officeHours, status: item.status });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Faculty member updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Faculty member created" });
      }
      qc.invalidateQueries({ queryKey: getListFacultyQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Faculty member deleted" });
      qc.invalidateQueries({ queryKey: getListFacultyQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Faculty"
        subtitle="Manage faculty members and staff"
        action={perms.canManageFaculty ? <Button onClick={openCreate} data-testid="button-add-faculty"><Plus className="w-4 h-4 mr-2" />Add Faculty</Button> : undefined}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-faculty" placeholder="Search faculty..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Faculty Member</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Title</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Department</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Specialization</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Office</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Courses</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
            ) : (faculty.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No faculty found</TableCell></TableRow>
            ) : (
              (faculty.data ?? []).map((f) => (
                <TableRow key={f.id} className="hover:bg-muted/20" data-testid={`row-faculty-${f.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                        {f.firstName[0]}{f.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{f.firstName} {f.lastName}</div>
                        <div className="text-xs text-muted-foreground">{f.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{f.title.replace(/_/g, " ")}</TableCell>
                  <TableCell className="text-sm">{f.departmentName ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.specialization ?? "—"}</TableCell>
                  <TableCell>
                    {f.officeLocation && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />{f.officeLocation}
                      </div>
                    )}
                    {f.officeHours && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{f.officeHours}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{f.courseCount ?? 0}</TableCell>
                  <TableCell><StatusBadge status={f.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {perms.canManageFaculty && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(f)} data-testid={`button-edit-faculty-${f.id}`}><Pencil className="w-3.5 h-3.5" /></Button>}
                      {perms.canManageFaculty && <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(f.id)} data-testid={`button-delete-faculty-${f.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
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
          <DialogHeader><DialogTitle>{editItem ? "Edit Faculty" : "Add Faculty"}</DialogTitle></DialogHeader>
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
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem><FormLabel>Department</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger data-testid="select-department"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{(departments.data ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-title"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TITLES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="specialization" render={({ field }) => (
                <FormItem><FormLabel>Specialization</FormLabel><FormControl><Input data-testid="input-specialization" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="officeLocation" render={({ field }) => (
                  <FormItem><FormLabel>Office</FormLabel><FormControl><Input data-testid="input-office" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="officeHours" render={({ field }) => (
                  <FormItem><FormLabel>Office Hours</FormLabel><FormControl><Input data-testid="input-office-hours" placeholder="e.g. Mon 9-11am" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-faculty">{editItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Faculty Member</DialogTitle></DialogHeader>
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
