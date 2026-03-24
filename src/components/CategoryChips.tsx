import {
  Briefcase,
  GraduationCap,
  HandCoins,
  Award,
  Building2,
  Wrench,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { label: "Jobs", value: "job", icon: Briefcase },
  { label: "Scholarships", value: "scholarship", icon: GraduationCap },
  { label: "Grants", value: "grant", icon: HandCoins },
  { label: "Fellowships", value: "fellowship", icon: Award },
  { label: "Internships", value: "internship", icon: Building2 },
  { label: "Workshops", value: "workshop", icon: Wrench },
  { label: "Conferences", value: "conference", icon: CalendarDays },
];

export default function CategoryChips() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
      {categories.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
            onClick={() => navigate(`/opportunities?category=${cat.value}`)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[var(--glow-shadow)] hover:-translate-y-0.5"
          >
            <Icon size={15} />
            {cat.label}
          </motion.button>
        );
      })}
    </div>
  );
}
