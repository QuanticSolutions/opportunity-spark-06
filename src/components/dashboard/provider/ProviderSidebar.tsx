import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  UsersRound,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/provider" },
  { label: "Opportunities", icon: Briefcase, path: "/dashboard/provider/opportunities" },
  { label: "Applicants", icon: Users, path: "/dashboard/provider/applicants" },
  { label: "Messages", icon: MessageSquare, path: "/dashboard/provider/messages" },
  { label: "Documents", icon: FileText, path: "/dashboard/provider/documents" },
  { label: "Subscription", icon: CreditCard, path: "/dashboard/provider/subscription" },
  { label: "Team Members", icon: UsersRound, path: "/dashboard/provider/team" },
  { label: "Settings", icon: Settings, path: "/dashboard/provider/settings" },
];

export default function ProviderSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <a href="/" className="text-lg font-extrabold text-primary">
            Som<span className="text-gradient">opportunity</span>
          </a>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive(item.path)
                ? "bg-primary/10 text-primary shadow-[var(--glow-shadow)]"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}
