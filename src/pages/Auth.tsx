import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/services/profile";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      const user = data.session?.user;

      if (!user) {
        navigate("/");
        return;
      }

      const profile = await getProfile(user.id);

      if (profile?.role === "provider") {
        navigate("/provider/subscribe", { replace: true });
      } else if (profile?.role === "seeker") {
        navigate("/dashboard/seeker", { replace: true });
      } else {
        navigate("/onboarding", { replace: true }); // 👈 important fallback
      }
    };

    handleAuth();
  }, []);

  return <p>Signing you in...</p>;
}