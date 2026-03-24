import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/services/profile";

const roles: { value: AppRole; label: string; description: string; icon: typeof Search }[] = [
  {
    value: "seeker",
    label: "Opportunity Seeker",
    description: "Discover scholarships, jobs, grants and more tailored to your goals.",
    icon: Search,
  },
  {
    value: "provider",
    label: "Opportunity Provider",
    description: "Post opportunities and connect with talented seekers worldwide.",
    icon: Briefcase,
  },
];

export default function SignUp() {
  const [selected, setSelected] = useState<AppRole | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selected) return;
    navigate("/signup/account", { state: { role: selected } });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-xl px-4 py-16 text-center"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Join <span className="text-gradient">Somopportunity</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Choose how you want to use the platform</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = selected === role.value;
              return (
                <motion.button
                  key={role.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(role.value)}
                  className={cn(
                    "group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all duration-300",
                    isActive
                      ? "border-primary bg-primary/5 shadow-[0_0_30px_-6px_hsl(var(--primary)/0.35)]"
                      : "border-border bg-card hover:border-primary/40 glow-border"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{role.label}</h3>
                  <p className="text-sm text-muted-foreground text-center">{role.description}</p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="btn-gradient mt-8 w-full max-w-xs rounded-lg px-8 py-3 text-base font-semibold"
          size="lg"
        >
          Continue <ArrowRight size={18} className="ml-1" />
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="font-semibold text-primary hover:underline">
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
