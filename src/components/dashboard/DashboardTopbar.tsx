import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardTopbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-lg px-6">
      <div />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-primary"
          onClick={() => profile.role == "provider" ? navigate(`/dashboard/provider/notifications`) : navigate(`/dashboard/seeker/notifications`)}
        >
          <Bell size={18} />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all" onClick={() => profile.role == "provider" ? navigate(`/dashboard/provider/settings`) : navigate(`/dashboard/seekr/profile`)}>
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-destructive">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
