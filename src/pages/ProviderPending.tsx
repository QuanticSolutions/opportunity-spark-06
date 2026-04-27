import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderPending() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    const { data } = await supabase
      .from("provider_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("provider_id", user!.id)
      .single();

    if (!data) {
      navigate("/provider/subscribe", { replace: true });
      return;
    }

    if (data.status === "active") {
      navigate("/dashboard/provider", { replace: true });
      return;
    }

    if (data.payment_status === "awaiting_payment" && data.status === "pending") {
      navigate("/provider/payment", { replace: true });
      return;
    }

    setSub(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-64 w-full max-w-md rounded-xl" />
      </div>
    );
  }

  const statusLabel =
    sub?.status === "cancelled" ? "Cancelled" :
    sub?.status === "expired" ? "Expired" :
    "Pending Approval";

  const statusColor =
    sub?.status === "cancelled" || sub?.status === "expired" ? "bg-destructive/10 text-destructive" :
    "bg-amber-100 text-amber-700";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="glow-border text-center">
          <CardContent className="py-12 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={32} className="text-amber-600" />
            </div>

            <Badge className={`${statusColor} text-sm px-3 py-1`}>
              {statusLabel}
            </Badge>

            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {sub?.status === "cancelled"
                  ? "Subscription Cancelled"
                  : sub?.status === "expired"
                  ? "Subscription Expired"
                  : "Subscription Under Review"}
              </h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {sub?.status === "cancelled"
                  ? "Your subscription has been cancelled. Please contact support for more information."
                  : sub?.status === "expired"
                  ? "Your subscription has expired. Please renew to continue posting."
                  : "Your payment receipt has been submitted and is being verified by the admin team. You'll be notified once your subscription is approved."}
              </p>
              {sub?.admin_notes && (
                <p className="mt-3 text-sm bg-accent/50 rounded-lg p-3 text-foreground">
                  <span className="font-semibold">Admin note:</span> {sub.admin_notes}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Plan: <span className="font-semibold text-foreground">{(sub?.subscription_plans as any)?.display_name}</span>
              </p>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => navigate("/")}
              >
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
