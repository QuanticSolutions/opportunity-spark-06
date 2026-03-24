import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Compass,
  Briefcase,
  FileCheck,
  Bookmark,
  Bell,
  User,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { label: string; icon: React.ElementType; path: string }[];
}

const navItems: NavItem[] = [
  { label: "Explore", icon: Compass, path: "/dashboard/seeker" },
  {
    label: "Jobs",
    icon: Briefcase,
    path: "/dashboard/seeker/jobs",
    children: [
      { label: "Applied Jobs", icon: FileCheck, path: "/dashboard/seeker/applied-jobs" },
      { label: "Saved Jobs", icon: Bookmark, path: "/dashboard/seeker/saved-jobs" },
    ],
  },
  { label: "Notifications", icon: Bell, path: "/dashboard/seeker/notifications" },
  { label: "Profile", icon: User, path: "/dashboard/seeker/profile" },
  { label: "Security", icon: Lock, path: "/dashboard/seeker/security" },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(
    location.pathname.includes("applied") || location.pathname.includes("saved")
  );

  const isActive = (path: string) => location.pathname === path;
  const isJobsActive = location.pathname.includes("applied") || location.pathname.includes("saved") || location.pathname === "/dashboard/seeker/jobs";

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
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    setJobsOpen(!jobsOpen);
                    if (collapsed) setCollapsed(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isJobsActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight
                        size={14}
                        className={cn("transition-transform duration-200", jobsOpen && "rotate-90")}
                      />
                    </>
                  )}
                </button>
                {jobsOpen && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => navigate(child.path)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive(child.path)
                            ? "bg-primary/10 text-primary font-medium shadow-[var(--glow-shadow)]"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <child.icon size={16} />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
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
          );
        })}
      </nav>
    </motion.aside>
  );
}
