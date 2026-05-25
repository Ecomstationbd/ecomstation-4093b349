import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package2, X } from "lucide-react";

type Combo = {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  description_bn: string | null;
  description_en: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
};

type ComboItem = { id?: string; product_id: string; quantity: number };
type Product = { id: string; name_en: string; name_bn: string; price: number; image_url: string | null };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const empty = (): Combo => ({
  id: "", slug: "", name_bn: "", name_en: "", description_bn: "", description_en: "",
  price: 0, old_price: null, image_url: "", badge: "", is_active: true, sort_order: 0,
});

export function CombosAdmin() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Combo | null>(null);
  const [items, setItems] = useState<ComboItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("combos").select("*").order("sort_order"),
      supabase.from("products").select("id,name_en,name_bn,price,image_url").eq("is_active", true).order("name_en"),
    ]);
    setCombos((c as Combo[]) || []);
    setProducts((p as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(empty()); setItems([]); setOpen(true); };
  const openEdit = async (c: Combo) => {
    setEditing(c);
    const { data } = await supabase.from("combo_items").select("*").eq("combo_id", c.id).order("sort_order");
    setItems(((data as any[]) || []).map((d) => ({ id: d.id, product_id: d.product_id, quantity: d.quantity })));
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name_en || !editing.name_bn || !editing.slug || !editing.price) {
      toast.error("নাম, slug ও price দিন");
      return;
    }
    if (items.length === 0) { toast.error("অন্তত একটি product যোগ করুন"); return; }

    const payload = {
      slug: editing.slug, name_bn: editing.name_bn, name_en: editing.name_en,
      description_bn: editing.description_bn || null, description_en: editing.description_en || null,
      price: Number(editing.price), old_price: editing.old_price ? Number(editing.old_price) : null,
      image_url: editing.image_url || null, badge: editing.badge || null,
      is_active: editing.is_active, sort_order: Number(editing.sort_order) || 0,
    };

    let comboId = editing.id;
    if (comboId) {
      const { error } = await supabase.from("combos").update(payload).eq("id", comboId);
      if (error) { toast.error(error.message); return; }
      await supabase.from("combo_items").delete().eq("combo_id", comboId);
    } else {
      const { data, error } = await supabase.from("combos").insert(payload).select().single();
      if (error) { toast.error(error.message); return; }
      comboId = data.id;
    }

    const rows = items.map((it, idx) => ({
      combo_id: comboId, product_id: it.product_id, quantity: it.quantity, sort_order: idx,
    }));
    const { error: ie } = await supabase.from("combo_items").insert(rows);
    if (ie) { toast.error(ie.message); return; }

    toast.success("Combo saved");
    setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this combo?")) return;
    const { error } = await supabase.from("combos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); load();
  };

  const addItem = () => {
    if (products.length === 0) return;
    setItems([...items, { product_id: products[0].id, quantity: 1 }]);
  };

  const itemsTotal = items.reduce((s, it) => {
    const p = products.find((x) => x.id === it.product_id);
    return s + (p ? Number(p.price) * it.quantity : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">Combo Packages</h2>
          <p className="text-sm text-muted-foreground">প্রোডাক্ট bundle করে combo হিসেবে বিক্রি করুন</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New Combo</Button>
      </div>

      {loading ? <div>Loading…</div> : combos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">কোনো combo নেই</div>
      ) : (
        <div className="grid gap-3">
          {combos.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <div className="h-14 w-14 rounded-md bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                {c.image_url ? <img src={c.image_url} alt={c.name_en} className="h-full w-full object-cover" /> : <Package2 className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold truncate">{c.name_en}</div>
                  {c.is_active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                  {c.badge && <Badge>{c.badge}</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  /{c.slug} · ৳{Number(c.price).toLocaleString()}
                  {c.old_price && <span className="line-through ml-1">৳{Number(c.old_price).toLocaleString()}</span>}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Combo" : "New Combo"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name (EN)</Label><Input value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></div>
                <div><Label>Name (BN)</Label><Input value={editing.name_bn} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} /></div>
              </div>
              <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Description (EN)</Label><Textarea rows={2} value={editing.description_en || ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></div>
                <div><Label>Description (BN)</Label><Textarea rows={2} value={editing.description_bn || ""} onChange={(e) => setEditing({ ...editing, description_bn: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Price (৳)</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div><Label>Old Price</Label><Input type="number" value={editing.old_price || ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>Sort</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Image URL</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
                <div><Label>Badge (e.g. "Best Deal")</Label><Input value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>Active</Label></div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base">Products in this Combo</Label>
                  <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Product</Button>
                </div>
                {items.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4 border rounded">কোনো product যোগ করা হয়নি</div>
                ) : (
                  <div className="space-y-2">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select className="flex-1 h-9 px-2 rounded-md border bg-background text-sm"
                          value={it.product_id}
                          onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, product_id: e.target.value } : x))}>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name_en} (৳{p.price})</option>
                          ))}
                        </select>
                        <Input type="number" min={1} className="w-20" value={it.quantity}
                          onChange={(e) => setItems(items.map((x, i) => i === idx ? { ...x, quantity: Math.max(1, Number(e.target.value)) } : x))} />
                        <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, i) => i !== idx))}><X className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground text-right">
                      Items total: ৳{itemsTotal.toLocaleString()}
                      {editing.price > 0 && itemsTotal > editing.price && (
                        <span className="ml-2 text-primary font-semibold">Save ৳{(itemsTotal - editing.price).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>Save Combo</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
