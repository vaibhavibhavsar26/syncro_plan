import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { DemoSection } from "@/components/landing/demo-section";
import { AboutSection } from "@/components/landing/about-section";
import { ContactSection } from "@/components/landing/contact-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <DemoSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
