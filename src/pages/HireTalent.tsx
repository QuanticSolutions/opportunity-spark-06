import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, ClipboardCheck, ListChecks, FileText, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: Search, title: "Advertising & Sourcing", description: "We advertise your roles across our network and source qualified Somali candidates from local and diaspora talent pools." },
  { icon: ClipboardCheck, title: "Pre-Vetting & Screening", description: "Our team screens every applicant, verifying qualifications, experience, and eligibility before shortlisting." },
  { icon: ListChecks, title: "Shortlisting Top Candidates", description: "We present you with a curated list of the most qualified candidates, saving you hours of manual review." },
  { icon: FileText, title: "Testing & Assessments", description: "We conduct skills tests and assessments tailored to your requirements, ensuring candidates meet your standards." },
  { icon: Users, title: "Detailed Reporting", description: "Receive comprehensive reports on each candidate, including assessment scores, background checks, and recommendations." },
  { icon: Zap, title: "Swift 5-Day Delivery", description: "From job posting to shortlisted candidates — our streamlined process delivers results within 5 business days." },
];

const orgTypes = ["Company", "NGO", "Government", "Other"];
const demoMethods = ["Zoom", "Google Meet", "Phone Call"];

export default function HireTalent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization_name: "",
    organization_type: "Company",
    full_name: "",
    email: "",
    phone: "",
    position_to_hire: "",
    preferred_demo_method: "Zoom",
    message: "",
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("demo_requests").insert({
      organization_name: form.organization_name,
      organization_type: form.organization_type.toLowerCase(),
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      position_to_hire: form.position_to_hire || null,
      preferred_demo_method: form.preferred_demo_method.toLowerCase().replace(" ", "_"),
      message: form.message || null,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28 text-center">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl"
          >
            Hire the Best Somali Talent
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/80"
          >
            Somopportunity helps organizations recruit qualified Somali professionals locally and globally.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Button
              size="lg"
              className="mt-8 btn-gradient font-bold px-8 rounded-xl text-base"
              onClick={() => document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Request a Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              How <span className="text-gradient">We Help You Hire</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Our end-to-end recruitment service takes the hassle out of finding and hiring top Somali talent.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glow-border h-full transition-all duration-300 hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                      <f.icon size={24} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section id="demo-form" className="py-20 md:py-28 bg-muted/30">
        <div className="container max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Request a <span className="text-gradient">Demo</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              See how Somopportunity helps organizations hire the best Somali talent locally and globally.
            </p>
          </div>

          {submitted ? (
            <Card className="glass-card text-center">
              <CardContent className="py-16">
                <CheckCircle size={48} className="mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Demo Request Submitted</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thank you for requesting a demo. Our team will contact you within 24 hours to schedule your demo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Organization Name *</Label>
                      <Input value={form.organization_name} onChange={e => set("organization_name", e.target.value)} required placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization Type</Label>
                      <Select value={form.organization_type} onValueChange={v => set("organization_type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {orgTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input value={form.full_name} onChange={e => set("full_name", e.target.value)} required placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Work Email *</Label>
                      <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="jane@acme.com" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Phone / WhatsApp</Label>
                      <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+252 61 xxx xxxx" />
                    </div>
                    <div className="space-y-2">
                      <Label>Position You Want to Hire</Label>
                      <Input value={form.position_to_hire} onChange={e => set("position_to_hire", e.target.value)} placeholder="Software Engineer" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Demo Method</Label>
                    <Select value={form.preferred_demo_method} onValueChange={v => set("preferred_demo_method", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {demoMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Message</Label>
                    <Textarea value={form.message} onChange={e => set("message", e.target.value)} placeholder="Tell us more about your hiring needs..." rows={4} />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full btn-gradient font-bold rounded-xl text-base py-3">
                    {loading ? "Submitting..." : "Request Demo"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
