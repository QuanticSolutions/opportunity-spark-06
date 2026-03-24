import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, CheckCircle, Calendar, UserCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export default function ProviderHome() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch provider's opportunities
      const { data: opps } = await supabase
        .from("opportunities")
        .select("id, status")
        .eq("provider_id", user!.id);

      const totalOpps = opps?.length || 0;
      const activeOpps = opps?.filter(o => o.status === "active").length || 0;
      const oppIds = opps?.map(o => o.id) || [];

      let totalApplicants = 0;
      let shortlisted = 0;
      let interviews = 0;
      let hired = 0;
      let applicantRows: any[] = [];

      if (oppIds.length > 0) {
        const { data: apps } = await supabase
          .from("applications")
          .select("*, profiles!applications_user_id_fkey(full_name, avatar_url)")
          .in("opportunity_id", oppIds)
          .order("created_at", { ascending: false })
          .limit(10);

        applicantRows = apps || [];
        totalApplicants = apps?.length || 0;
        shortlisted = apps?.filter(a => a.status === "shortlisted").length || 0;
        interviews = apps?.filter(a => a.status === "interview").length || 0;
        hired = apps?.filter(a => a.status === "hired").length || 0;
      }

      setStats([
        { label: "Total Opportunities", value: totalOpps, icon: Briefcase, color: "text-primary" },
        { label: "Active Opportunities", value: activeOpps, icon: CheckCircle, color: "text-emerald-500" },
        { label: "Total Applicants", value: totalApplicants, icon: Users, color: "text-primary" },
        { label: "Shortlisted", value: shortlisted, icon: UserCheck, color: "text-amber-500" },
        { label: "Interviews", value: interviews, icon: Calendar, color: "text-violet-500" },
        { label: "Hired", value: hired, icon: CheckCircle, color: "text-emerald-500" },
      ]);

      // Map recent applicants with opportunity title
      if (applicantRows.length > 0) {
        const { data: oppData } = await supabase
          .from("opportunities")
          .select("id, title")
          .in("id", applicantRows.map(a => a.opportunity_id));

        const oppMap = new Map(oppData?.map(o => [o.id, o.title]) || []);
        setRecentApplicants(
          applicantRows.slice(0, 5).map(a => ({
            ...a,
            opportunity_title: oppMap.get(a.opportunity_id) || "Unknown",
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    submitted: "bg-muted text-muted-foreground",
    shortlisted: "bg-amber-100 text-amber-700",
    interview: "bg-violet-100 text-violet-700",
    hired: "bg-emerald-100 text-emerald-700",
    denied: "bg-destructive/10 text-destructive",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Welcome, <span className="text-gradient">{profile?.full_name || "Provider"}</span> 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Manage your opportunities and applicants.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glow-border">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`rounded-xl bg-accent p-3 ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Applicants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplicants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applicants yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Opportunity</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplicants.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-foreground">
                        {(a.profiles as any)?.full_name || "Unknown"}
                      </td>
                      <td className="py-3 text-muted-foreground">{a.opportunity_title}</td>
                      <td className="py-3">
                        <Badge className={statusColor[a.status] || ""}>{a.status}</Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
