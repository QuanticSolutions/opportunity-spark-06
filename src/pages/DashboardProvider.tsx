import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Plus, BarChart3, Users } from "lucide-react";

export default function DashboardProvider() {
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="text-xl font-extrabold tracking-tight text-primary">
            Som<span className="text-gradient">opportunity</span>
          </a>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut size={16} className="mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Welcome, <span className="text-gradient">{profile?.full_name || "Provider"}</span> 👋
            </h1>
            <p className="mt-2 text-muted-foreground">Manage and post opportunities for seekers.</p>
          </div>
          <Button className="btn-gradient rounded-lg font-semibold">
            <Plus size={18} className="mr-1" /> Post Opportunity
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="glow-border">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 size={18} className="text-primary" /> Analytics</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">View how your opportunities are performing.</p></CardContent>
          </Card>
          <Card className="glow-border">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users size={18} className="text-primary" /> Applicants</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Review applications from seekers.</p></CardContent>
          </Card>
          <Card className="glow-border">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus size={18} className="text-primary" /> My Listings</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Manage your active opportunity listings.</p></CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
