import { useState } from "react";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Placeholder – later connect to edge function or table
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 md:py-28">
          <div className="container text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
              Contact Us
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
              Have a question or want to collaborate? We'd love to hear from you.
            </motion.p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <form onSubmit={handleSubmit} className="glass-card rounded-lg p-8 space-y-5 shadow-[var(--card-shadow)]">
                <h2 className="text-xl font-bold text-foreground mb-2">Send a Message</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Subject" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Write your message..." rows={5} required />
                </div>
                <Button type="submit" className="btn-gradient w-full rounded-lg font-semibold" disabled={sending}>
                  {sending ? "Sending…" : <><Send size={16} className="mr-2" /> Send Message</>}
                </Button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col justify-center space-y-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Get in Touch</h2>
                <p className="text-muted-foreground leading-relaxed">Whether you have a partnership inquiry, feedback, or just want to say hello — reach out and we'll respond as soon as possible.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a href="mailto:somopportunity@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">somopportunity@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">Remote – Serving users worldwide</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
