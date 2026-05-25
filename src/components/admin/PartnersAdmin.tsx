import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  link_url: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
};

const empty: Partial<Partner> = {
  name: "",
  logo_url: "",
  link_url: "",
  color: "#6366F1",
  sort_order: 0,
  is_active: true,
};

export function PartnersAdmin() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Partner>>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_partners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as Partner[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name?.trim()) { toast.error("Name is required"); return; }
    const payload = {
      name: editing.name!.trim(),
      logo_url: editing.logo_url?.trim() || null,
      link_url: editing.link_url?.trim() || null,
      color: editing.color?.trim() || null,
      sort_order: Number(editing.sort_order) || 0,
      is_active: editing.is_active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("service_partners").update(payload).eq("id", editing.id)
      : await supabase.from("service_partners").insert([payload]);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false);
    setEditing(empty);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this partner?")) return;
    const { error } = await supabase.from("service_partners").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const toggleActive = async (it: Partner) => {
    const { error } = await supabase.from("service_partners").update({ is_active: !it.is_active }).eq("id", it.id);
    if (error) { toast.error(error.message); return; }
    setItems((p) => p.map((x) => x.id === it.id ? { ...x, is_active: !x.is_active } : x));
  };

  const move = async (it: Partner, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === it.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("service_partners").update({ sort_order: swap.sort_order }).eq("id", it.id),
      supabase.from("service_partners").update({ sort_order: it.sort_order }).eq("id", swap.id),
    ]);
    load();
  };

  const openNew = () => {
    const maxSort = items.reduce((m, x) => Math.max(m, x.sort_order), 0);
    setEditing({ ...empty, sort_order: maxSort + 1 });
    setOpen(true);
  };

  const openEdit = (it: Partner) => {
    setEditing(it);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">Service Partners</h2>
          <p className="text-xs text-muted-foreground">Manage the "Our Service Partner" logo slider on the homepage.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Add Partner</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing.id ? "Edit Partner" : "New Partner"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="WordPress" />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={editing.logo_url || ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} placeholder="https://cdn.simpleicons.org/wordpress/21759B" />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tip: use{" "}
                  <a href="https://simpleicons.org" target="_blank" rel="noreferrer" className="underline">simpleicons.org</a>
                  {" "}URLs like <code>https://cdn.simpleicons.org/SLUG/HEXCOLOR</code>
                </p>
                {editing.logo_url && (
                  <div className="mt-2 p-3 rounded-lg border bg-muted/30 flex items-center gap-2">
                    <img src={editing.logo_url} alt="preview" className="h-7 w-auto object-contain" />
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                )}
              </div>
              <div>
                <Label>Link URL (optional)</Label>
                <Input value={editing.link_url || ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="https://wordpress.org" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Brand Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input type="color" value={editing.color || "#6366F1"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="w-14 p-1 h-10" />
                    <Input value={editing.color || ""} onChange={(e) => setEditing({ ...editing, color: e.target.value })} placeholder="#21759B" />
                  </div>
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <Label>Active (visible on site)</Label>
              </div>
              <Button onClick={save} variant="hero" className="w-full">Save Partner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-card border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
          No partners yet. Click "Add Partner" to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={it.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-soft">
              <div className="flex flex-col gap-0.5">
                <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => move(it, -1)}><ArrowUp className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === items.length - 1} onClick={() => move(it, 1)}><ArrowDown className="h-3 w-3" /></Button>
              </div>
              <div className="h-10 w-14 rounded-md bg-muted/50 border flex items-center justify-center shrink-0 overflow-hidden">
                {it.logo_url ? (
                  <img src={it.logo_url} alt={it.name} className="h-6 w-auto object-contain" />
                ) : (
                  <span className="w-3 h-3 rounded-full" style={{ background: it.color || "#888" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate flex items-center gap-1">
                  {it.name}
                  {it.link_url && <a href={it.link_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 text-muted-foreground" /></a>}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">Order: {it.sort_order} • {it.color || "no color"}</div>
              </div>
              <Switch checked={it.is_active} onCheckedChange={() => toggleActive(it)} />
              <Button size="icon" variant="ghost" onClick={() => openEdit(it)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
