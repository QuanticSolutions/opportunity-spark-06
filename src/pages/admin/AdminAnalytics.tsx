import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Briefcase, FileText } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState({
    totalUsers: 0,
    seekers: 0,
    providers: 0,
    opportunities: 0,
    applications: 0,
    articles: 0,
    userGrowth: [] as { month: string; count: number }[],
  });

  useEffect(() => {
    async function fetch() {
      const [
        { count: totalUsers },
        { count: seekers },
        { count: providers },
        { count: opportunities },
        { count: applications },
        { count: articles },
        { data: profiles },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seeker"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "provider"),
        supabase.from("opportunities").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("created_at").order("created_at"),
      ]);

      // Group by month
      const months = new Map<string, number>();
      (profiles || []).forEach((p) => {
        const month = new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        months.set(month, (months.get(month) || 0) + 1);
      });

      setData({
        totalUsers: totalUsers || 0,
        seekers: seekers || 0,
        providers: providers || 0,
        opportunities: opportunities || 0,
        applications: applications || 0,
        articles: articles || 0,
        userGrowth: Array.from(months.entries()).map(([month, count]) => ({ month, count })),
      });
    }
    fetch();
  }, []);

  const stats = [
    { label: "Total Users", value: data.totalUsers, icon: Users, sub: `${data.seekers} seekers, ${data.providers} providers` },
    { label: "Opportunities", value: data.opportunities, icon: Briefcase, sub: "Total posted" },
    { label: "Applications", value: data.applications, icon: TrendingUp, sub: "Total submitted" },
    { label: "Articles", value: data.articles, icon: FileText, sub: "Total published" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform performance overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{s.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          {data.userGrowth.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data.userGrowth.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-muted-foreground">{m.month}</span>
                  <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (m.count / Math.max(...data.userGrowth.map((g) => g.count))) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{m.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
