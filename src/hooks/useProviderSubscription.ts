import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProviderSubscription {
  id: string;
  status: string;
  payment_status: string;
  plan_id: string;
  receipt_url: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  renewal_date?: string | null;
  subscription_plans?: {
    id: string;
    name: string;
    display_name: string;
    posting_limit: number | null;
    tier: number;
  } | null;
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

  const isExpired = Boolean(
    subscription && (
      subscription.status === "expired" ||
      (subscription.current_period_end && new Date(subscription.current_period_end) <= new Date())
    )
  );

  const isActive = subscription?.status === "active" && !isExpired;
  const postingLimit = subscription?.subscription_plans?.posting_limit ?? null;

  return { subscription, loading, isActive, isExpired, postingLimit, refetch: fetchSub };
}
