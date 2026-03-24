import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Clock, ArrowRight } from "lucide-react";

const articles = [
  { id: "1", title: "10 Tips to Win a Fully Funded Scholarship", excerpt: "Master the art of scholarship applications with these proven strategies used by successful candidates worldwide.", category: "Scholarships", date: "Mar 1, 2026", image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80" },
  { id: "2", title: "How to Write a Winning CV for International Jobs", excerpt: "Your CV is the first impression. Learn how to structure it for maximum impact in global job markets.", category: "Career", date: "Feb 25, 2026", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80" },
  { id: "3", title: "Top 20 Grants for Students in 2026", excerpt: "A curated list of grants available for undergraduate and postgraduate students across various disciplines.", category: "Grants", date: "Feb 20, 2026", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" },
  { id: "4", title: "Internship vs Fellowship: Which One Is Right for You?", excerpt: "Understand the key differences and choose the path that aligns with your career goals.", category: "Guides", date: "Feb 15, 2026", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80" },
  { id: "5", title: "How to Prepare for a Remote Job Interview", excerpt: "Remote interviews are the new normal. Here's how to ace them with confidence and professionalism.", category: "Career", date: "Feb 10, 2026", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80" },
  { id: "6", title: "A Beginner's Guide to Applying for Fellowships", excerpt: "Step-by-step breakdown of the fellowship application process from research to submission.", category: "Fellowships", date: "Feb 5, 2026", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80" },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

export default function Articles() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 md:py-28">
          <div className="container text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
              Articles & Guides
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
              Resources to help you succeed in scholarships, jobs, and global opportunities.
            </motion.p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((a, i) => (
                <motion.article key={a.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="group rounded-lg border border-border bg-card overflow-hidden shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-5 space-y-3">
                    <span className="inline-block text-xs font-semibold bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full">{a.category}</span>
                    <h3 className="font-bold text-foreground leading-snug line-clamp-2">{a.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} />{a.date}</span>
                      <button className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all">
                        Read More <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
