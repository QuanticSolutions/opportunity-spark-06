import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SavedJob {
  id: string;
  opportunity: { id: string; title: string; company: string | null; category: string; deadline: string | null } | null;
}

export default function SavedJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_jobs")
      .select("id, opportunity:opportunities(id, title, company, category, deadline)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSaved((data as unknown as SavedJob[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSaved(); }, [user]);

  const handleRemove = async (savedId: string) => {
    await supabase.from("saved_jobs").delete().eq("id", savedId);
    setSaved((prev) => prev.filter((s) => s.id !== savedId));
    toast({ title: "Removed from saved" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
        <Bookmark size={22} className="text-primary" /> Saved Jobs
      </h1>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
        </div>
      ) : saved.length === 0 ? (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No saved jobs yet. Browse opportunities and save them here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item) => (
            <Card key={item.id} className="glow-border group hover:shadow-[var(--card-shadow-hover)] transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.opportunity?.title || "Opportunity"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{item.opportunity?.category || "Job"}</Badge>
                  <DeadlineCountdown deadline={item.opportunity?.deadline || null} />
                </div>
                <p className="text-sm text-muted-foreground">{item.opportunity?.company || "Company"}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="btn-gradient rounded-lg font-semibold flex-1"
                    onClick={() => item.opportunity && navigate(`/opportunities/${item.opportunity.id}`)}
                  >
                    View & Apply
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemove(item.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
