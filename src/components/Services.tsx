import {
  Headphones, Globe, LayoutTemplate, TrendingUp, Search,
  Share2, LayoutDashboard, Package, Printer, Bot, Server,
} from "lucide-react";

const services = [
  { icon: Headphones, title: "ফ্রি কনসালটেন্সি", desc: "অনলাইন বিজনেস শুরু বা স্কেলিং নিয়ে এক্সপার্ট গাইডলাইন।", tag: "Free" },
  { icon: Globe, title: "ই-কমার্স ওয়েবসাইট", desc: "WooCommerce ও Shopify এক্সপার্ট ডেভেলপমেন্ট।", tag: "Popular" },
  { icon: LayoutTemplate, title: "হাই-কনভার্টিং ল্যান্ডিং পেজ", desc: "সেলস বাড়ানোর জন্য অপ্টিমাইজড ল্যান্ডিং পেজ।" },
  { icon: TrendingUp, title: "পারফরম্যান্স মার্কেটিং", desc: "Meta, TikTok, Google Ads, Pixel ও সার্ভার-সাইড ট্র্যাকিং।", tag: "Hot" },
  { icon: Search, title: "SEO ও স্পিড অপ্টিমাইজেশন", desc: "র‍্যাংকিং বাড়ান, পেজ লোড টাইম কমান।" },
  { icon: Share2, title: "সোশ্যাল মিডিয়া ম্যানেজমেন্ট", desc: "ব্র্যান্ড গ্রোথের জন্য কন্টেন্ট ও কমিউনিটি ম্যানেজমেন্ট।" },
  { icon: LayoutDashboard, title: "অর্ডার ম্যানেজমেন্ট প্যানেল", desc: "SaaS-গ্রেড অর্ডার, কুরিয়ার ও ইনভেন্টরি ম্যানেজমেন্ট।", tag: "SaaS" },
  { icon: Package, title: "ডিজিটাল প্রোডাক্টস", desc: "Scripts, ব্যাকআপ ফাইল ও ল্যান্ডিং টেমপ্লেট।" },
  { icon: Printer, title: "ফিজিক্যাল শপ", desc: "থার্মাল প্রিন্টার, স্টিকার, কুরিয়ার পলি, টেপ।", tag: "Shop" },
  { icon: Bot, title: "AI অটোমেশন", desc: "Messenger, Telegram ও Email চ্যাটবট সলিউশন।", tag: "AI" },
  { icon: Server, title: "ডোমেইন ও হোস্টিং", desc: "লো-কস্ট ডোমেইন এবং ফাস্ট হোস্টিং প্যানেল।" },
];

export function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">আমাদের সার্ভিস</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            ১০+ <span className="gradient-text">পিলার সার্ভিস</span> এক ছাদের নিচে
          </h2>
          <p className="text-muted-foreground text-lg">
            শুরু থেকে স্কেল পর্যন্ত — আপনার ই-কমার্স যাত্রার প্রতিটি ধাপে আমরা আছি।
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group relative p-6 rounded-2xl bg-gradient-card border border-border/60 hover:border-primary/50 transition-smooth hover:-translate-y-1 hover:shadow-elegant overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-2xl transition-smooth" />

                {s.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-accent text-accent-foreground uppercase tracking-wider">
                    {s.tag}
                  </span>
                )}

                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4 group-hover:scale-110 transition-smooth">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-smooth">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
