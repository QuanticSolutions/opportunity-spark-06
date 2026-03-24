import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "provider")
        .order("created_at", { ascending: false });

      // Fetch subscriptions for each provider
      const providerIds = (data || []).map((p) => p.id);
      const { data: subs } = await supabase
        .from("provider_subscriptions")
        .select("*, subscription_plans(display_name)")
        .in("provider_id", providerIds);

      const subsMap = new Map((subs || []).map((s) => [s.provider_id, s]));

      setProviders(
        (data || []).map((p) => ({
          ...p,
          subscription: subsMap.get(p.id) || null,
        }))
      );
      setLoading(false);
    }
    fetch();
  }, []);

  const statusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending_approval": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Provider Management</h1>
        <p className="text-sm text-muted-foreground">Manage opportunity providers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Providers ({providers.length})</CardTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Subscription Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell>{p.country || "—"}</TableCell>
                    <TableCell>{p.subscription?.subscription_plans?.display_name || "None"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.subscription?.status || "none")}>
                        {p.subscription?.status || "No subscription"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
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
