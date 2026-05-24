import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, LogOut, ShieldCheck, Wrench, FolderTree, Package, MessageSquare, ShoppingBag, Mail, Bot, Settings } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

type Service = any;
type Product = any;
type Testimonial = any;
type Order = any;
type Contact = any;

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [claiming, setClaiming] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const claimAdmin = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) { toast.error(error.message); return; }
    if (data) { toast.success("You are now admin. Reload."); window.location.reload(); }
    else toast.error("An admin already exists. Ask the owner to grant you access.");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8 shadow-soft">
          <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground mb-6">Signed in as {user.email}. If you are the owner, claim admin access (only the first user can).</p>
          <div className="flex flex-col gap-2">
            <Button variant="hero" onClick={claimAdmin} disabled={claiming}>{claiming ? "..." : "Claim admin (first user)"}</Button>
            <Button variant="outline" onClick={async () => { await signOut(); nav("/auth"); }}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { value: "services", label: "Services", icon: Wrench },
    { value: "categories", label: "Categories", icon: FolderTree },
    { value: "products", label: "Products", icon: Package },
    { value: "testimonials", label: "Reviews", icon: MessageSquare },
    { value: "orders", label: "Orders", icon: ShoppingBag },
    { value: "contacts", label: "Messages", icon: Mail },
    { value: "chatbot", label: "Chatbot", icon: Bot },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-bold gradient-text text-base">Admin Panel</div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => nav("/")}>View Site</Button>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav("/"); }}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 pb-32 md:pb-6">
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider opacity-80">Welcome back</div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Dashboard Overview</h1>
            <p className="text-sm opacity-90 mt-1">Manage your store, services and customer engagement from one place.</p>
          </div>
        </div>

        <Tabs defaultValue="services">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-card/60 border border-border/60 p-1.5 rounded-xl backdrop-blur-sm">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="gap-1.5 rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="services" className="mt-4"><ServicesAdmin /></TabsContent>
          <TabsContent value="categories" className="mt-4"><CategoriesAdmin /></TabsContent>
          <TabsContent value="products" className="mt-4"><ProductsAdmin /></TabsContent>
          <TabsContent value="testimonials" className="mt-4"><TestimonialsAdmin /></TabsContent>
          <TabsContent value="orders" className="mt-4"><OrdersAdmin /></TabsContent>
          <TabsContent value="contacts" className="mt-4"><ContactsAdmin /></TabsContent>
          <TabsContent value="chatbot" className="mt-4"><ChatbotAdmin /></TabsContent>
          <TabsContent value="settings" className="mt-4"><SettingsAdmin /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


/* ---------- Services ---------- */
function ServicesAdmin() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => supabase.from("services").select("*").order("sort_order").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const save = async (form: Service) => {
    const payload = { ...form };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { error } = editing?.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Services ({items.length})</h2>
        <Button variant="hero" size="sm" onClick={() => { setEditing({ slug: "", title_bn: "", title_en: "", description_bn: "", description_en: "", icon: "Sparkles", coming_soon: false, is_active: true, sort_order: items.length + 1 }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Add Service
        </Button>
      </div>
      <div className="grid gap-2">
        {items.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{s.title_en} <span className="text-muted-foreground">/ {s.title_bn}</span></div>
              <div className="text-xs text-muted-foreground">slug: {s.slug} {s.coming_soon && "• Coming Soon"} {!s.is_active && "• Hidden"}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
          {editing && <ServiceForm value={editing} onChange={setEditing} onSave={() => save(editing)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function ServiceForm({ value, onChange, onSave }: any) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const features: string[] = Array.isArray(value.features) ? value.features : [];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Slug (URL)</Label><Input value={value.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="web-design" /></div>
        <div><Label>Icon (Lucide name)</Label><Input value={value.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="Globe, Megaphone..." /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Title (BN)</Label><Input value={value.title_bn} onChange={(e) => set("title_bn", e.target.value)} /></div>
        <div><Label>Title (EN)</Label><Input value={value.title_en} onChange={(e) => set("title_en", e.target.value)} /></div>
      </div>
      <div><Label>Short Description (BN)</Label><Textarea rows={2} value={value.description_bn || ""} onChange={(e) => set("description_bn", e.target.value)} /></div>
      <div><Label>Short Description (EN)</Label><Textarea rows={2} value={value.description_en || ""} onChange={(e) => set("description_en", e.target.value)} /></div>
      <div><Label>Full Content (BN) — shown on detail page</Label><Textarea rows={5} value={value.content_bn || ""} onChange={(e) => set("content_bn", e.target.value)} /></div>
      <div><Label>Full Content (EN)</Label><Textarea rows={5} value={value.content_en || ""} onChange={(e) => set("content_en", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Image URL</Label><Input value={value.image_url || ""} onChange={(e) => set("image_url", e.target.value)} /></div>
        <div><Label>Price label</Label><Input value={value.price_text || ""} onChange={(e) => set("price_text", e.target.value)} placeholder="৳5,000 থেকে" /></div>
      </div>
      <div>
        <Label>Features (one per line)</Label>
        <Textarea rows={4} value={features.join("\n")} onChange={(e) => set("features", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} placeholder="Free domain&#10;SSL included&#10;1 year support" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><Label>Badge</Label><Input value={value.badge || ""} onChange={(e) => set("badge", e.target.value)} /></div>
        <div><Label>Sort</Label><Input type="number" value={value.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} /></div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2"><Switch checked={value.coming_soon} onCheckedChange={(c) => set("coming_soon", c)} /> Coming Soon</label>
        </div>
      </div>
      <label className="flex items-center gap-2"><Switch checked={value.is_active} onCheckedChange={(c) => set("is_active", c)} /> Active</label>
      <Button variant="hero" className="w-full" onClick={onSave}>Save</Button>
    </div>
  );
}

/* ---------- Products ---------- */
function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const load = () => supabase.from("products").select("*").order("sort_order").then(({ data }) => setItems(data || []));
  const loadCats = () => supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCats(data || []));
  useEffect(() => { load(); loadCats(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openEdit = async (p: Product | null) => {
    if (p?.id) {
      setEditing(p);
      const { data } = await supabase.from("product_variants").select("*").eq("product_id", p.id).order("sort_order");
      setVariants(data || []);
    } else {
      setEditing({ slug: "", name_bn: "", name_en: "", description_bn: "", description_en: "", price: 0, old_price: null, category: "physical", category_id: null, badge: "", image_url: "", gallery: [], stock: null, is_active: true, is_physical: true, sort_order: items.length + 1 });
      setVariants([]);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const payload: any = { ...editing };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    payload.price = Number(payload.price);
    payload.old_price = payload.old_price ? Number(payload.old_price) : null;
    payload.stock = payload.stock === "" || payload.stock == null ? null : Number(payload.stock);
    if (!payload.slug) payload.slug = slugify(payload.name_en || payload.name_bn || "product") + "-" + Math.random().toString(36).slice(2, 7);
    if (typeof payload.gallery === "string") {
      payload.gallery = payload.gallery.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }

    let productId = editing.id;
    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      if (error) return toast.error(error.message);
      productId = data.id;
    }

    // Sync variants
    await supabase.from("product_variants").delete().eq("product_id", productId);
    const valid = variants.filter((v) => v.name_en || v.name_bn);
    if (valid.length) {
      await supabase.from("product_variants").insert(valid.map((v, i) => ({
        product_id: productId,
        name_bn: v.name_bn || v.name_en,
        name_en: v.name_en || v.name_bn,
        price_delta: Number(v.price_delta) || 0,
        stock: v.stock === "" || v.stock == null ? null : Number(v.stock),
        sort_order: i,
        is_active: v.is_active !== false,
      })));
    }

    toast.success("Saved"); setOpen(false); setEditing(null); setVariants([]); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const galleryStr = Array.isArray(editing?.gallery) ? editing.gallery.join("\n") : (editing?.gallery || "");

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Products ({items.length})</h2>
        <Button variant="hero" size="sm" onClick={() => openEdit(null)}>
          <Plus className="h-4 w-4 mr-1" />Add Product
        </Button>
      </div>
      <div className="grid gap-2">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{p.name_en} <span className="text-muted-foreground">/ {p.name_bn}</span></div>
              <div className="text-xs text-muted-foreground">৳{p.price} • {p.category} • /{p.slug} {!p.is_active && "• Hidden"}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} Product</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Name (BN)</Label><Input value={editing.name_bn} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} /></div>
                <div><Label>Name (EN)</Label><Input value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></div>
              </div>
              <div><Label>Slug (URL)</Label><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} placeholder="auto-generated" /></div>
              <div><Label>Description (BN)</Label><Textarea rows={3} value={editing.description_bn || ""} onChange={(e) => setEditing({ ...editing, description_bn: e.target.value })} /></div>
              <div><Label>Description (EN)</Label><Textarea rows={3} value={editing.description_en || ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Price</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
                <div><Label>Old Price</Label><Input type="number" value={editing.old_price || ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value })} /></div>
                <div><Label>Stock</Label><Input type="number" value={editing.stock ?? ""} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} placeholder="∞" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Type</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="physical">Physical</SelectItem><SelectItem value="digital">Digital</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label>
                  <Select value={editing.category_id || "none"} onValueChange={(v) => setEditing({ ...editing, category_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Badge</Label><Input value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></div>
                <div><Label>Main Image URL</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
              </div>
              <div><Label>Gallery (one URL per line)</Label><Textarea rows={3} value={galleryStr} onChange={(e) => setEditing({ ...editing, gallery: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} /></div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <Label>Variants</Label>
                  <Button size="sm" variant="outline" type="button" onClick={() => setVariants([...variants, { name_bn: "", name_en: "", price_delta: 0, stock: null, is_active: true }])}>
                    <Plus className="h-3 w-3 mr-1" />Add Variant
                  </Button>
                </div>
                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1 items-end bg-secondary/30 p-2 rounded-lg">
                      <div className="col-span-3"><Input placeholder="Name BN" value={v.name_bn} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, name_bn: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-3"><Input placeholder="Name EN" value={v.name_en} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, name_en: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-3"><Input type="number" placeholder="Price ±" value={v.price_delta} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, price_delta: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-2"><Input type="number" placeholder="Stock" value={v.stock ?? ""} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, stock: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-1"><Button size="icon" variant="ghost" type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                    </div>
                  ))}
                  {variants.length === 0 && <div className="text-xs text-muted-foreground">No variants. Customers will buy the base product.</div>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div><Label>Sort</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <label className="flex items-center gap-2 mt-6"><Switch checked={editing.is_active} onCheckedChange={(c) => setEditing({ ...editing, is_active: c })} /> Active</label>
                <label className="flex items-center gap-2 mt-6" title="Charge delivery for this product"><Switch checked={editing.is_physical !== false} onCheckedChange={(c) => setEditing({ ...editing, is_physical: c })} /> Physical</label>
              </div>
              <Button variant="hero" className="w-full" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Categories ---------- */
function CategoriesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => supabase.from("categories").select("*").order("sort_order").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const save = async () => {
    if (!editing) return;
    const p: any = { ...editing }; delete p.id; delete p.created_at; delete p.updated_at;
    if (!p.slug) p.slug = slugify(p.name_en || p.name_bn);
    const { error } = editing.id
      ? await supabase.from("categories").update(p).eq("id", editing.id)
      : await supabase.from("categories").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Categories ({items.length})</h2>
        <Button variant="hero" size="sm" onClick={() => { setEditing({ slug: "", name_bn: "", name_en: "", description_bn: "", description_en: "", image_url: "", is_active: true, sort_order: items.length + 1 }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Add Category
        </Button>
      </div>
      <div className="grid gap-2">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{c.name_en} <span className="text-muted-foreground">/ {c.name_bn}</span></div>
              <div className="text-xs text-muted-foreground">/category/{c.slug} {!c.is_active && "• Hidden"}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Name (BN)</Label><Input value={editing.name_bn} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} /></div>
                <div><Label>Name (EN)</Label><Input value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></div>
              </div>
              <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></div>
              <div><Label>Description (BN)</Label><Textarea rows={2} value={editing.description_bn || ""} onChange={(e) => setEditing({ ...editing, description_bn: e.target.value })} /></div>
              <div><Label>Description (EN)</Label><Textarea rows={2} value={editing.description_en || ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></div>
              <div><Label>Image URL</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Sort</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <label className="flex items-center gap-2 mt-6"><Switch checked={editing.is_active} onCheckedChange={(c) => setEditing({ ...editing, is_active: c })} /> Active</label>
              </div>
              <Button variant="hero" className="w-full" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Testimonials ---------- */
function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => supabase.from("testimonials").select("*").order("sort_order").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const p: any = { ...editing }; delete p.id; delete p.created_at; delete p.updated_at;
    p.rating = parseInt(p.rating) || 5;
    const { error } = editing.id
      ? await supabase.from("testimonials").update(p).eq("id", editing.id)
      : await supabase.from("testimonials").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setEditing(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Testimonials ({items.length})</h2>
        <Button variant="hero" size="sm" onClick={() => { setEditing({ name: "", role_bn: "", role_en: "", quote_bn: "", quote_en: "", rating: 5, avatar_url: "", is_active: true, sort_order: items.length + 1 }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Add
        </Button>
      </div>
      <div className="grid gap-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground truncate">{t.quote_en}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} Testimonial</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Role (BN)</Label><Input value={editing.role_bn || ""} onChange={(e) => setEditing({ ...editing, role_bn: e.target.value })} /></div>
                <div><Label>Role (EN)</Label><Input value={editing.role_en || ""} onChange={(e) => setEditing({ ...editing, role_en: e.target.value })} /></div>
              </div>
              <div><Label>Quote (BN)</Label><Textarea value={editing.quote_bn} onChange={(e) => setEditing({ ...editing, quote_bn: e.target.value })} /></div>
              <div><Label>Quote (EN)</Label><Textarea value={editing.quote_en} onChange={(e) => setEditing({ ...editing, quote_en: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Rating (1-5)</Label><Input type="number" value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} /></div>
                <div><Label>Sort</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <label className="flex items-center gap-2 mt-6"><Switch checked={editing.is_active} onCheckedChange={(c) => setEditing({ ...editing, is_active: c })} /> Active</label>
              </div>
              <div><Label>Avatar URL</Label><Input value={editing.avatar_url || ""} onChange={(e) => setEditing({ ...editing, avatar_url: e.target.value })} /></div>
              <Button variant="hero" className="w-full" onClick={save}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Orders ---------- */
function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, any[]>>({});
  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    if (data && data.length) {
      const { data: oi } = await supabase.from("order_items").select("*").in("order_id", data.map((o) => o.id));
      const grouped: Record<string, any[]> = {};
      (oi || []).forEach((i: any) => { (grouped[i.order_id] ||= []).push(i); });
      setItems(grouped);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete order?")) return;
    await supabase.from("orders").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Orders ({orders.length})</h2>
      {orders.map((o) => (
        <div key={o.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <div>
              <div className="font-semibold">{o.customer_name} • {o.customer_phone}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
              {o.customer_email && <div className="text-xs">{o.customer_email}</div>}
              {o.customer_address && <div className="text-xs text-muted-foreground">{o.customer_address}</div>}
              {o.notes && <div className="text-xs italic">"{o.notes}"</div>}
            </div>
            <div className="flex items-center gap-2">
              <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(o.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="border-t border-border pt-2 text-sm">
            {(items[o.id] || []).map((i) => (
              <div key={i.id} className="flex justify-between"><span>{i.product_name} × {i.quantity}</span><span>৳{i.price * i.quantity}</span></div>
            ))}
            {Number(o.delivery_charge) > 0 && (
              <div className="flex justify-between text-muted-foreground"><span>Delivery ({o.delivery_location === "inside" ? "Inside Dhaka" : "Outside Dhaka"})</span><span>৳{Number(o.delivery_charge)}</span></div>
            )}
            <div className="flex justify-between font-bold pt-1 border-t border-border mt-1"><span>Total</span><span className="gradient-text">৳{Number(o.total).toLocaleString()}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Contacts ---------- */
function ContactsAdmin() {
  const [items, setItems] = useState<Contact[]>([]);
  const load = () => supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);
  const toggleRead = async (id: string, v: boolean) => { await supabase.from("contact_messages").update({ is_read: v }).eq("id", id); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("contact_messages").delete().eq("id", id); load(); };
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Messages ({items.length})</h2>
      {items.map((m) => (
        <div key={m.id} className={`bg-card border rounded-lg p-4 ${m.is_read ? "border-border" : "border-primary"}`}>
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{m.name} {m.email && <span className="text-muted-foreground">• {m.email}</span>} {m.phone && <span className="text-muted-foreground">• {m.phone}</span>}</div>
              <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
              {m.subject && <div className="text-sm font-medium mt-1">{m.subject}</div>}
              <div className="text-sm mt-1 whitespace-pre-wrap">{m.message}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1 text-xs"><Switch checked={m.is_read} onCheckedChange={(v) => toggleRead(m.id, v)} /> Read</label>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const s: Record<string, string> = {};
    (data || []).forEach((r: any) => { s[r.key] = r.value || ""; });
    setSettings(s);
  };
  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value: settings[key] || "" });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };
  const uploadLogo = async () => {
    if (!logoFile) return;
    const path = `logo-${Date.now()}-${logoFile.name}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, logoFile, { upsert: true });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
    setSettings({ ...settings, logo_url: pub.publicUrl });
    await supabase.from("site_settings").upsert({ key: "logo_url", value: pub.publicUrl });
    toast.success("Logo updated"); setLogoFile(null);
  };

  const fields = [
    { k: "brand_name", l: "Brand Name" },
    { k: "contact_phone", l: "Contact Phone" },
    { k: "contact_email", l: "Contact Email" },
    { k: "contact_whatsapp", l: "WhatsApp Number (with country code, no +)" },
  ];

  // Hero Stats (dynamic)
  const defaultStats = [
    { value: "500+", label_bn: "সফল ক্লায়েন্ট", label_en: "Happy Clients" },
    { value: "10+", label_bn: "সার্ভিস পিলার", label_en: "Service Pillars" },
    { value: "24/7", label_bn: "সাপোর্ট", label_en: "Support" },
    { value: "98%", label_bn: "সন্তুষ্টি", label_en: "Satisfaction" },
  ];
  let heroStats: { value: string; label_bn: string; label_en: string }[] = defaultStats;
  try {
    const parsed = JSON.parse(settings.hero_stats || "");
    if (Array.isArray(parsed) && parsed.length) heroStats = parsed;
  } catch {}
  const updateStat = (i: number, key: "value" | "label_bn" | "label_en", val: string) => {
    const next = heroStats.map((s, idx) => (idx === i ? { ...s, [key]: val } : s));
    setSettings({ ...settings, hero_stats: JSON.stringify(next) });
  };
  const saveStats = async () => {
    const { error } = await supabase.from("site_settings").upsert({ key: "hero_stats", value: settings.hero_stats || JSON.stringify(defaultStats) });
    if (error) return toast.error(error.message);
    toast.success("Hero stats saved");
  };

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-bold">Site Settings</h2>
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <Label>Logo</Label>
        {settings.logo_url && <img src={settings.logo_url} alt="logo" className="h-16 w-16 rounded-xl object-cover border border-border" />}
        <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
        <Button variant="hero" size="sm" onClick={uploadLogo} disabled={!logoFile}>Upload Logo</Button>
      </div>
      {fields.map((f) => (
        <div key={f.k} className="bg-card border border-border rounded-lg p-4 space-y-2">
          <Label>{f.l}</Label>
          <Input value={settings[f.k] || ""} onChange={(e) => setSettings({ ...settings, [f.k]: e.target.value })} />
          <Button size="sm" variant="hero" onClick={() => save(f.k)}>Save</Button>
        </div>
      ))}

      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <Label className="text-base font-semibold">Hero Stats (counter section)</Label>
        <p className="text-xs text-muted-foreground">Numeric values animate with count-up. Use formats like "500+", "98%", "24/7".</p>
        {heroStats.map((s, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-md border border-border/60">
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="500+" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Label (Bangla)</Label>
              <Input value={s.label_bn} onChange={(e) => updateStat(i, "label_bn", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Label (English)</Label>
              <Input value={s.label_en} onChange={(e) => updateStat(i, "label_en", e.target.value)} />
            </div>
          </div>
        ))}
        <Button size="sm" variant="hero" onClick={saveStats}>Save Hero Stats</Button>
      </div>
    </div>
  );
}

/* ---------- Chatbot Training & Conversations ---------- */
function ChatbotAdmin() {
  const KEYS = ["chatbot_enabled", "chatbot_welcome_bn", "chatbot_welcome_en", "chatbot_system_prompt", "chatbot_knowledge"];
  const [s, setS] = useState<Record<string, string>>({});
  const [convs, setConvs] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);

  const loadSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*").in("key", KEYS);
    const o: Record<string, string> = {};
    (data || []).forEach((r: any) => { o[r.key] = r.value || ""; });
    setS(o);
  };
  const loadConvs = async () => {
    const { data } = await supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false }).limit(100);
    setConvs(data || []);
  };
  useEffect(() => { loadSettings(); loadConvs(); }, []);

  const openConv = async (c: any) => {
    setActiveConv(c);
    const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", c.id).order("created_at");
    setMsgs(data || []);
  };

  const saveAll = async () => {
    const rows = KEYS.map((k) => ({ key: k, value: s[k] ?? "" }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) return toast.error(error.message);
    toast.success("Chatbot settings saved");
  };

  const markResolved = async (id: string) => {
    await supabase.from("chat_conversations").update({ status: "resolved", escalated: false }).eq("id", id);
    toast.success("Marked resolved"); loadConvs();
  };
  const deleteConv = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("chat_conversations").delete().eq("id", id);
    setActiveConv(null); setMsgs([]); loadConvs();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h2 className="text-xl font-bold">AI Chatbot Training</h2>
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enabled on landing page</Label>
            <Switch checked={s.chatbot_enabled !== "false"} onCheckedChange={(v) => setS({ ...s, chatbot_enabled: v ? "true" : "false" })} />
          </div>
          <div>
            <Label>Welcome message (Bengali)</Label>
            <Textarea rows={2} value={s.chatbot_welcome_bn || ""} onChange={(e) => setS({ ...s, chatbot_welcome_bn: e.target.value })} />
          </div>
          <div>
            <Label>Welcome message (English)</Label>
            <Textarea rows={2} value={s.chatbot_welcome_en || ""} onChange={(e) => setS({ ...s, chatbot_welcome_en: e.target.value })} />
          </div>
          <div>
            <Label>System Prompt (personality & rules)</Label>
            <Textarea rows={6} value={s.chatbot_system_prompt || ""} onChange={(e) => setS({ ...s, chatbot_system_prompt: e.target.value })} placeholder="You are a friendly support agent for..." />
          </div>
          <div>
            <Label>Knowledge Base (FAQ, prices, policies)</Label>
            <Textarea rows={10} value={s.chatbot_knowledge || ""} onChange={(e) => setS({ ...s, chatbot_knowledge: e.target.value })} placeholder="Services, pricing, hours, FAQs — anything the bot should know." />
          </div>
          <Button variant="hero" onClick={saveAll}>Save Training</Button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">Conversations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-2 max-h-[600px] overflow-y-auto space-y-1">
            {convs.length === 0 && <div className="text-sm text-muted-foreground p-3">No conversations yet.</div>}
            {convs.map((c) => (
              <button key={c.id} onClick={() => openConv(c)} className={`w-full text-left p-2 rounded-md hover:bg-secondary ${activeConv?.id === c.id ? "bg-secondary" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium truncate">{c.visitor_name || "Anonymous"}</div>
                  {c.escalated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-foreground">ESCALATED</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.visitor_contact || c.id.slice(0, 8)}</div>
                <div className="text-[10px] text-muted-foreground">{new Date(c.updated_at).toLocaleString()} · {c.status}</div>
              </button>
            ))}
          </div>
          <div className="bg-card border border-border rounded-lg p-3 max-h-[600px] overflow-y-auto">
            {!activeConv ? <div className="text-sm text-muted-foreground">Select a conversation</div> : (
              <div className="space-y-2">
                <div className="flex gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => markResolved(activeConv.id)}>Resolve</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteConv(activeConv.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
                {msgs.map((m) => (
                  <div key={m.id} className={`text-sm p-2 rounded-md ${m.role === "user" ? "bg-primary/10" : m.role === "assistant" ? "bg-secondary" : "bg-accent/20 italic"}`}>
                    <div className="text-[10px] uppercase text-muted-foreground mb-0.5">{m.role}</div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
