import { useState } from "react";
import { ShoppingCart, Check, Package2, FileCode2, Printer, Sticker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: "physical" | "digital";
  badge?: string;
  icon: typeof Package2;
};

const products: Product[] = [
  { id: "p1", name: "থার্মাল প্রিন্টার (4x6)", price: 6500, oldPrice: 7500, category: "physical", badge: "Best Seller", icon: Printer },
  { id: "p2", name: "কুরিয়ার পলি (১০০ পিস)", price: 450, category: "physical", icon: Package2 },
  { id: "p3", name: "প্রোডাক্ট স্টিকার (কাস্টম)", price: 1200, category: "physical", icon: Sticker },
  { id: "p4", name: "স্কচ টেপ বান্ডেল (১২ পিস)", price: 720, category: "physical", icon: Package2 },
  { id: "d1", name: "Premium Landing Page Template", price: 1500, oldPrice: 2500, category: "digital", badge: "New", icon: FileCode2 },
  { id: "d2", name: "WooCommerce Backup Script", price: 990, category: "digital", icon: FileCode2 },
  { id: "d3", name: "Pixel + Server Tracking Script", price: 2500, category: "digital", badge: "Pro", icon: FileCode2 },
  { id: "d4", name: "AI Chatbot Starter Kit", price: 3500, category: "digital", icon: FileCode2 },
];

export function Shop() {
  const [tab, setTab] = useState<"all" | "physical" | "digital">("all");
  const [cart, setCart] = useState<string[]>([]);

  const filtered = products.filter((p) => tab === "all" || p.category === tab);

  const addToCart = (p: Product) => {
    setCart((c) => [...c, p.id]);
    toast.success(`কার্টে যোগ হয়েছে: ${p.name}`);
  };

  return (
    <section id="shop" className="py-24 relative bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-semibold text-primary mb-3 tracking-wider uppercase">মিনি শপ</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">প্যাকেজিং</span> ও ডিজিটাল অ্যাসেট
          </h2>
          <p className="text-muted-foreground text-lg">
            আপনার ই-কমার্স ব্যবসার জন্য প্রয়োজনীয় ফিজিক্যাল ও ডিজিটাল পণ্য এক জায়গায়।
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full bg-background border border-border shadow-soft">
            {[
              { k: "all", l: "সব" },
              { k: "physical", l: "ফিজিক্যাল" },
              { k: "digital", l: "ডিজিটাল" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as typeof tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-smooth ${
                  tab === t.k
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => {
            const Icon = p.icon;
            const inCart = cart.includes(p.id);
            return (
              <div
                key={p.id}
                className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-elegant transition-smooth hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-gradient-hero flex items-center justify-center relative overflow-hidden">
                  <Icon className="h-20 w-20 text-primary/70 group-hover:scale-110 transition-smooth" />
                  {p.badge && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-accent text-accent-foreground uppercase tracking-wider shadow-soft">
                      {p.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full bg-background/80 backdrop-blur text-muted-foreground uppercase">
                    {p.category === "physical" ? "ফিজিক্যাল" : "ডিজিটাল"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">{p.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold gradient-text">৳{p.price.toLocaleString("bn-BD")}</span>
                    {p.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ৳{p.oldPrice.toLocaleString("bn-BD")}
                      </span>
                    )}
                  </div>
                  <Button
                    variant={inCart ? "outline-glow" : "hero"}
                    size="sm"
                    className="w-full"
                    onClick={() => addToCart(p)}
                  >
                    {inCart ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> কার্টে আছে
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" /> কার্টে যোগ করুন
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
