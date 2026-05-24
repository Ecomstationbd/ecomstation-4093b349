import { useEffect, useState, useMemo } from "react";
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
import { Trash2, Edit, Plus, LogOut, ShieldCheck, Wrench, FolderTree, Package, MessageSquare, ShoppingBag, Mail, Bot, Settings, LayoutDashboard, AlertTriangle, TrendingUp, DollarSign, Clock, Printer, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import * as XLSX from "xlsx";
import JsBarcode from "jsbarcode";

type Service = any;
type Product = any;
type Testimonial = any;
type Order = any;
type Contact = any;

const NAV_ITEMS = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "orders", label: "Orders", icon: ShoppingBag },
  { value: "services", label: "Services", icon: Wrench },
  { value: "categories", label: "Categories", icon: FolderTree },
  { value: "products", label: "Products", icon: Package },
  { value: "testimonials", label: "Reviews", icon: MessageSquare },
  { value: "contacts", label: "Messages", icon: Mail },
  { value: "chatbot", label: "Chatbot", icon: Bot },
  { value: "settings", label: "Settings", icon: Settings },
];

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [claiming, setClaiming] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [incompleteCount, setIncompleteCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchIncomplete = async () => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true })
        .eq("status", "pending").lt("created_at", cutoff);
      setIncompleteCount(count || 0);
    };
    fetchIncomplete();
    const t = setInterval(fetchIncomplete, 60000);
    return () => clearInterval(t);
  }, [isAdmin]);

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

  const activeItem = NAV_ITEMS.find((i) => i.value === active);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="leading-tight group-data-[collapsible=icon]:hidden">
                <div className="font-bold gradient-text text-sm">Admin Panel</div>
                <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">{user.email}</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((it) => (
                    <SidebarMenuItem key={it.value}>
                      <SidebarMenuButton isActive={active === it.value} onClick={() => setActive(it.value)} tooltip={it.label}>
                        <it.icon className="h-4 w-4" />
                        <span>{it.label}</span>
                      </SidebarMenuButton>
                      {it.value === "orders" && incompleteCount > 0 && (
                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground">{incompleteCount}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex flex-col gap-1 p-1 group-data-[collapsible=icon]:hidden">
              <Button variant="outline" size="sm" onClick={() => nav("/")}>View Site</Button>
              <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav("/"); }}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-xl sticky top-0 z-40 px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="font-semibold text-sm flex items-center gap-2">
                {activeItem && <activeItem.icon className="h-4 w-4 text-primary" />}
                {activeItem?.label}
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 px-4 py-6 pb-32 md:pb-6 max-w-7xl w-full mx-auto">
            {active === "dashboard" && <DashboardAdmin onNavigate={setActive} />}
            {active === "services" && <ServicesAdmin />}
            {active === "categories" && <CategoriesAdmin />}
            {active === "products" && <ProductsAdmin />}
            {active === "testimonials" && <TestimonialsAdmin />}
            {active === "orders" && <OrdersAdmin />}
            {active === "contacts" && <ContactsAdmin />}
            {active === "chatbot" && <ChatbotAdmin />}
            {active === "settings" && <SettingsAdmin />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/* ---------- Dashboard ---------- */
function DashboardAdmin({ onNavigate }: { onNavigate: (v: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: o } = await supabase.from("orders").select("*").gte("created_at", since).order("created_at", { ascending: false });
      setOrders(o || []);
      if (o && o.length) {
        const { data: oi } = await supabase.from("order_items").select("order_id").in("order_id", o.map((x) => x.id));
        setOrderItems(oi || []);
      }
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 86400000;
    const isPaid = (s: string) => ["confirmed", "shipped", "delivered"].includes(s);

    const todayOrders = orders.filter((o) => new Date(o.created_at).getTime() >= startOfDay);
    const todaySales = todayOrders.filter((o) => isPaid(o.status)).reduce((a, o) => a + Number(o.total || 0), 0);
    const weekOrders = orders.filter((o) => new Date(o.created_at).getTime() >= weekAgo);
    const weekSales = weekOrders.filter((o) => isPaid(o.status)).reduce((a, o) => a + Number(o.total || 0), 0);
    const monthSales = orders.filter((o) => isPaid(o.status)).reduce((a, o) => a + Number(o.total || 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;

    // 7-day daily chart
    const daily: { day: string; orders: number; sales: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = d.getTime() + 86400000;
      const list = orders.filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= d.getTime() && t < next;
      });
      daily.push({
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        orders: list.length,
        sales: list.filter((o) => isPaid(o.status)).reduce((a, o) => a + Number(o.total || 0), 0),
      });
    }

    // Incomplete: pending older than 24h OR has no order_items
    const itemsByOrder = new Set(orderItems.map((i) => i.order_id));
    const dayMs = 86400000;
    const incomplete = orders.filter((o) => {
      const age = now.getTime() - new Date(o.created_at).getTime();
      const noItems = !itemsByOrder.has(o.id);
      const stalePending = o.status === "pending" && age > dayMs;
      return noItems || stalePending;
    });

    return { todayOrders: todayOrders.length, todaySales, weekOrders: weekOrders.length, weekSales, monthSales, pending, daily, incomplete };
  }, [orders, orderItems]);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading analytics…</div>;

  const StatCard = ({ icon: Icon, label, value, sub, tone = "primary" }: any) => (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-soft hover:shadow-elegant transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tone === "destructive" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative">
          <div className="text-xs uppercase tracking-wider opacity-80">Overview</div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Daily Report & Analytics</h1>
          <p className="text-sm opacity-90 mt-1">Track today's sales, weekly trends and spot incomplete orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={stats.todayOrders} sub={`${stats.pending} pending`} />
        <StatCard icon={DollarSign} label="Today's Sales" value={`৳${stats.todaySales.toLocaleString()}`} sub="Confirmed+" />
        <StatCard icon={TrendingUp} label="7-Day Sales" value={`৳${stats.weekSales.toLocaleString()}`} sub={`${stats.weekOrders} orders`} />
        <StatCard icon={AlertTriangle} label="Incomplete" value={stats.incomplete.length} sub="Need attention" tone={stats.incomplete.length ? "destructive" : "primary"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Sales — Last 7 Days</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Orders — Last 7 Days</h3>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${stats.incomplete.length ? "text-destructive" : "text-muted-foreground"}`} />
            Incomplete Orders ({stats.incomplete.length})
          </h3>
          <Button size="sm" variant="outline" onClick={() => onNavigate("orders")}>View All Orders</Button>
        </div>
        {stats.incomplete.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">All clear — no incomplete orders 🎉</div>
        ) : (
          <div className="space-y-2">
            {stats.incomplete.slice(0, 10).map((o) => {
              const noItems = !orderItems.some((i) => i.order_id === o.id);
              const ageHrs = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 3600000);
              return (
                <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{o.customer_name} • {o.customer_phone}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <Clock className="h-3 w-3" />{ageHrs}h ago
                      <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive text-[10px] uppercase">
                        {noItems ? "No items" : "Stale pending"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold whitespace-nowrap">৳{Number(o.total || 0).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
        price: v.price === "" || v.price == null ? null : Number(v.price),
        image_url: v.image_url || null,
        price_delta: 0,
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
                  <Button size="sm" variant="outline" type="button" onClick={() => setVariants([...variants, { name_bn: "", name_en: "", price: "", image_url: "", stock: null, is_active: true }])}>
                    <Plus className="h-3 w-3 mr-1" />Add Variant
                  </Button>
                </div>
                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1 items-end bg-secondary/30 p-2 rounded-lg">
                      <div className="col-span-3"><Input placeholder="Name BN" value={v.name_bn} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, name_bn: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-3"><Input placeholder="Name EN" value={v.name_en} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, name_en: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-2"><Input type="number" placeholder="Price ৳" value={v.price ?? ""} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, price: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-3"><Input placeholder="Image URL" value={v.image_url ?? ""} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, image_url: e.target.value }; setVariants(c); }} /></div>
                      <div className="col-span-1"><Button size="icon" variant="ghost" type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                      <div className="col-span-3"><Input type="number" placeholder="Stock" value={v.stock ?? ""} onChange={(e) => { const c = [...variants]; c[idx] = { ...v, stock: e.target.value }; setVariants(c); }} /></div>
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  const statusTone: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    confirmed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    shipped: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    delivered: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    if (data && data.length) {
      const { data: oi } = await supabase.from("order_items").select("*").in("order_id", data.map((o) => o.id));
      const grouped: Record<string, any[]> = {};
      (oi || []).forEach((i: any) => { (grouped[i.order_id] ||= []).push(i); });
      setItems(grouped);
    } else { setItems({}); }
    setSelected(new Set());
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toTs = dateTo ? new Date(dateTo).getTime() + 86400000 : Infinity;
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      const t = new Date(o.created_at).getTime();
      if (t < fromTs || t >= toTs) return false;
      if (!q) return true;
      const its = items[o.id] || [];
      const hay = [
        o.id, o.id.slice(0, 8), o.customer_name, o.customer_phone, o.customer_email,
        ...its.map((i) => i.product_name), ...its.map((i) => i.product_id || ""),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [orders, items, search, statusFilter, dateFrom, dateTo]);

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

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((o) => o.id)));
  };
  const toggleOne = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const bulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return toast.error("Pick status & orders");
    const { error } = await supabase.from("orders").update({ status: bulkStatus }).in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    toast.success(`Updated ${selected.size} orders`); load();
  };
  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} orders?`)) return;
    await supabase.from("orders").delete().in("id", Array.from(selected));
    toast.success("Deleted"); load();
  };

  const exportExcel = () => {
    const rows = filtered.length ? filtered : orders;
    const data = rows.map((o) => {
      const its = (items[o.id] || []).map((i) => `${i.product_name} x${i.quantity}`).join(" | ");
      return {
        "Order No": o.id.slice(0, 8).toUpperCase(),
        "Date": new Date(o.created_at).toLocaleString(),
        "Customer": o.customer_name,
        "Phone": o.customer_phone,
        "Email": o.customer_email || "",
        "Address": o.customer_address || "",
        "Items": its,
        "Delivery": Number(o.delivery_charge) || 0,
        "Total": Number(o.total),
        "Status": o.status,
        "Notes": o.notes || "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 22 }, { wch: 28 }, { wch: 30 }, { wch: 9 }, { wch: 9 }, { wch: 11 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel exported");
  };

  const printInvoice = (o: any) => {
    const its = items[o.id] || [];
    const orderNo = o.id.slice(0, 8).toUpperCase();
    // Generate barcode SVG
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
      JsBarcode(svgEl, orderNo, { format: "CODE128", width: 1.6, height: 40, displayValue: false, margin: 0 });
    } catch {}
    const barcodeSvg = new XMLSerializer().serializeToString(svgEl);
    const brand = (window as any).__brandName || "Invoice";
    const itemsHtml = its.map((i: any) => `<tr><td>${i.product_name}<br/><span class="muted">x${i.quantity} @ ৳${Number(i.price)}</span></td><td class="r">৳${Number(i.price) * Number(i.quantity)}</td></tr>`).join("");
    const subtotal = its.reduce((s: number, i: any) => s + Number(i.price) * Number(i.quantity), 0);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${orderNo}</title>
<style>
  @page { size: 3in 4in; margin: 0; }
  * { box-sizing: border-box; }
  body { width: 3in; margin: 0; padding: 6px 8px; font-family: 'Courier New', monospace; font-size: 10px; color: #000; }
  h1 { font-size: 13px; margin: 0; text-align: center; letter-spacing: 0.5px; }
  .center { text-align: center; }
  .muted { color: #555; font-size: 9px; }
  hr { border: none; border-top: 1px dashed #000; margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  td { padding: 2px 0; vertical-align: top; }
  .r { text-align: right; white-space: nowrap; }
  .row { display: flex; justify-content: space-between; font-size: 10px; }
  .total { font-weight: bold; font-size: 12px; }
  .barcode svg { width: 100%; height: 40px; }
  @media print { body { padding: 4px; } }
</style></head><body>
  <h1>${brand}</h1>
  <div class="center muted">Invoice / Receipt</div>
  <hr/>
  <div class="row"><span>Order:</span><span><b>#${orderNo}</b></span></div>
  <div class="row"><span>Date:</span><span>${new Date(o.created_at).toLocaleString()}</span></div>
  <div class="row"><span>Status:</span><span>${o.status}</span></div>
  <hr/>
  <div><b>${o.customer_name}</b></div>
  <div class="muted">${o.customer_phone}</div>
  ${o.customer_address ? `<div class="muted">${o.customer_address}</div>` : ""}
  <hr/>
  <table>${itemsHtml}</table>
  <hr/>
  <div class="row"><span>Subtotal</span><span>৳${subtotal}</span></div>
  ${Number(o.delivery_charge) > 0 ? `<div class="row"><span>Delivery</span><span>৳${Number(o.delivery_charge)}</span></div>` : ""}
  <div class="row total"><span>TOTAL</span><span>৳${Number(o.total)}</span></div>
  <hr/>
  <div class="barcode center">${barcodeSvg}</div>
  <div class="center muted">${orderNo}</div>
  <hr/>
  <div class="center muted">Thank you!</div>
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300);}</script>
</body></html>`;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return toast.error("Popup blocked");
    w.document.write(html);
    w.document.close();
  };


  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUSES.forEach((s) => c[s] = orders.filter((o) => o.status === s).length);
    return c;
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Orders ({filtered.length}<span className="text-sm text-muted-foreground font-normal">/{orders.length}</span>)</h2>
        <Button size="sm" variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" />Export Excel</Button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...STATUSES]).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50"}`}>
            {s} <span className="opacity-70">({statusCounts[s] || 0})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <Input placeholder="Search order no, phone, SKU, product..." value={search} onChange={(e) => setSearch(e.target.value)} className="lg:col-span-2" />
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="sticky top-14 z-30 bg-primary/10 border border-primary/30 backdrop-blur-xl rounded-xl p-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Set status..." /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" onClick={bulkUpdate}>Apply</Button>
          <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
          <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={bulkDelete}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      )}

      {/* Select all */}
      {filtered.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground px-1 cursor-pointer">
          <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="h-4 w-4 accent-primary" />
          Select all ({filtered.length})
        </label>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No orders match filters.</div>
      )}

      {filtered.map((o) => {
        const isSel = selected.has(o.id);
        return (
          <div key={o.id} className={`bg-card border rounded-lg p-4 space-y-2 transition-all ${isSel ? "border-primary shadow-glow" : "border-border"}`}>
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <input type="checkbox" checked={isSel} onChange={() => toggleOne(o.id)} className="h-4 w-4 mt-1 accent-primary shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${statusTone[o.status] || "bg-muted"}`}>{o.status}</span>
                  </div>
                  <div className="font-semibold mt-1">{o.customer_name} • {o.customer_phone}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  {o.customer_email && <div className="text-xs">{o.customer_email}</div>}
                  {o.customer_address && <div className="text-xs text-muted-foreground">{o.customer_address}</div>}
                  {o.notes && <div className="text-xs italic">"{o.notes}"</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                  <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
        );
      })}
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
