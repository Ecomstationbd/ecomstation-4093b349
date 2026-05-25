import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FileCode, Eye, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  html_content: string;
  css_content: string;
  js_content: string;
  meta_description: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

const RESERVED = new Set([
  "admin","auth","dashboard","product","combo","category","service","physical-products",
  "blog","thank-you","cart","checkout","api","assets",""
]);

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

export function PagesAdmin() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("pages").select("*").order("updated_at", { ascending: false });
    setPages((data as PageRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing({
      id: "", slug: "", title: "",
      html_content: '<section class="container mx-auto py-16 px-4">\n  <h1 class="text-4xl font-bold mb-4">New Page</h1>\n  <p>Start writing your content here.</p>\n</section>',
      css_content: "", js_content: "", meta_description: "",
      status: "draft", published_at: null, updated_at: new Date().toISOString(),
    });
    setOpen(true);
  };

  const startEdit = (p: PageRow) => { setEditing({ ...p }); setOpen(true); };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold flex items-center gap-2"><FileCode className="h-6 w-6 text-primary" /> Custom Pages</h2>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" /> New Page</Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : pages.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No pages yet. Click "New Page" to create one.</Card>
      ) : (
        <div className="grid gap-3">
          {pages.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">/{p.slug}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                {p.status === "published" && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/${p.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => startEdit(p)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <PageEditor
          page={editing}
          open={open}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSaved={() => { load(); setOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function PageEditor({ page, open, onClose, onSaved }: { page: PageRow; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(page);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("html");

  useEffect(() => { setForm(page); }, [page]);

  const onTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
  };

  const previewSrcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>${form.css_content}</style></head><body>${form.html_content}<script>try{${form.js_content}}catch(e){console.error(e)}<\/script></body></html>`;

  const save = async (publish?: boolean) => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    const slug = slugify(form.slug || form.title);
    if (!slug) { toast.error("Slug required"); return; }
    if (RESERVED.has(slug)) { toast.error(`"${slug}" is a reserved route. Choose another slug.`); return; }

    setSaving(true);
    const newStatus = publish === true ? "published" : publish === false ? "draft" : form.status;
    const payload = {
      slug,
      title: form.title.trim(),
      html_content: form.html_content,
      css_content: form.css_content,
      js_content: form.js_content,
      meta_description: form.meta_description || null,
      status: newStatus,
      published_at: newStatus === "published" ? (form.published_at || new Date().toISOString()) : null,
    };

    const res = form.id
      ? await supabase.from("pages").update(payload).eq("id", form.id)
      : await supabase.from("pages").insert(payload);

    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(form.id ? "Updated" : "Created");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Page" : "New Page"}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="About Us" />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/</span>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="about" />
            </div>
          </div>
        </div>

        <div>
          <Label>Meta Description (SEO)</Label>
          <Input value={form.meta_description || ""} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} maxLength={160} />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="js">JS</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1" /> Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="html">
            <Textarea
              value={form.html_content}
              onChange={(e) => setForm({ ...form, html_content: e.target.value })}
              className="font-mono text-xs min-h-[400px]"
              placeholder="<section>...</section>"
            />
            <p className="text-xs text-muted-foreground mt-1">Tailwind CSS classes are available. The page is wrapped in your site Navbar & Footer.</p>
          </TabsContent>
          <TabsContent value="css">
            <Textarea
              value={form.css_content}
              onChange={(e) => setForm({ ...form, css_content: e.target.value })}
              className="font-mono text-xs min-h-[400px]"
              placeholder=".my-class { color: red; }"
            />
          </TabsContent>
          <TabsContent value="js">
            <Textarea
              value={form.js_content}
              onChange={(e) => setForm({ ...form, js_content: e.target.value })}
              className="font-mono text-xs min-h-[400px]"
              placeholder="console.log('hello');"
            />
            <p className="text-xs text-muted-foreground mt-1">⚠️ Only add JS you trust. Runs on every page view.</p>
          </TabsContent>
          <TabsContent value="preview">
            <iframe srcDoc={previewSrcDoc} className="w-full min-h-[500px] border rounded-lg bg-white" sandbox="allow-scripts" title="preview" />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 flex-wrap pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="secondary" onClick={() => save(false)} disabled={saving}>Save as Draft</Button>
          <Button onClick={() => save(true)} disabled={saving}>{saving ? "Saving..." : "Publish"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
