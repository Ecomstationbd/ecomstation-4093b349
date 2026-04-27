import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "রায়হান আহমেদ",
    role: "ফাউন্ডার, StyleHub BD",
    text: "Ecomstation-এর মাধ্যমে আমাদের সেলস ৩x বেড়েছে মাত্র ২ মাসে। ওদের পারফরম্যান্স মার্কেটিং টিম অসাধারণ।",
    rating: 5,
  },
  {
    name: "ফারিহা ইসলাম",
    role: "CEO, Rupkotha Cosmetics",
    text: "ওদের তৈরি Shopify সাইট আর AI চ্যাটবট আমাদের কাস্টমার সাপোর্ট পুরোপুরি অটোমেট করে দিয়েছে।",
    rating: 5,
  },
  {
    name: "তানভীর হোসেন",
    role: "Owner, GadgetZone",
    text: "প্যাকেজিং থেকে ওয়েবসাইট সব কিছু এক জায়গায় — সময় ও খরচ দুটোই বাঁচে। হাইলি রিকমেন্ডেড।",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">ক্লায়েন্ট রিভিউ</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            আমাদের <span className="gradient-text">ক্লায়েন্টরা</span> যা বলেন
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="relative p-8 rounded-2xl bg-gradient-card border border-border/60 hover:shadow-elegant transition-smooth hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/15" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
