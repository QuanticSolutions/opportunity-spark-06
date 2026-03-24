import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-gradient py-20 md:py-28">
          <div className="container text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-4">
              Terms of Service
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
              Terms and conditions for using the Somopportunity platform.
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
              <p className="text-sm text-muted-foreground/70">Last Updated: August 21, 2025</p>
              <p>
                These Terms of Service ("Terms") govern your use of the Somopportunity platform and services. By accessing or using our platform, you agree to be bound by these Terms.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using Somopportunity, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last Modified" date. Your continued use of the platform constitutes acceptance of any changes.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>2. Description of Service</h2>
              <p>
                Somopportunity is a digital platform that connects Somali youth with educational and professional opportunities including scholarships, internships, workshops, conferences, and job opportunities.
              </p>
              <p>Our services include but are not limited to:</p>
              <ul>
                <li>Curating and sharing verified opportunities</li>
                <li>Providing educational consulting and mentoring services</li>
                <li>Facilitating connections between opportunity seekers and providers</li>
                <li>Offering community support and networking opportunities</li>
              </ul>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>3. User Accounts and Responsibilities</h2>
              <h3>Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>
              <h3>User Responsibilities</h3>
              <ul>
                <li>Use the platform in accordance with applicable laws and regulations</li>
                <li>Respect the rights and privacy of other users</li>
                <li>Provide accurate and truthful information</li>
                <li>Not engage in fraudulent, abusive, or illegal activities</li>
                <li>Comply with our Community Guidelines</li>
              </ul>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>4. Content and Intellectual Property</h2>
              <h3>User-Generated Content</h3>
              <p>
                By submitting content to our platform, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content in connection with our services.
              </p>
              <h3>Platform Content</h3>
              <p>
                All content on the Somopportunity platform, including text, graphics, logos, and software, is the property of Somopportunity or its licensors and is protected by copyright and other intellectual property laws.
              </p>
              <h3>Prohibited Content</h3>
              <ul>
                <li>Content that violates any laws or regulations</li>
                <li>Content that infringes on intellectual property rights</li>
                <li>Content that is defamatory, harassing, or threatening</li>
                <li>Content that contains malware or malicious code</li>
                <li>Content that promotes illegal activities or discrimination</li>
              </ul>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>5. Disclaimers and Limitations</h2>
              <h3>Service Availability</h3>
              <p>
                We strive to maintain continuous service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
              </p>
              <h3>Opportunity Information</h3>
              <p>
                While we strive to provide accurate and up-to-date information about opportunities, we cannot guarantee the accuracy, completeness, or timeliness of all information. Users should verify details directly with opportunity providers.
              </p>
              <h3>Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Somopportunity shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>6. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>7. Termination</h2>
              <h3>Termination by You</h3>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion features in your profile settings.
              </p>
              <h3>Termination by Us</h3>
              <p>
                We may suspend or terminate your account if you violate these Terms, engage in fraudulent activities, or for any other reason at our sole discretion.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>8. Governing Law and Disputes</h2>
              <p>
                These Terms are governed by the laws of the jurisdiction in which Somopportunity operates. Any disputes arising from these Terms or your use of our services will be resolved through binding arbitration.
              </p>
              <p>
                Before initiating any legal proceedings, we encourage users to contact us directly to resolve any issues through our support channels.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>9. Contact Information</h2>
              <p>If you have questions about these Terms or need to contact us for any reason, please reach out through the following channels:</p>
              <ul>
                <li>Email: <a href="mailto:somopportunity@gmail.com" className="text-primary hover:underline">somopportunity@gmail.com</a></li>
                <li>WhatsApp Channel: <a href="https://whatsapp.com/channel/0029VbBXKMvDzgTFfwjIEO2n" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Join our channel</a></li>
                <li>Telegram Channel: <a href="https://t.me/somopportunity" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Follow us on Telegram</a></li>
              </ul>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2>Questions About These Terms?</h2>
              <p>If you have any questions about our Terms of Service, please don't hesitate to contact us.</p>
            </motion.div>
          </motion.div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
