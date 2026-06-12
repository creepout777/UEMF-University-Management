import { useState } from "react";
import { useListAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Bell } from "lucide-react";
import { usePermissions } from "@/contexts/AuthContext";
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
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

const CATEGORIES = ["academic","administrative","event","emergency","general"] as const;
const PRIORITIES = ["low","medium","high","urgent"] as const;
const AUDIENCES = ["all","students","faculty","staff"] as const;

const priorityBorder: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-400",
  medium: "border-l-blue-400",
  low: "border-l-gray-300",
};

const schema = z.object({
  title: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  targetAudience: z.enum(AUDIENCES),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Announcements() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const perms = usePermissions();

  const announcements = useListAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "", category: "general", priority: "medium", targetAudience: "all", isActive: true },
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ title: "", content: "", category: "general", priority: "medium", targetAudience: "all", isActive: true });
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    form.reset({ title: item.title, content: item.content, category: item.category, priority: item.priority, targetAudience: item.targetAudience, expiresAt: item.expiresAt, isActive: item.isActive });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: values });
        toast({ title: "Announcement updated" });
      } else {
        await createMutation.mutateAsync({ data: values });
        toast({ title: "Announcement published" });
      }
      qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Announcement deleted" });
      qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <PageHeader
        title="Announcements"
        subtitle="University-wide announcements and notices"
        action={perms.canManageAnnouncements ? <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Announcement</Button> : undefined}
      />

      {announcements.isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : (announcements.data ?? []).length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-sm text-muted-foreground">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(announcements.data ?? []).map((a) => (
            <div
              key={a.id}
              className={cn("bg-card border border-card-border rounded-xl shadow-sm p-5 border-l-4", priorityBorder[a.priority] ?? "border-l-gray-300")}
              data-testid={`card-announcement-${a.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    <StatusBadge status={a.priority} />
                    <StatusBadge status={a.category} />
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">{a.targetAudience}</span>
                    {!a.isActive && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Inactive</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</p>
                </div>
                {perms.canManageAnnouncements && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(a)} data-testid={`button-edit-announcement-${a.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(a.id)} data-testid={`button-delete-announcement-${a.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Announcement" : "New Announcement"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-announcement-title" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea data-testid="textarea-content" rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem><FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                  <FormItem><FormLabel>Audience</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-audience"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expiresAt" render={({ field }) => (
                  <FormItem><FormLabel>Expires At</FormLabel><FormControl><Input data-testid="input-expires-at" type="date" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-announcement">{editItem ? "Update" : "Publish"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Announcement</DialogTitle></DialogHeader>
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
