import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Inbox, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function SeekerMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMessages();

    const channel = supabase
      .channel("seeker-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => fetchMessages()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles!messages_sender_id_fkey(full_name, organization_name)")
      .eq("recipient_id", user!.id)
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from("messages").update({ read: true }).eq("id", id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const markAllRead = async () => {
    const unreadIds = messages.filter((m) => !m.read).map((m) => m.id);
    if (unreadIds.length === 0) return;
    await supabase.from("messages").update({ read: true }).in("id", unreadIds);
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  const unreadCount = messages.filter((m) => !m.read).length;

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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
          <Inbox size={22} className="text-primary" /> Inbox
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs ml-1">{unreadCount} new</Badge>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs">
            <Check size={14} className="mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No messages yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Messages from providers will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const senderName = m.profiles?.organization_name || m.profiles?.full_name || "Unknown";
            return (
              <Card
                key={m.id}
                className={`transition-all ${!m.read ? "border-primary/30 bg-primary/[0.02]" : "border-border/50"}`}
              >
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={`mt-1 p-2 rounded-full shrink-0 ${!m.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{m.subject}</h3>
                      {!m.read && <Badge className="bg-primary/10 text-primary text-[10px] px-1.5">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.body}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">From: {senderName}</span>
                      <span>·</span>
                      <span>{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>·</span>
                      <span>{new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                  {!m.read && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(m.id)} className="shrink-0 text-xs">
                      <Check size={14} className="mr-1" /> Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
