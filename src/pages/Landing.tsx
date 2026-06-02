import { NavHeader } from "@/components/ui/nav-header";
import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import ConnectionsSection from "@/components/ConnectionsSection";
import AgentsCarousel from "@/components/AgentsCarousel";
import WorkflowExample from "@/components/WorkflowExample";
import SystemBento from "@/components/SystemBento";
import StatsSection from "@/components/StatsSection";
import TestimonialQuote from "@/components/TestimonialQuote";
import Footer from "@/components/Footer";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export default function Landing() {
  useRevealOnScroll();

  return (
    <main className="relative min-h-[100svh] bg-ink text-cream">
      <NavHeader />
      <Hero />
      <LogoMarquee />
      <ConnectionsSection />
      <AgentsCarousel />
      <WorkflowExample />
      <SystemBento />
      <StatsSection />
      <TestimonialQuote />
      <Footer />
    </main>
  );
}
