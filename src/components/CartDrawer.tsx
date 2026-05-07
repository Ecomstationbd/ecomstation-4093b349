import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const orderSchema = z.object({
  customer_name: z.string().trim().min(1).max(200),
  customer_phone: z.string().trim().min(5).max(30),
  customer_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  customer_address: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total, clear } = useCart();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", customer_address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (items.length === 0) { toast.error(bn ? "কার্ট খালি" : "Cart is empty"); return; }
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(bn ? "সঠিক তথ্য দিন" : "Please fill valid details");
      return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase.from("orders").insert({
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      customer_email: parsed.data.customer_email || null,
      customer_address: parsed.data.customer_address || null,
      notes: parsed.data.notes || null,
      total,
    }).select().single();
    if (error || !order) { toast.error(error?.message || "Error"); setSubmitting(false); return; }

    const lineItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));
    const { error: e2 } = await supabase.from("order_items").insert(lineItems);
    if (e2) { toast.error(e2.message); setSubmitting(false); return; }

    toast.success(bn ? "অর্ডার সফল হয়েছে!" : "Order placed!");
    clear();
    setForm({ customer_name: "", customer_phone: "", customer_email: "", customer_address: "", notes: "" });
    setOpen(false);
    setSubmitting(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{bn ? "আপনার কার্ট" : "Your Cart"}</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-3">
          {items.length === 0 && <p className="text-muted-foreground text-sm">{bn ? "কার্ট খালি" : "Cart is empty"}</p>}
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-2 border border-border rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{i.name}</div>
                <div className="text-xs text-muted-foreground">৳{i.price}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(i.id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center text-sm">{i.quantity}</span>
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(i.id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
              <span>{bn ? "মোট" : "Total"}</span>
              <span className="gradient-text">৳{total.toLocaleString()}</span>
            </div>
            <div className="space-y-3 pt-4">
              <div>
                <Label>{bn ? "নাম *" : "Name *"}</Label>
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} maxLength={200} />
              </div>
              <div>
                <Label>{bn ? "ফোন *" : "Phone *"}</Label>
                <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} maxLength={30} />
              </div>
              <div>
                <Label>{bn ? "ইমেইল" : "Email"}</Label>
                <Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} maxLength={255} />
              </div>
              <div>
                <Label>{bn ? "ঠিকানা" : "Address"}</Label>
                <Textarea value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} maxLength={1000} />
              </div>
              <div>
                <Label>{bn ? "নোট" : "Notes"}</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={2000} />
              </div>
              <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={submitting}>
                {submitting ? "..." : bn ? "অর্ডার কনফার্ম করুন" : "Confirm Order"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
