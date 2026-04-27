import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("provider_subscriptions")
      .select("*, subscription_plans(name, display_name, posting_limit), profiles!provider_subscriptions_provider_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    setSubs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const updateStatus = async (subId: string, providerId: string, status: string) => {
    const adminUser = (await supabase.auth.getUser()).data.user;
    const updates: any = { status };
    if (status === "active") {
      updates.approved_by = adminUser?.id;
      updates.approved_at = new Date().toISOString();
      updates.status = "active";
      updates.payment_status = "paid";

      const now = new Date();
      const sub = subs.find((item) => item.id === subId);
      const cycleStart = sub?.status === "active" && sub?.current_period_end && new Date(sub.current_period_end) > now
        ? new Date(sub.current_period_end)
        : now;
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);

      updates.current_period_start = cycleStart.toISOString();
      updates.current_period_end = cycleEnd.toISOString();
      updates.renewal_date = cycleEnd.toISOString();
    }

    if (status === "cancelled") {
      updates.payment_status = "failed";
    }

    if (status === "pending") {
      updates.payment_status = "awaiting_payment";
    }

    const { error } = await supabase
      .from("provider_subscriptions")
      .update(updates)
      .eq("id", subId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("subscription_audit_logs").insert({
      subscription_id: subId,
      admin_id: adminUser?.id,
      action: `Status changed to ${status}`,
    });

    await supabase.from("admin_logs").insert({
      admin_id: adminUser?.id,
      action: `Subscription ${status}`,
      target_id: subId,
      target_type: "subscription",
    });

    toast({ title: `Subscription ${status}` });
    fetchSubs();
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": case "pending_approval": case "pending": return "secondary";
      case "expired": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
        <p className="text-sm text-muted-foreground">Review and manage provider subscriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({subs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Cycle</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {(sub.profiles as any)?.full_name || "—"}
                    </TableCell>
                    <TableCell>{sub.subscription_plans?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                    </TableCell>
                     <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                       {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}
                     </TableCell>
                    <TableCell>
                      {sub.receipt_url ? (
                        <a
                          href={sub.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline"
                        >
                          View
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {sub.status !== "active" && (
                          <Button size="sm" onClick={() => updateStatus(sub.id, sub.provider_id, "active")}>
                            {sub.status === "expired" ? "Renew" : "Approve"}
                          </Button>
                        )}
                        {sub.status !== "cancelled" && sub.status !== "active" && (
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(sub.id, sub.provider_id, "cancelled")}>
                            Reject
                          </Button>
                        )}
                        {(sub.status === "pending" || sub.status === "pending_approval" || sub.status === "pending") && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(sub.id, sub.provider_id, "pending")}>
                            Mark Under Review
                          </Button>
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
    </div>
  );
}
