import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Partners } from "@/components/Partners";
import { Services } from "@/components/Services";
import { Shop } from "@/components/Shop";
import { WhyUs } from "@/components/WhyUs";
import { Testimonials } from "@/components/Testimonials";
import { LatestBlogs } from "@/components/LatestBlogs";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { useReveal } from "@/hooks/useReveal";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Reveal><Partners /></Reveal>
        <Reveal><Services /></Reveal>
        <Reveal><Shop /></Reveal>
        <Reveal><WhyUs /></Reveal>
        <Reveal><Testimonials /></Reveal>
        <Reveal><LatestBlogs /></Reveal>
        <Reveal><CTA /></Reveal>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
