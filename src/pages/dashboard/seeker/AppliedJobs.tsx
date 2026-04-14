import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, UserCheck, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const statusDisplay: Record<string, { color: string; icon: React.ReactNode; message: string }> = {
  submitted: {
    color: "bg-muted text-muted-foreground",
    icon: <Clock size={14} />,
    message: "Your application has been submitted",
  },
  shortlisted: {
    color: "bg-blue-100 text-blue-700",
    icon: <UserCheck size={14} />,
    message: "You have been shortlisted!",
  },
  interview: {
    color: "bg-orange-100 text-orange-700",
    icon: <Calendar size={14} />,
    message: "Interview stage – check your messages",
  },
  hired: {
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 size={14} />,
    message: "Congratulations! You have been hired!",
  },
  denied: {
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
    message: "Application was not successful",
  },
};

interface Application {
  id: string;
  status: string;
  created_at: string;
  opportunity: { title: string; company: string | null } | null;
}

export default function AppliedJobs() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = () => {
      supabase
        .from("applications")
        .select("id, status, created_at, opportunity:opportunities(title, company)")
        .eq("seeker_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setApps((data as unknown as Application[]) || []);
          setLoading(false);
        });
    };

    fetch();

    // Realtime subscription for status updates
    const channel = supabase
      .channel("seeker-applications")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications", filter: `seeker_id=eq.${user.id}` },
        () => fetch()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
        <FileCheck size={22} className="text-primary" /> Applied Jobs
      </h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
      ) : apps.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No applications yet. Start exploring opportunities!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Desktop table */}
          <Card className="overflow-hidden border-border/50 hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Update</TableHead>
                  <TableHead>Date Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => {
                  const cfg = statusDisplay[app.status] || statusDisplay.submitted;
                  return (
                    <TableRow key={app.id} className="hover:bg-accent/50 transition-colors">
                      <TableCell className="font-medium">{app.opportunity?.title || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{app.opportunity?.company || "—"}</TableCell>
                      <TableCell>
                        <Badge className={`${cfg.color} gap-1`}>
                          {cfg.icon}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">{cfg.message}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {apps.map((app) => {
              const cfg = statusDisplay[app.status] || statusDisplay.submitted;
              return (
                <Card key={app.id}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{app.opportunity?.title || "—"}</p>
                        <p className="text-sm text-muted-foreground">{app.opportunity?.company || "—"}</p>
                      </div>
                      <Badge className={`${cfg.color} gap-1 shrink-0`}>
                        {cfg.icon}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{cfg.message}</p>
                    <p className="text-xs text-muted-foreground">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
