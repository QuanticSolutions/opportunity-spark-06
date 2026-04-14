import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, FileText, Users, UserCheck, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type AppStatus = "submitted" | "shortlisted" | "interview" | "hired" | "denied";

const statusConfig: Record<AppStatus, { label: string; color: string; activeColor: string; icon: React.ReactNode }> = {
  submitted: { label: "Submitted", color: "bg-muted text-muted-foreground", activeColor: "bg-muted text-muted-foreground border-muted-foreground/30", icon: <Users size={14} /> },
  shortlisted: { label: "Shortlisted", color: "bg-blue-100 text-blue-700", activeColor: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600", icon: <UserCheck size={14} /> },
  interview: { label: "Interview", color: "bg-orange-100 text-orange-700", activeColor: "bg-orange-500 text-white hover:bg-orange-600 border-orange-500", icon: <Calendar size={14} /> },
  hired: { label: "Hired", color: "bg-emerald-100 text-emerald-700", activeColor: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600", icon: <CheckCircle2 size={14} /> },
  denied: { label: "Denied", color: "bg-red-100 text-red-700", activeColor: "bg-red-600 text-white hover:bg-red-700 border-red-600", icon: <XCircle size={14} /> },
};

const statusTabs: Array<{ value: string; label: string; statuses: AppStatus[] }> = [
  { value: "all", label: "All Applicants", statuses: [] },
  { value: "shortlisted", label: "Shortlisted", statuses: ["shortlisted"] },
  { value: "interview", label: "Interview", statuses: ["interview"] },
  { value: "hired", label: "Hired", statuses: ["hired"] },
  { value: "denied", label: "Denied", statuses: ["denied"] },
];

export default function Applicants() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpp, setFilterOpp] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [opps, setOpps] = useState<any[]>([]);
  const [emailModal, setEmailModal] = useState<{ open: boolean; recipientId: string; name: string }>({ open: false, recipientId: "", name: "" });
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: myOpps } = await supabase
      .from("opportunities")
      .select("id, title")
      .eq("provider_id", user!.id);

    setOpps(myOpps || []);
    const oppIds = myOpps?.map((o) => o.id) || [];

    if (oppIds.length === 0) {
      setApplicants([]);
      setLoading(false);
      return;
    }

    const { data: apps } = await supabase
      .from("applications")
      .select("*, profiles!applications_seeker_id_fkey(full_name, avatar_url, bio, country)")
      .in("opportunity_id", oppIds)
      .order("created_at", { ascending: false });

    const oppMap = new Map(myOpps?.map((o) => [o.id, o.title]) || []);

    const appIds = (apps || []).map((a) => a.id);
    let docsMap = new Map<string, any[]>();
    if (appIds.length > 0) {
      const { data: docs } = await supabase
        .from("application_documents")
        .select("*")
        .in("application_id", appIds);
      (docs || []).forEach((d) => {
        const list = docsMap.get(d.application_id) || [];
        list.push(d);
        docsMap.set(d.application_id, list);
      });
    }

    setApplicants(
      (apps || []).map((a) => ({
        ...a,
        opportunity_title: oppMap.get(a.opportunity_id) || "Unknown",
        documents: docsMap.get(a.id) || [],
      }))
    );
    setLoading(false);
  };

  const viewDocument = async (fileUrl: string) => {
    if (!fileUrl) {
      toast({ title: "No document uploaded", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(fileUrl, 60);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not access document", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const updateStatus = async (appId: string, status: AppStatus) => {
    setUpdatingId(appId);
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      // Optimistic update
      setApplicants((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
      toast({ title: `Status updated to ${statusConfig[status].label}` });
    }
    setUpdatingId(null);
  };

  const sendMessage = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setSendingEmail(true);
    try {
      await supabase.from("messages").insert({
        sender_id: user!.id,
        recipient_id: emailModal.recipientId,
        subject: emailForm.subject,
        body: emailForm.message,
      });
      toast({ title: "Message sent" });
      setEmailModal({ open: false, recipientId: "", name: "" });
      setEmailForm({ subject: "", message: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  // Filter by opportunity
  const byOpp = filterOpp === "all" ? applicants : applicants.filter((a) => a.opportunity_id === filterOpp);
  // Filter by status tab
  const currentTab = statusTabs.find((t) => t.value === activeTab);
  const filtered = currentTab && currentTab.statuses.length > 0
    ? byOpp.filter((a) => currentTab.statuses.includes(a.status))
    : byOpp;

  const statusCounts = statusTabs.reduce((acc, tab) => {
    acc[tab.value] = tab.statuses.length > 0
      ? byOpp.filter((a) => tab.statuses.includes(a.status)).length
      : byOpp.length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-foreground">Applicants</h1>
        <Select value={filterOpp} onValueChange={setFilterOpp}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by opportunity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Opportunities</SelectItem>
            {opps.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {statusCounts[tab.value] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No {tab.value === "all" ? "" : tab.label.toLowerCase() + " "}applicants found.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((a, i) => (
                  <ApplicantCard
                    key={a.id}
                    applicant={a}
                    index={i}
                    isUpdating={updatingId === a.id}
                    onStatusChange={updateStatus}
                    onViewDocument={viewDocument}
                    onMessage={() =>
                      setEmailModal({ open: true, recipientId: a.seeker_id, name: a.profiles?.full_name || "Applicant" })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={emailModal.open} onOpenChange={(o) => setEmailModal((m) => ({ ...m, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message {emailModal.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={emailForm.subject} onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={5} value={emailForm.message} onChange={(e) => setEmailForm((f) => ({ ...f, message: e.target.value }))} />
            </div>
            <Button onClick={sendMessage} disabled={sendingEmail} className="btn-gradient w-full rounded-lg font-semibold">
              {sendingEmail ? "Sending…" : "Send Message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicantCard({
  applicant: a,
  index: i,
  isUpdating,
  onStatusChange,
  onViewDocument,
  onMessage,
}: {
  applicant: any;
  index: number;
  isUpdating: boolean;
  onStatusChange: (id: string, status: AppStatus) => void;
  onViewDocument: (url: string) => void;
  onMessage: () => void;
}) {
  const currentStatus = a.status as AppStatus;
  const allStatuses: AppStatus[] = ["shortlisted", "interview", "hired", "denied"];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
      <Card className="border border-border/60">
        <CardContent className="flex flex-col md:flex-row items-start gap-4 py-4">
          <Avatar className="h-12 w-12 border border-border shrink-0">
            <AvatarImage src={a.profiles?.avatar_url || ""} />
            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
              {(a.profiles?.full_name || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{a.profiles?.full_name || "Unknown"}</h3>
              <Badge className={statusConfig[currentStatus]?.color || "bg-muted"}>
                {statusConfig[currentStatus]?.label || currentStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{a.opportunity_title}</p>
            <p className="text-xs text-muted-foreground">
              {a.profiles?.country} · Applied {new Date(a.created_at).toLocaleDateString()}
            </p>
            {a.cover_letter && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.cover_letter}</p>
            )}

            {/* Documents */}
            {a.documents?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {a.documents.map((doc: any) => (
                  <Button key={doc.id} variant="outline" size="sm" className="text-xs" onClick={() => onViewDocument(doc.file_url)}>
                    <FileText size={14} className="mr-1" /> {doc.file_type.toUpperCase()}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto shrink-0">
            <div className="flex gap-1.5 flex-wrap justify-start md:justify-end">
              {allStatuses.map((s) => {
                const cfg = statusConfig[s];
                const isActive = currentStatus === s;
                return (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    className={`text-xs capitalize transition-all ${isActive ? cfg.activeColor : ""}`}
                    onClick={() => onStatusChange(a.id, s)}
                  >
                    {cfg.icon}
                    <span className="ml-1">{cfg.label}</span>
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={onMessage} className="text-xs">
              <Mail size={14} className="mr-1" /> Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
