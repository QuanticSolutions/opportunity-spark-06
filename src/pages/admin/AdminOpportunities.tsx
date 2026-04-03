import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Loader2 } from "lucide-react";

export default function AdminOpportunities() {
  const navigate = useNavigate();
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editOpp, setEditOpp] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", location: "", status: "", description: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchOpps = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("opportunities")
      .select("*, profiles!opportunities_provider_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    setOpps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOpps(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("opportunities").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    const adminUser = (await supabase.auth.getUser()).data.user;
    await supabase.from("admin_logs").insert({
      admin_id: adminUser?.id, action: `Opportunity ${status}`, target_id: id, target_type: "opportunity",
    });
    toast({ title: `Opportunity ${status}` });
    fetchOpps();
  };

  const openEdit = (opp: any) => {
    setEditOpp(opp);
    setEditForm({
      title: opp.title || "",
      category: opp.category || "job",
      location: opp.location || "",
      status: opp.status || "pending",
      description: opp.description || "",
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split("T")[0] : "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editOpp) return;
    setSubmitting(true);
    const { error } = await supabase.from("opportunities").update({
      title: editForm.title,
      category: editForm.category,
      location: editForm.location,
      status: editForm.status,
      description: editForm.description,
      deadline: editForm.deadline || null,
    }).eq("id", editOpp.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opportunity updated successfully" });
      setEditOpen(false);
      fetchOpps();
    }
    setSubmitting(false);
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Opportunity Management</h1>
          <p className="text-sm text-muted-foreground">Manage all opportunities on the platform</p>
        </div>
        <Button className="btn-gradient" onClick={() => navigate("/admin/opportunities/create")}>
          <Plus size={18} className="mr-1" /> Create Opportunity
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Opportunities ({opps.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opps.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium max-w-48 truncate">{opp.title}</TableCell>
                    <TableCell>{(opp.profiles as any)?.full_name || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{opp.category}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant(opp.status)}>{opp.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(opp.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(opp)}><Pencil size={14} className="mr-1" /> Edit</Button>
                        {opp.status !== "approved" && (
                          <Button size="sm" onClick={() => updateStatus(opp.id, "approved")}>Approve</Button>
                        )}
                        {opp.status !== "rejected" && (
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(opp.id, "rejected")}>Reject</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Opportunity Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>Update opportunity details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="scholarship">Scholarship</SelectItem>
                    <SelectItem value="grant">Grant</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="fellowship">Fellowship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Deadline</Label>
                <Input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={submitting} className="bg-primary text-primary-foreground">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
