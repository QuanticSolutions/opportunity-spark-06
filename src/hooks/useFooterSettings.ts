import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FooterSettings {
  email: string;
  location: string;
  copyright: string;
  privacy_url: string;
  terms_url: string;
  cookie_url: string;
}

const DEFAULTS: FooterSettings = {
  email: "somopportunity@gmail.com",
  location: "Hargeisa, Somaliland",
  copyright: "© {year} SomOpportunity. All rights reserved.",
  privacy_url: "/privacy",
  terms_url: "/terms",
  cookie_url: "/privacy",
};

function parseSettings(raw: string | null): FooterSettings {
  if (!raw) return DEFAULTS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("site_pages")
      .select("content")
      .eq("slug", "footer_settings")
      .maybeSingle();
    setSettings(parseSettings(data?.content || null));
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("footer-settings-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_pages", filter: "slug=eq.footer_settings" },
        (payload) => setSettings(parseSettings((payload.new as any).content || null))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading, refetch: load };
}
