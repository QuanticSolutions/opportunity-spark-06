import { GraduationCap, Briefcase, HandCoins, Globe, Award, Users, CalendarDays, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { icon: Briefcase, label: "Jobs", description: "Career opportunities", type: "job", gradient: "from-blue-500/10 to-blue-600/5" },
  { icon: GraduationCap, label: "Scholarships", description: "Funded education", type: "scholarship", gradient: "from-emerald-500/10 to-emerald-600/5" },
  { icon: HandCoins, label: "Grants", description: "Research funding", type: "grant", gradient: "from-amber-500/10 to-amber-600/5" },
  { icon: Award, label: "Fellowships", description: "Leadership programs", type: "fellowship", gradient: "from-purple-500/10 to-purple-600/5" },
  { icon: Globe, label: "Internships", description: "Professional growth", type: "internship", gradient: "from-rose-500/10 to-rose-600/5" },
  { icon: Lightbulb, label: "Workshops", description: "Skill development", type: "workshop", gradient: "from-cyan-500/10 to-cyan-600/5" },
];

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <section className="section-padding">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Explore by Category
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Find the right opportunity that matches your goals and aspirations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => navigate(`/opportunities?category=${cat.type}`)}
              className={`group flex flex-col items-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${cat.gradient} p-6 text-center transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-ring`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-primary shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110">
                <cat.icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
