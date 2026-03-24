import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Somopportunity helped me find a fully funded scholarship in Europe. The platform is incredibly easy to use and the opportunities are always relevant.",
    name: "Amina Hassan",
    title: "Scholarship Recipient, 2025",
  },
  {
    quote: "As an employer, posting on Somopportunity gave us access to exceptional Somali talent. The quality of applicants exceeded our expectations.",
    name: "Mohamed Ali",
    title: "HR Director, Tech Solutions Inc",
  },
  {
    quote: "I discovered a fellowship through Somopportunity that completely changed my career trajectory. I can't recommend this platform enough.",
    name: "Fatima Omar",
    title: "Fellow, Global Leadership Program",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Real stories from people who found their next opportunity with us.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--card-shadow)]"
            >
              <Quote size={24} className="text-primary/30 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
