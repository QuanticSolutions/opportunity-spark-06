import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface AdminNotification {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  provider_id: string;
  created_at: string;
}

export function useAdminNotifications() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin";

  const fetchNotifications = async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const items = (data || []) as AdminNotification[];
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.is_read).length);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload) => {
          const newNotif = payload.new as AdminNotification;
          console.log("[Admin Realtime] New notification:", newNotif.message);
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
          toast({
            title: "New Notification",
            description: newNotif.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  return { notifications, unreadCount, loading, markAsRead, markAllRead, refetch: fetchNotifications };
}
