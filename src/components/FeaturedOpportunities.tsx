import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function FeaturedOpportunities() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("opportunities")
        .select("*")
        .in("status", ["approved"])
        .order("views_count", { ascending: false })
        .limit(3);
      setFeatured(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <section className="section-padding bg-accent/30">
      <div className="container">
        <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Featured Opportunities
            </h2>
            <p className="mt-2 text-muted-foreground">
              Top opportunities with the highest engagement
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 sm:mt-0 gap-2 border-border text-foreground hover:bg-card font-semibold rounded-xl"
            onClick={() => navigate("/opportunities")}
          >
            View All <ArrowRight size={16} />
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No featured opportunities yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                onClick={() => navigate(`/opportunities/${opp.id}`)}
                className="group flex flex-col rounded-2xl border border-border bg-card shadow-[var(--card-shadow)] transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                <div className="h-1 btn-gradient w-full" />
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-accent text-accent-foreground border-0 text-xs font-semibold capitalize rounded-lg">
                      {opp.category}
                    </Badge>
                    {opp.work_mode && (
                      <Badge variant="outline" className="text-xs capitalize rounded-lg">
                        {opp.work_mode}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {opp.title}
                  </h3>

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3">
                    {opp.company && (
                      <span className="flex items-center gap-1.5"><Building2 size={12} /> {opp.company}</span>
                    )}
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {opp.location || "Remote"}</span>
                    {opp.deadline && (
                      <span className="flex items-center gap-1.5"><CalendarDays size={12} /> {new Date(opp.deadline).toLocaleDateString()}</span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                    {opp.description}
                  </p>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-4 w-full text-primary font-semibold gap-1 hover:bg-accent rounded-xl justify-center"
                    onClick={(e) => { e.stopPropagation(); navigate(`/opportunities/${opp.id}`); }}
                  >
                    View Details <ArrowRight size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
