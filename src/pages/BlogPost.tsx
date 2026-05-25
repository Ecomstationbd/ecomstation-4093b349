import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageProvider";
import { renderBlogHtml } from "@/lib/blog";
import { ArrowLeft, Calendar, User } from "lucide-react";

type Blog = {
  id: string; slug: string;
  title_bn: string; title_en: string;
  content_bn: string | null; content_en: string | null;
  cover_url: string | null;
  published_at: string | null;
  author_name: string | null;
  tags: string[];
};

export default function BlogPost() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      setBlog(data as Blog | null);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (blog) document.title = (bn ? blog.title_bn : blog.title_en) + " — Blog";
  }, [blog, bn]);

  const title = blog ? (bn ? blog.title_bn : blog.title_en) : "";
  const content = blog ? (bn ? blog.content_bn : blog.content_en) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-28 pb-20 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> {bn ? "সব ব্লগ" : "All blogs"}
        </Link>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">{bn ? "লোড হচ্ছে…" : "Loading…"}</div>
        ) : !blog ? (
          <div className="text-center py-16 text-muted-foreground">{bn ? "ব্লগ পোস্ট পাওয়া যায়নি।" : "Blog post not found."}</div>
        ) : (
          <article>
            {blog.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {blog.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t}</span>
                ))}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">{title}</h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              {blog.author_name && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {blog.author_name}</span>}
              {blog.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(blog.published_at).toLocaleDateString(bn ? "bn-BD" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            {blog.cover_url && (
              <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                <img src={blog.cover_url} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className="mt-8 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: renderBlogHtml(content) }}
            />
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
