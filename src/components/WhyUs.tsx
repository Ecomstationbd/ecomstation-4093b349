import { ShieldCheck, Zap, Users, MapPin, Clock, Award } from "lucide-react";

const items = [
  { icon: MapPin, title: "বাংলাদেশি মার্কেট এক্সপার্ট", desc: "লোকাল কুরিয়ার, পেমেন্ট গেটওয়ে ও অডিয়েন্স বিহেভিয়ার সম্পর্কে গভীর জ্ঞান।" },
  { icon: Zap, title: "ফাস্ট ডেলিভারি", desc: "আপনার প্রজেক্ট সময়মতো ডেলিভারি — কোনো অজুহাত নেই।" },
  { icon: ShieldCheck, title: "১০০% ট্রান্সপারেন্সি", desc: "প্রাইসিং থেকে শুরু করে রিপোর্টিং — সব কিছু পরিষ্কার।" },
  { icon: Users, title: "ডেডিকেটেড সাপোর্ট", desc: "প্রতিটি ক্লায়েন্টের জন্য পার্সোনাল অ্যাকাউন্ট ম্যানেজার।" },
  { icon: Clock, title: "২৪/৭ মনিটরিং", desc: "আপনার অ্যাড ক্যাম্পেইন ও ওয়েবসাইট সার্বক্ষণিক নজরদারি।" },
  { icon: Award, title: "প্রমাণিত রেজাল্ট", desc: "৫০০+ সফল প্রজেক্ট — ROI-ই আমাদের পরিচয়।" },
];

export function WhyUs() {
  return (
    <section id="why" className="py-24 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">কেন Ecomstation</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              বাংলাদেশের <span className="gradient-text">উদ্যোক্তাদের</span> জন্য তৈরি
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              আমরা শুধু সার্ভিস প্রোভাইডার না — আপনার গ্রোথ পার্টনার। ছোট স্টার্টআপ থেকে
              এন্টারপ্রাইজ লেভেল পর্যন্ত, প্রতিটি ই-কমার্স ব্যবসার জন্য কাস্টমাইজড সলিউশন।
            </p>
            <div className="flex flex-wrap gap-3">
              {["Shopify Partner", "Meta Certified", "Google Ads", "WooCommerce Expert"].map((b) => (
                <span key={b} className="px-4 py-2 rounded-full border border-border bg-secondary/50 text-sm font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <div
                  key={it.title}
                  className="p-6 rounded-2xl bg-gradient-card border border-border/60 hover:border-primary/40 hover:shadow-soft transition-smooth"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{it.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
