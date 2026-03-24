import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 md:py-28">
          <div className="container text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
              Privacy Policy
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
              Learn how we collect, use, and protect your data.
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ staggerChildren: 0.06 }}
            className="container max-w-3xl prose prose-slate dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
          >
            <motion.div variants={fadeUp}>
              <h2>Disclaimer</h2>
              <p>
                Somopportunity shares youth opportunities for your convenience based on available information and does not take responsibility for unintended, incomplete, or inaccurate information. This is not the official page of any opportunity provider; we recommend visiting the official website for complete and accurate details. Opportunities are shared solely to promote "Access to Information" and should not be associated with any other purposes.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="text-sm text-muted-foreground/70">Last Updated: August 21, 2025</p>
              <p>
                This Privacy Policy explains how Somopportunity collects, uses, and discloses your information when you use our platform, as well as your privacy rights and legal protections. By using Somopportunity, you consent to the collection and use of information as described in this Privacy Policy.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>1. Interpretation and Definitions</h2>
              <h3>Interpretation</h3>
              <p>Capitalized terms have specific definitions and apply in both singular and plural forms.</p>
              <h3>Definitions</h3>
              <ul>
                <li><strong>Account:</strong> Unique account created to access the Service.</li>
                <li><strong>Affiliate:</strong> Entity controlling, controlled by, or under common control with Somopportunity.</li>
                <li><strong>Application/Service:</strong> Somopportunity platform, including website and mobile applications.</li>
                <li><strong>Company:</strong> Somopportunity ("We," "Us," or "Our").</li>
                <li><strong>Device:</strong> Any device used to access the Service (computer, smartphone, tablet).</li>
                <li><strong>Personal Data:</strong> Information that identifies or can identify an individual.</li>
                <li><strong>Service Provider:</strong> Third-party providers who help operate or analyze the Service.</li>
                <li><strong>Usage Data:</strong> Data collected automatically, e.g., pages visited, time spent, device info.</li>
                <li><strong>You:</strong> User accessing or using the Service.</li>
              </ul>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>2. Collecting and Using Your Personal Data</h2>
              <h3>Types of Data Collected</h3>
              <ul>
                <li><strong>Personal Data:</strong> Name, email, phone, educational background, and other provided details.</li>
                <li><strong>Usage Data:</strong> Automatically collected data such as IP address, browser type, device info, and pages visited.</li>
              </ul>

              <h3>Use of Personal Data</h3>
              <ul>
                <li>Provide, maintain, and improve our Service.</li>
                <li>Manage your Account.</li>
                <li>Communicate updates, news, or offers.</li>
                <li>Analyze trends and improve user experience.</li>
                <li>Comply with legal obligations.</li>
              </ul>

              <h3>Sharing Your Personal Data</h3>
              <p>We do not sell your data. Data may be shared with:</p>
              <ul>
                <li>Service Providers for operational purposes.</li>
                <li>Business partners or affiliates (subject to privacy protections).</li>
                <li>Legal authorities if required by law.</li>
              </ul>

              <h3>Retention</h3>
              <p>Data is kept only as long as necessary for service delivery, legal obligations, or internal analysis.</p>

              <h3>Transfer</h3>
              <p>Data may be processed outside your country with appropriate security measures.</p>

              <h3>Deletion</h3>
              <p>You can request deletion or update of your Personal Data via your account settings or by contacting us.</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>3. Security of Your Personal Data</h2>
              <p>We use industry-standard measures to protect your data but cannot guarantee absolute security.</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>4. Children's Privacy</h2>
              <p>Somopportunity does not knowingly collect information from anyone under 13. Parents may contact us to remove such data.</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>5. Links to Other Websites</h2>
              <p>Our Service may contain links to third-party sites. We are not responsible for their privacy practices.</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>6. Changes to Privacy Policy</h2>
              <p>Updates will be posted on this page with a revised "Last Updated" date.</p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>7. Contact Us</h2>
              <p>Email: <a href="mailto:somopportunity@gmail.com" className="text-primary hover:underline">somopportunity@gmail.com</a></p>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
