import { useState } from "react";
import { useListDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, useListFaculty, getListDepartmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Users, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";

const schema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  description: z.string().optional(),
  headFacultyId: z.coerce.number().optional(),
  building: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Departments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const departments = useListDepartments();
  const faculty = useListFaculty();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ name: "", code: "" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ name: item.name, code: item.code, description: item.description, headFacultyId: item.headFacultyId, building: item.building, phone: item.phone, email: item.email });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Department updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Department created" });
      }
      qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Department deleted" });
      qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Departments"
        subtitle="Manage university departments and faculties"
        action={<Button onClick={openCreate} data-testid="button-add-department"><Plus className="w-4 h-4 mr-2" />Add Department</Button>}
      />

      {departments.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (departments.data ?? []).length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">No departments found. Add one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(departments.data ?? []).map((dept) => (
            <div key={dept.id} className="bg-card border border-card-border rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" data-testid={`card-department-${dept.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{dept.code}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(dept)} data-testid={`button-edit-department-${dept.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(dept.id)} data-testid={`button-delete-department-${dept.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              {dept.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{dept.description}</p>}
              {dept.headFacultyName && (
                <p className="text-xs text-muted-foreground mb-3">Head: <span className="font-medium text-foreground">{dept.headFacultyName}</span></p>
              )}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><Users className="w-3 h-3" /></div>
                  <div className="text-sm font-bold">{dept.studentCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><GraduationCap className="w-3 h-3" /></div>
                  <div className="text-sm font-bold">{dept.facultyCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Faculty</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><BookOpen className="w-3 h-3" /></div>
                  <div className="text-sm font-bold">{dept.courseCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input data-testid="input-dept-name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem><FormLabel>Code</FormLabel><FormControl><Input data-testid="input-dept-code" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea data-testid="textarea-dept-description" rows={2} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="headFacultyId" render={({ field }) => (
                <FormItem><FormLabel>Department Head</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "__none__" ? undefined : Number(v))} value={field.value ? String(field.value) : "__none__"}>
                    <FormControl><SelectTrigger data-testid="select-head-faculty"><SelectValue placeholder="Select faculty" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {(faculty.data ?? []).map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.firstName} {f.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="building" render={({ field }) => (
                  <FormItem><FormLabel>Building</FormLabel><FormControl><Input data-testid="input-building" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input data-testid="input-dept-phone" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input data-testid="input-dept-email" type="email" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-department">{editItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Department</DialogTitle></DialogHeader>
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
