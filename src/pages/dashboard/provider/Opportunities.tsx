import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OpportunityFormDialog from "@/components/dashboard/provider/OpportunityFormDialog";
import WhatHappensNext from "@/components/WhatHappensNext";
import { useNavigate } from "react-router-dom";
import { useProviderSubscription } from "@/hooks/useProviderSubscription";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  rejected: "bg-destructive/10 text-destructive",
  inactive: "bg-muted text-muted-foreground",
  deleted: "bg-muted text-muted-foreground",
};

export default function Opportunities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpp, setEditOpp] = useState<any | null>(null);
  const [requestingRenewal, setRequestingRenewal] = useState(false);
  const { subscription, isActive, isExpired, postingLimit, refetch: refetchSubscription } = useProviderSubscription();

  useEffect(() => {
    if (!user) return;
    fetchOpps();
  }, [user]);

  const fetchOpps = async () => {
    const { data } = await supabase
      .from("opportunities")
      .select("*, applications(id)")
      .eq("provider_id", user!.id)
      .order("created_at", { ascending: false });
    setOpps((data || []).map((o: any) => ({ ...o, apps_count: o.applications?.length ?? 0 })));
    setLoading(false);
  };

  const activeOpps = useMemo(() => opps.filter(o => o.status !== "deleted"), [opps]);
  const postsUsedThisPeriod = useMemo(() => {
    if (!subscription?.current_period_start) return activeOpps.length;

    const cycleStart = new Date(subscription.current_period_start).getTime();
    return activeOpps.filter((opp) => {
      if (!opp.created_at) return true;
      return new Date(opp.created_at).getTime() >= cycleStart;
    }).length;
  }, [activeOpps, subscription?.current_period_start]);

  const hasReachedPostingLimit = postingLimit !== null && postsUsedThisPeriod >= postingLimit;
  const isPendingReview = Boolean(subscription && !isExpired && !isActive);
  const canPost = Boolean(subscription && isActive && !hasReachedPostingLimit);

  const limitMessage = isExpired
    ? "Your subscription has expired. Renew your plan to continue posting new opportunities."
    : isPendingReview
      ? "Your subscription is awaiting review. Posting will be restored once an admin approves it."
      : hasReachedPostingLimit
        ? "You have reached your current posting limit. Request a renewal or a new plan to keep posting."
        : null;

  const requestPlanUpdate = async () => {
    if (!user || !subscription) return;
    setRequestingRenewal(true);
    try {
      const requestReason = isExpired ? "renewal_request" : hasReachedPostingLimit ? "plan_change_request" : "subscription_update_request";
      const adminMessage = isExpired
        ? "A provider restarted their subscription after expiration."
        : hasReachedPostingLimit
          ? "A provider reached the posting limit and started a new plan request."
          : "A provider started a new subscription request.";

      // Notify admin BEFORE deleting (audit + notification)
      await Promise.all([
        supabase.from("admin_notifications").insert({
          provider_id: user.id,
          type: requestReason,
          message: adminMessage,
        }),
        supabase.from("subscription_audit_logs").insert({
          subscription_id: subscription.id,
          action: requestReason,
          notes: limitMessage || "Provider restarted subscription request flow.",
        }),
      ]);

      // Wipe prior audit logs + the existing subscription so the provider can start fresh
      await supabase.from("subscription_audit_logs").delete().eq("subscription_id", subscription.id);
      const { error: deleteError } = await supabase
        .from("provider_subscriptions")
        .delete()
        .eq("id", subscription.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Let's pick a new plan",
        description: "Select a plan and upload your payment receipt to send a fresh request to admin.",
      });

      navigate("/provider/subscribe");
    } catch (err: any) {
      toast({ title: "Unable to start new request", description: err.message, variant: "destructive" });
    } finally {
      setRequestingRenewal(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" || current === "approved" ? "inactive" : "active";
    await supabase.from("opportunities").update({ status: newStatus }).eq("id", id);
    fetchOpps();
  };

  const deleteOpp = async (id: string) => {
    await supabase.from("opportunities").update({ status: "deleted" }).eq("id", id);
    toast({ title: "Opportunity removed" });
    fetchOpps();
  };

  const openEdit = (opp: any) => {
    setEditOpp(opp);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditOpp(null);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setDialogOpen(false);
    setEditOpp(null);
    fetchOpps();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            {postingLimit ? `${postsUsedThisPeriod} / ${postingLimit} used this cycle` : "Unlimited postings"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canPost && subscription && (
            <Button variant="outline" className="rounded-lg font-semibold" onClick={requestPlanUpdate} disabled={requestingRenewal}>
              <RefreshCw size={16} className={`mr-1 ${requestingRenewal ? "animate-spin" : ""}`} />
              {requestingRenewal ? "Sending…" : isExpired ? "Request Renewal" : "Request New Plan"}
            </Button>
          )}
          <Button className="btn-gradient rounded-lg font-semibold" disabled={!canPost} onClick={openCreate} title={limitMessage || undefined}>
            {!canPost && <Lock size={16} className="mr-1" />}
          <Plus size={18} className="mr-1" /> New Opportunity
          </Button>
        </div>
      </div>

      {isPendingReview && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-800">
            ⏳ Your subscription is pending admin approval. Opportunity posting will be unlocked once approved.
          </CardContent>
        </Card>
      )}

      {limitMessage && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col gap-3 py-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Lock size={16} />
              <span>{limitMessage}</span>
            </div>
            {subscription && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/dashboard/provider/subscription") }>
                Manage Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeOpps.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            No opportunities yet. Create your first one!
          </CardContent>
        </Card>
      ) : (
        <Card className="glow-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Views</TableHead>
                <TableHead className="hidden lg:table-cell">Applicants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOpps.map((opp, i) => (
                <motion.tr key={opp.id} className="border-b transition-colors hover:bg-muted/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <TableCell className="font-medium">{opp.title}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize">{opp.category}</TableCell>
                  <TableCell className="hidden sm:table-cell">{opp.location || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <Badge className={statusStyles[opp.status] || statusStyles.draft}>{opp.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{opp.views_count ?? 0}</TableCell>
                  <TableCell className="hidden lg:table-cell">{opp.apps_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(opp.id, opp.status)} title="Toggle visibility">
                        {opp.status === "active" || opp.status === "approved" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(opp)} title="Edit">
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteOpp(opp.id)} title="Delete">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <OpportunityFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditOpp(null); }}
        editOpp={editOpp}
          canPost={canPost}
          limitMessage={limitMessage}
        onSaved={handleSaved}
      />

      <WhatHappensNext />
    </div>
  );
}
