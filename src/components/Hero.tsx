import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-60" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 backdrop-blur px-4 py-1.5 text-sm font-medium mb-8 shadow-soft">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">বাংলাদেশের #১ ই-কমার্স গ্রোথ পার্টনার</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-6">
            আপনার ই-কমার্স ব্যবসার <br className="hidden sm:block" />
            <span className="gradient-text">পূর্ণাঙ্গ ডিজিটাল সলিউশন</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            ওয়েবসাইট, পারফরম্যান্স মার্কেটিং, AI অটোমেশন থেকে শুরু করে প্যাকেজিং—
            আপনার অনলাইন বিজনেস স্কেল করার জন্য যা যা দরকার, সব এক প্ল্যাটফর্মে।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#contact">
                ফ্রি কনসালটেন্সি নিন
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline-glow" size="xl" asChild>
              <a href="#services">
                <PlayCircle className="mr-2 h-5 w-5" />
                সার্ভিস দেখুন
              </a>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "৫০০+", l: "সফল ক্লায়েন্ট" },
              { v: "১০+", l: "সার্ভিস পিলার" },
              { v: "২৪/৭", l: "সাপোর্ট" },
              { v: "৯৮%", l: "সন্তুষ্টি" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
