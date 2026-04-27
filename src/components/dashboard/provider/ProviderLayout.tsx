import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
    if (subscription.payment_status === "awaiting_payment" && subscription.status === "pending") {
      navigate("/provider/payment", { replace: true });
      return;
    }

    // Pending approval → go to pending page
    if (subscription.status === "pending") {
      navigate("/provider/pending", { replace: true });
      return;
    }

    // Cancelled → go to pending page (shows cancellation message)
    if (subscription.status === "cancelled") {
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

  // Status color for the banner
  const getBannerStyle = () => {
    if (!subscription) return "";
    const s = subscription.status;
    if (s === "pending") {
      return "border-amber-300 bg-amber-50 text-amber-700";
    }
    // expired, cancelled, or any non-active status
    return "border-destructive/30 bg-destructive/10 text-destructive";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        {!isActive && subscription && (
          <div className={`mx-6 mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${getBannerStyle()}`}>
            <AlertCircle size={16} />
            <span>
              {subscription.status === "pending"
                ? subscription.payment_status === "awaiting_payment"
                  ? "Payment pending. Please complete payment to activate your subscription."
                  : "Your subscription is under review. Some features may be restricted."
                : subscription.status === "expired"
                ? "Your subscription has expired. Please renew to continue posting."
                : "Your subscription is inactive. Please contact support or update your plan."}
            </span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
