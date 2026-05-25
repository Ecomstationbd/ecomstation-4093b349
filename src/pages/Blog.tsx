import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Calendar, ArrowRight } from "lucide-react";

type Blog = {
  id: string; slug: string;
  title_bn: string; title_en: string;
  excerpt_bn: string | null; excerpt_en: string | null;
  cover_url: string | null;
  published_at: string | null;
  author_name: string | null;
  tags: string[];
};

export default function Blog() {
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blogs")
        .select("id, slug, title_bn, title_en, excerpt_bn, excerpt_en, cover_url, published_at, author_name, tags")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setBlogs((data as Blog[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-28 pb-20">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {bn ? "ব্লগ" : "Blog"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {bn ? "ই-কমার্স, মার্কেটিং ও বিজনেস গ্রোথ নিয়ে আমাদের সর্বশেষ আর্টিকেল।" : "Latest insights on e-commerce, marketing and business growth."}
          </p>
        </header>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">{bn ? "লোড হচ্ছে…" : "Loading…"}</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">{bn ? "এখনো কোনো ব্লগ পোস্ট নেই।" : "No blog posts yet."}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.map((b) => {
              const title = bn ? b.title_bn : b.title_en;
              const excerpt = bn ? b.excerpt_bn : b.excerpt_en;
              return (
                <Link
                  key={b.id}
                  to={`/blog/${b.slug}`}
                  className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-elegant hover:-translate-y-0.5 transition-smooth flex flex-col"
                >
                  {b.cover_url && (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img src={b.cover_url} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    {b.tags?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {b.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-bold text-lg leading-snug group-hover:text-primary transition-smooth line-clamp-2">{title}</h2>
                    {excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{excerpt}</p>}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {b.published_at ? new Date(b.published_at).toLocaleDateString(bn ? "bn-BD" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        {bn ? "পড়ুন" : "Read"} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
