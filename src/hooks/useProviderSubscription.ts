import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProviderSubscription {
  id: string;
  status: string;
  payment_status: string;
  plan_id: string;
  receipt_url: string | null;
  subscription_plans?: any;
}

export function useProviderSubscription() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<ProviderSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== "provider") {
      setLoading(false);
      return;
    }
    fetchSub();
  }, [user, profile]);

  const fetchSub = async () => {
    const { data } = await supabase
      .from("provider_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("provider_id", user!.id)
      .single();

    setSubscription(data as any);
    setLoading(false);
  };

  const isActive = subscription?.status === "active";

  return { subscription, loading, isActive, refetch: fetchSub };
}
