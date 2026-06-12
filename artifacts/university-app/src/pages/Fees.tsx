import { useState } from "react";
import { useListFees, useCreateFee, useUpdateFee, useGetFeeStats, useListStudents, getListFeesQueryKey, getGetFeeStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
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

const FEE_TYPES = ["tuition","registration","library","lab","dormitory","other"] as const;
const FEE_STATUSES = ["pending","paid","overdue","waived"] as const;

const schema = z.object({
  studentId: z.coerce.number().min(1, "Required"),
  type: z.enum(FEE_TYPES),
  amount: z.coerce.number().min(0, "Required"),
  dueDate: z.string().min(1, "Required"),
  paidDate: z.string().optional(),
  status: z.enum(FEE_STATUSES),
  semester: z.string().min(1, "Required"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Fees() {
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const perms = usePermissions();

  const params: any = {};
  if (statusFilter) params.status = statusFilter;

  const fees = useListFees(params);
  const feeStats = useGetFeeStats();
  const students = useListStudents();
  const createMutation = useCreateFee();
  const updateMutation = useUpdateFee();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: 0, type: "tuition", amount: 0, dueDate: "", status: "pending", semester: "Fall-2024" },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ studentId: 0, type: "tuition", amount: 0, dueDate: "", status: "pending", semester: "Fall-2024" });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ studentId: item.studentId, type: item.type, amount: item.amount, dueDate: item.dueDate, paidDate: item.paidDate, status: item.status, semester: item.semester, description: item.description });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Fee updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Fee created" });
      }
      qc.invalidateQueries({ queryKey: getListFeesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetFeeStatsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const stats = feeStats.data;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Fee Management"
        subtitle="Manage student fees and payments"
        action={perms.canManageFees ? <Button onClick={openCreate} data-testid="button-add-fee"><Plus className="w-4 h-4 mr-2" />Add Fee</Button> : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {feeStats.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-600" /><span className="text-xs text-emerald-700 font-medium">Collected</span></div>
              <div className="text-xl font-bold text-emerald-700">MAD {(stats?.totalCollected ?? 0).toLocaleString()}</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-amber-600" /><span className="text-xs text-amber-700 font-medium">Pending</span></div>
              <div className="text-xl font-bold text-amber-700">MAD {(stats?.totalPending ?? 0).toLocaleString()}</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-600" /><span className="text-xs text-red-700 font-medium">Overdue</span></div>
              <div className="text-xl font-bold text-red-700">MAD {(stats?.totalOverdue ?? 0).toLocaleString()}</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-blue-600" /><span className="text-xs text-blue-700 font-medium">Collection Rate</span></div>
              <div className="text-xl font-bold text-blue-700">{(stats?.collectionRate ?? 0).toFixed(1)}%</div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={statusFilter || "__all__"} onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-40" data-testid="select-fee-status"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All</SelectItem>
            {FEE_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Student</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Semester</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Due Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Paid Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
            ) : (fees.data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No fee records found</TableCell></TableRow>
            ) : (
              (fees.data ?? []).map((f) => (
                <TableRow key={f.id} className="hover:bg-muted/20" data-testid={`row-fee-${f.id}`}>
                  <TableCell className="text-sm font-medium">{f.studentName ?? `Student #${f.studentId}`}</TableCell>
                  <TableCell className="text-sm capitalize">{f.type}</TableCell>
                  <TableCell className="text-sm font-semibold">MAD {Number(f.amount).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.semester}</TableCell>
                  <TableCell className="text-sm">{f.dueDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.paidDate ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={f.status} /></TableCell>
                  <TableCell className="text-right">
                    {perms.canManageFees && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(f)} data-testid={`button-edit-fee-${f.id}`}><Pencil className="w-3.5 h-3.5" /></Button>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Fee" : "Add Fee"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="studentId" render={({ field }) => (
                <FormItem><FormLabel>Student</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                    <FormControl><SelectTrigger data-testid="select-student"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>{(students.data ?? []).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-fee-type"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{FEE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Amount (MAD)</FormLabel><FormControl><Input data-testid="input-amount" type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input data-testid="input-due-date" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paidDate" render={({ field }) => (
                  <FormItem><FormLabel>Paid Date</FormLabel><FormControl><Input data-testid="input-paid-date" type="date" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-fee-status-form"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{FEE_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="semester" render={({ field }) => (
                  <FormItem><FormLabel>Semester</FormLabel><FormControl><Input data-testid="input-semester" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input data-testid="input-description" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-fee">{editItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
