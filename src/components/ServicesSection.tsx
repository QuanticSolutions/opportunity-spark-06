import { Users, Search, Megaphone, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const services = [
  {
    icon: Users,
    title: "Hire Talent",
    description: "Connect with qualified Somali professionals for your organization.",
    href: "/services/hire-talent",
  },
  {
    icon: ShieldCheck,
    title: "Candidate Screening",
    description: "Pre-vetted candidates matched to your requirements and standards.",
    href: "/services/hire-talent",
  },
  {
    icon: Megaphone,
    title: "Promotion",
    description: "Promote your opportunities to reach thousands of qualified applicants.",
    href: "/services/hire-talent",
  },
  {
    icon: Search,
    title: "Recruitment Support",
    description: "End-to-end recruitment support from sourcing to placement.",
    href: "/services/hire-talent",
  },
];

export default function ServicesSection() {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-accent/30">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Our Services
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Comprehensive talent solutions for organizations across the Somali diaspora.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <motion.button
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              onClick={() => navigate(service.href)}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 hover:border-primary/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <service.icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-bold text-foreground">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              <span className="text-sm font-semibold text-primary group-hover:underline">Learn more →</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
