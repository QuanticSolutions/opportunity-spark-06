import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import LatestOpportunities from "@/components/LatestOpportunities";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ArticlesSection from "@/components/ArticlesSection";
import CTASection from "@/components/CTASection";
import PartnersSection from "@/components/PartnersSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1">
      <HeroSection />
      <PartnersSection />
      <CategoryGrid />
      <FeaturedOpportunities />
      <LatestOpportunities />
      <ServicesSection />
      <TestimonialsSection />
      <ArticlesSection />
      <CTASection />
    </main>
    <SiteFooter />
  </div>
);

export default Index;
