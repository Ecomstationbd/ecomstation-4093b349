import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NotFound from "./NotFound";

type PageRow = {
  id: string;
  title: string;
  html_content: string;
  css_content: string;
  js_content: string;
  meta_description: string | null;
};

export default function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("pages")
        .select("id, title, html_content, css_content, js_content, meta_description")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();
      if (mounted) {
        setPage(data as PageRow | null);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.title;
    if (page.meta_description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", page.meta_description);
    }
  }, [page]);

  useEffect(() => {
    if (!page?.js_content) return;
    try {
      const script = document.createElement("script");
      script.textContent = page.js_content;
      document.body.appendChild(script);
      return () => { script.remove(); };
    } catch (e) { console.error(e); }
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!page) return <NotFound />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {page.css_content && <style dangerouslySetInnerHTML={{ __html: page.css_content }} />}
      <main className="flex-1 pt-20">
        <div dangerouslySetInnerHTML={{ __html: page.html_content }} />
      </main>
      <Footer />
    </div>
  );
}
