import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Mail, Check } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles!messages_sender_id_fkey(full_name)")
      .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from("messages").update({ read: true }).eq("id", id);
    fetchMessages();
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground">Messages</h1>
      {messages.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">No messages yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <Card key={m.id} className={`glow-border ${!m.read && m.recipient_id === user!.id ? "border-primary/30" : ""}`}>
              <CardContent className="flex items-start gap-4 py-4">
                <Mail size={20} className="mt-1 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{m.subject}</h3>
                    {!m.read && m.recipient_id === user!.id && <Badge className="bg-primary/10 text-primary text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From: {(m.profiles as any)?.full_name || "Unknown"} · {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!m.read && m.recipient_id === user!.id && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(m.id)}>
                    <Check size={14} className="mr-1" /> Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
