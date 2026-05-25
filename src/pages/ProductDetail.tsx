import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Check, Package2, FileCode2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const { add, setOpen } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [variant, setVariant] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      const { data: p } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      setProduct(p);
      if (p) {
        const { data: v } = await supabase.from("product_variants").select("*").eq("product_id", p.id).eq("is_active", true).order("sort_order");
        setVariants(v || []);
        if (p.category_id) {
          const { data: r } = await supabase.from("products").select("*").eq("category_id", p.category_id).neq("id", p.id).eq("is_active", true).limit(4);
          setRelated(r || []);
        }
      }
      setLoading(false);
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">{lang === "bn" ? "প্রোডাক্ট পাওয়া যায়নি" : "Product not found"}</h1>
        <Button asChild variant="hero"><Link to="/#shop">{lang === "bn" ? "শপে ফিরুন" : "Back to shop"}</Link></Button>
      </div>
    </div>
  );

  const name = lang === "bn" ? product.name_bn : product.name_en;
  const desc = lang === "bn" ? product.description_bn : product.description_en;
  const price = variant?.price != null ? Number(variant.price) : Number(product.price) + Number(variant?.price_delta || 0);
  const Icon = product.category === "physical" ? Package2 : FileCode2;
  const gallery: string[] = Array.isArray(product.gallery) ? product.gallery : [];
  const baseImages = [product.image_url, ...gallery].filter(Boolean);
  const images = variant?.image_url ? [variant.image_url, ...baseImages.filter((i) => i !== variant.image_url)] : baseImages;

  const addToCart = () => {
    const itemName = variant ? `${name} — ${lang === "bn" ? variant.name_bn : variant.name_en}` : name;
    const itemId = variant ? `${product.id}::${variant.id}` : product.id;
    for (let i = 0; i < qty; i++) add({ id: itemId, name: itemName, price, is_physical: product.is_physical !== false });
    toast.success(t("shop_added"));
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <Link to="/#shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {lang === "bn" ? "শপে ফিরুন" : "Back to shop"}
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-hero border border-border/60 flex items-center justify-center">
                {images[0] ? <img src={images[0]} alt={name} className="w-full h-full object-cover" /> : <Icon className="h-32 w-32 text-primary/60" />}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border/60">
                      <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {product.badge && <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-accent text-accent-foreground uppercase">{product.badge}</span>}
              <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold gradient-text">৳{price.toLocaleString()}</span>
                {product.old_price && <span className="text-lg text-muted-foreground line-through">৳{Number(product.old_price).toLocaleString()}</span>}
              </div>
              {desc && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{desc}</p>}

              {variants.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">{lang === "bn" ? "ভ্যারিয়েন্ট নির্বাচন করুন" : "Choose variant"}</div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const vName = lang === "bn" ? v.name_bn : v.name_en;
                      const active = variant?.id === v.id;
                      const vPrice = v.price != null ? Number(v.price) : Number(product.price) + Number(v.price_delta || 0);
                      return (
                        <button key={v.id} onClick={() => setVariant(active ? null : v)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-smooth ${active ? "border-primary bg-primary/10 text-foreground shadow-glow" : "border-border hover:border-primary/50"}`}>
                          {v.image_url && <img src={v.image_url} alt={vName} className="h-8 w-8 rounded-md object-cover" />}
                          <span className="flex flex-col items-start">
                            <span>{active && <Check className="inline h-3 w-3 mr-1" />}{vName}</span>
                            <span className="text-xs text-muted-foreground">৳{vPrice.toLocaleString()}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-secondary">−</button>
                  <span className="px-4 font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 hover:bg-secondary">+</button>
                </div>
                <Button variant="hero" size="lg" className="flex-1" onClick={addToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> {t("shop_add")}
                </Button>
              </div>

              <div className="border-t border-border/60 pt-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{lang === "bn" ? "ক্যাটাগরি" : "Category"}:</span> <span className="font-medium">{product.category}</span></div>
                {product.stock != null && <div><span className="text-muted-foreground">{lang === "bn" ? "স্টক" : "Stock"}:</span> <span className="font-medium">{product.stock}</span></div>}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">{lang === "bn" ? "আরও দেখুন" : "Related products"}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((r) => (
                  <Link key={r.id} to={`/product/${r.slug}`} className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 hover:-translate-y-1 transition-smooth">
                    <div className="aspect-[4/3] bg-gradient-hero flex items-center justify-center">
                      {r.image_url ? <img src={r.image_url} alt={r.name_en} className="w-full h-full object-cover" /> : <Package2 className="h-16 w-16 text-primary/60" />}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold line-clamp-2 mb-1">{lang === "bn" ? r.name_bn : r.name_en}</div>
                      <div className="text-lg font-bold gradient-text">৳{Number(r.price).toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
