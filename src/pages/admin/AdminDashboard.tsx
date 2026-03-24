import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Shield, CreditCard, FileText, Inbox } from "lucide-react";

interface Metric {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const [
        { count: usersCount },
        { count: opportunitiesCount },
        { count: providersCount },
        { count: pendingSubsCount },
        { count: articlesCount },
        { count: applicationsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "provider"),
        supabase.from("provider_subscriptions").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("applications").select("*", { count: "exact", head: true }),
      ]);

      setMetrics([
        { label: "Total Users", value: usersCount || 0, icon: Users, color: "text-blue-500" },
        { label: "Active Opportunities", value: opportunitiesCount || 0, icon: Briefcase, color: "text-green-500" },
        { label: "Active Providers", value: providersCount || 0, icon: Shield, color: "text-purple-500" },
        { label: "Pending Subscriptions", value: pendingSubsCount || 0, icon: CreditCard, color: "text-yellow-500" },
        { label: "Articles Published", value: articlesCount || 0, icon: FileText, color: "text-indigo-500" },
        { label: "Applications", value: applicationsCount || 0, icon: Inbox, color: "text-pink-500" },
      ]);
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">System overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2"><div className="h-4 w-24 rounded bg-muted" /></CardHeader>
                <CardContent><div className="h-8 w-16 rounded bg-muted" /></CardContent>
              </Card>
            ))
          : metrics.map((m) => (
              <Card key={m.label} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
                  <m.icon className={`h-5 w-5 ${m.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{m.value.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecentActivity() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setLogs(data || []));
  }, []);

  if (logs.length === 0) return <p className="text-sm text-muted-foreground">No recent activity</p>;

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
          <div>
            <p className="text-sm font-medium">{log.action}</p>
            <p className="text-xs text-muted-foreground">{log.target_type}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(log.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function PendingActions() {
  const [pending, setPending] = useState({ subscriptions: 0, submissions: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("provider_subscriptions").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
      supabase.from("content_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([subs, submissions]) => {
      setPending({
        subscriptions: subs.count || 0,
        submissions: submissions.count || 0,
      });
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <span className="text-sm font-medium">Pending Subscriptions</span>
        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-sm font-semibold text-yellow-700">
          {pending.subscriptions}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
        <span className="text-sm font-medium">Pending Submissions</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-semibold text-blue-700">
          {pending.submissions}
        </span>
      </div>
    </div>
  );
}
