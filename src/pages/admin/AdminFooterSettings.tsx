import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Layout } from "lucide-react";
import { useFooterSettings, FooterSettings } from "@/hooks/useFooterSettings";

export default function AdminFooterSettings() {
  const { user } = useAuth();
  const { settings, loading, refetch } = useFooterSettings();
  const [draft, setDraft] = useState<FooterSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const current = draft || settings;

  const handleField = (key: keyof FooterSettings, value: string) => {
    setDraft({ ...(draft || settings), [key]: value });
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_pages")
      .update({
        content: JSON.stringify(draft),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("slug", "footer_settings");

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Footer updated successfully" });
      setDraft(null);
      refetch();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Layout className="text-primary" size={22} />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Footer Settings</h1>
          <p className="text-sm text-muted-foreground">Edit website footer content. Changes appear instantly.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={current.email} onChange={(e) => handleField("email", e.target.value)} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={current.location} onChange={(e) => handleField("location", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Copyright</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Label>Copyright Text <span className="text-xs text-muted-foreground">(use {`{year}`} for current year)</span></Label>
          <Input value={current.copyright} onChange={(e) => handleField("copyright", e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Policy Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Privacy Policy URL</Label>
            <Input value={current.privacy_url} onChange={(e) => handleField("privacy_url", e.target.value)} />
          </div>
          <div>
            <Label>Terms of Service URL</Label>
            <Input value={current.terms_url} onChange={(e) => handleField("terms_url", e.target.value)} />
          </div>
          <div>
            <Label>Cookie Policy URL</Label>
            <Input value={current.cookie_url} onChange={(e) => handleField("cookie_url", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!draft || saving} className="gap-2">
          <Save size={16} /> {saving ? "Saving…" : "Save Footer"}
        </Button>
      </div>
    </div>
  );
}
