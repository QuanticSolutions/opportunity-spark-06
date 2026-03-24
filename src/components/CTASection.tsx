import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-secondary/15 blur-[100px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-primary-foreground md:text-4xl lg:text-5xl">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/70">
            Join thousands of students and professionals discovering life-changing opportunities every day.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 font-bold text-base px-8 gap-2 rounded-xl h-12 shadow-lg"
              onClick={() => navigate("/signup")}
            >
              Join Now <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-card text-foreground hover:bg-card/90 font-bold text-base px-8 gap-2 rounded-xl h-12 shadow-lg"
              onClick={() => navigate("/opportunities")}
            >
              Browse Opportunities
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
