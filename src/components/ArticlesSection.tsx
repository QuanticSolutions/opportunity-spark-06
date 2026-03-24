import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const articles = [
  {
    id: "a1",
    title: "How to Write a Winning Scholarship Application",
    excerpt: "Learn the key strategies for crafting compelling scholarship applications that stand out.",
    category: "Scholarship Guide",
    date: "2026-02-15",
  },
  {
    id: "a2",
    title: "Top 10 Fellowships for African Youth in 2026",
    excerpt: "Explore the most prestigious fellowship opportunities available for young professionals.",
    category: "Career Advice",
    date: "2026-02-10",
  },
  {
    id: "a3",
    title: "Preparing for International Job Interviews",
    excerpt: "A comprehensive guide to acing remote and in-person interviews with global organizations.",
    category: "Application Tips",
    date: "2026-01-28",
  },
];

export default function ArticlesSection() {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-accent/30">
      <div className="container">
        <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Articles & Guides
            </h2>
            <p className="mt-2 text-muted-foreground">Tips and resources to help you succeed</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 sm:mt-0 gap-2 border-border text-foreground hover:bg-card font-semibold rounded-xl"
            onClick={() => navigate("/articles")}
          >
            All Articles <ArrowRight size={16} />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--card-shadow)] transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1"
            >
              <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <BookOpen size={36} className="text-primary/30" />
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary">{article.category}</span>
                  <span className="text-xs text-muted-foreground">• {new Date(article.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 text-primary font-semibold gap-1 hover:bg-accent rounded-xl w-fit"
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  Read More <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
