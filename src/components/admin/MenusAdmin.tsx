import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

type MenuItem = {
  id: string;
  label_en: string;
  label_bn: string;
  href: string;
  sort_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
};

const empty: Omit<MenuItem, "id"> = {
  label_en: "",
  label_bn: "",
  href: "",
  sort_order: 0,
  is_active: true,
  open_in_new_tab: false,
};

export function MenusAdmin() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Omit<MenuItem, "id">>(empty);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) { toast.error(error.message); return; }
    setItems((data || []) as MenuItem[]);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, sort_order: (items[items.length - 1]?.sort_order ?? 0) + 1 });
    setOpen(true);
  };

  const openEdit = (it: MenuItem) => {
    setEditing(it);
    const { id, ...rest } = it;
    setForm(rest);
    setOpen(true);
  };

  const save = async () => {
    if (!form.label_en.trim() || !form.label_bn.trim() || !form.href.trim()) {
      toast.error("Label এবং Link দিতে হবে"); return;
    }
    setLoading(true);
    const payload = { ...form };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const move = async (it: MenuItem, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === it.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await supabase.from("menu_items").update({ sort_order: swap.sort_order }).eq("id", it.id);
    await supabase.from("menu_items").update({ sort_order: it.sort_order }).eq("id", swap.id);
    load();
  };

  const toggleActive = async (it: MenuItem) => {
    await supabase.from("menu_items").update({ is_active: !it.is_active }).eq("id", it.id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Header Menu</h2>
          <p className="text-sm text-muted-foreground">Header navigation links manage করুন</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Add Menu Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "New"} Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Label (EN)</Label>
                  <Input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} />
                </div>
                <div>
                  <Label>Label (বাংলা)</Label>
                  <Input value={form.label_bn} onChange={(e) => setForm({ ...form, label_bn: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Link / URL</Label>
                <Input
                  placeholder="/blog  বা  /#shop  বা  https://..."
                  value={form.href}
                  onChange={(e) => setForm({ ...form, href: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Internal: <code>/blog</code>, anchor: <code>/#shop</code>, external: <code>https://...</code>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
                <label className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={form.open_in_new_tab} onCheckedChange={(v) => setForm({ ...form, open_in_new_tab: v })} />
                  <span className="text-sm">New tab</span>
                </label>
              </div>
              <Button onClick={save} disabled={loading} className="w-full">{loading ? "Saving..." : "Save"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border/60 divide-y">
        {items.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">এখনো কোন menu item নেই</div>
        )}
        {items.map((it, idx) => (
          <div key={it.id} className="p-3 flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(it, -1)} disabled={idx === 0}>
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(it, 1)} disabled={idx === items.length - 1}>
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{it.label_en} <span className="text-muted-foreground">/ {it.label_bn}</span></div>
              <div className="text-xs text-muted-foreground truncate">{it.href} {it.open_in_new_tab && "↗"}</div>
            </div>
            <Switch checked={it.is_active} onCheckedChange={() => toggleActive(it)} />
            <Button size="icon" variant="ghost" onClick={() => openEdit(it)}><Edit className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
