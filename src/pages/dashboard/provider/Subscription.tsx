import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function Subscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [{ data: subData }, { data: planData }] = await Promise.all([
      supabase.from("provider_subscriptions").select("*, subscription_plans(*)").eq("provider_id", user!.id).single(),
      supabase.from("subscription_plans").select("*").order("tier"),
    ]);
    setSub(subData);
    setPlans(planData || []);
    setLoading(false);
  };

  const selectPlan = async (planId: string) => {
    try {
      if (sub) {
        await supabase.from("provider_subscriptions").update({
          plan_id: planId,
          status: "pending_payment",
          payment_status: "awaiting_payment",
        }).eq("id", sub.id);
      } else {
        await supabase.from("provider_subscriptions").insert({
          provider_id: user!.id,
          plan_id: planId,
          status: "pending_payment",
          payment_status: "awaiting_payment",
        });
      }
      toast({ title: "Plan selected", description: "Your subscription is under administrative review." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending_approval: "bg-amber-100 text-amber-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-destructive/10 text-destructive",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}</div></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-foreground">Subscription</h1>

      {sub && (
        <Card className="glow-border">
          <CardContent className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <CreditCard size={24} className="text-primary" />
              <div>
                <p className="font-semibold text-foreground">{(sub.subscription_plans as any)?.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  Posting limit: {(sub.subscription_plans as any)?.posting_limit ?? "Unlimited"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusBadge(sub.status)}>{sub.status.replace("_", " ")}</Badge>
              {sub.renewal_date && (
                <p className="text-xs text-muted-foreground">Renews {new Date(sub.renewal_date).toLocaleDateString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const isCurrentPlan = sub && sub.plan_id === plan.id;
          const features = (plan.features || []) as string[];
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`relative h-full flex flex-col ${isCurrentPlan ? "ring-2 ring-primary" : "glow-border"}`}>
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">${plan.price_monthly}</span>
                    <span className="text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="flex-1 space-y-2 mb-6">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={isCurrentPlan ? "" : "btn-gradient w-full rounded-lg font-semibold"}
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => selectPlan(plan.id)}
                  >
                    {isCurrentPlan ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Promotional Add-ons</CardTitle>
          <CardDescription>Boost your opportunity visibility</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Social Media Promotion", price: 20, desc: "Feature on our social channels" },
            { name: "Newsletter Feature", price: 40, desc: "Highlighted in our weekly newsletter" },
            { name: "Priority Placement", price: 35, desc: "Top placement in search results" },
          ].map(addon => (
            <Card key={addon.name} className="glow-border">
              <CardContent className="py-4 text-center">
                <p className="font-semibold text-foreground">{addon.name}</p>
                <p className="text-2xl font-bold text-primary mt-1">+${addon.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{addon.desc}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
