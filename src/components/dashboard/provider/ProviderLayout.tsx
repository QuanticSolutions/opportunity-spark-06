import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import ProviderSidebar from "./ProviderSidebar";
import DashboardTopbar from "../DashboardTopbar";
import { useProviderSubscription } from "@/hooks/useProviderSubscription";
import { useAuth } from "@/contexts/AuthContext";

export default function ProviderLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { subscription, loading, isActive } = useProviderSubscription();

  useEffect(() => {
    if (loading) return;

    // No subscription at all → go to plan selection
    if (!subscription) {
      navigate("/provider/subscribe", { replace: true });
      return;
    }

    // Awaiting payment → go to payment page
    if (subscription.status === "pending_payment" && subscription.payment_status === "awaiting_payment") {
      navigate("/provider/payment", { replace: true });
      return;
    }

    // Under review or pending → go to pending page
    if (subscription.status === "under_review" || subscription.status === "pending_approval") {
      navigate("/provider/pending", { replace: true });
      return;
    }

    // Rejected → go to pending page (shows rejection message)
    if (subscription.status === "rejected") {
      navigate("/provider/pending", { replace: true });
      return;
    }
  }, [subscription, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        {!isActive && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} />
            <span>Your subscription is not active yet. Some features may be restricted.</span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
