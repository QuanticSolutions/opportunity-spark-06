import { Users, Target } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

export default function CountersSection() {
  const users = useCountUp(12500, 2000);
  const opportunities = useCountUp(14910, 2200);

  return (
    <section id="counters" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      <div className="absolute inset-0 bg-muted/40" />

      <div className="container relative z-10">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
          <div ref={users.ref} className="glass-card glow-border flex flex-col items-center gap-4 rounded-2xl p-10 shadow-[var(--card-shadow)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl btn-gradient">
              <Users size={32} />
            </div>
            <span className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {users.count.toLocaleString()}+
            </span>
            <span className="text-sm font-medium text-muted-foreground">Active Users</span>
          </div>

          <div ref={opportunities.ref} className="glass-card glow-border flex flex-col items-center gap-4 rounded-2xl p-10 shadow-[var(--card-shadow)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl btn-gradient">
              <Target size={32} />
            </div>
            <span className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {opportunities.count.toLocaleString()}+
            </span>
            <span className="text-sm font-medium text-muted-foreground">Total Opportunities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
