import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Bookmark, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
}

export default function Explore() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [appsRes, savedRes] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      const profileComplete = profile?.full_name && profile?.country && profile?.bio ? 100 : 60;

      setStats([
        { label: "Total Applications", value: appsRes.count ?? 0, icon: Briefcase },
        { label: "Saved Jobs", value: savedRes.count ?? 0, icon: Bookmark },
        { label: "Profile Completion", value: profileComplete, icon: BarChart3 },
      ]);
      setLoading(false);
    };
    fetchStats();
  }, [user, profile]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold text-foreground">
          Welcome, <span className="text-gradient">{profile?.full_name || "Seeker"}</span> 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Discover opportunities tailored to your goals.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="glow-border">
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-20" /></CardContent>
              </Card>
            ))
          : stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glow-border group hover:shadow-[var(--card-shadow-hover)] transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <s.icon size={16} className="text-primary" /> {s.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold text-foreground">
                      {s.label.includes("Completion") ? `${s.value}%` : s.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Recommended */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <TrendingUp size={18} className="text-primary" /> Recommended for You
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glow-border cursor-pointer transition-shadow hover:shadow-[var(--card-shadow-hover)]">
              <CardHeader>
                <CardTitle className="text-base">Sample Opportunity {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">This is a placeholder for recommended opportunities.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
