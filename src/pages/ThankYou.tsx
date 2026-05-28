import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Home, MessageCircle, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

type OrderRow = {
  id: string;
  order_number: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  notes: string | null;
  total: number;
  delivery_charge: number;
  delivery_location: string | null;
  status: string;
  created_at: string;
};
type ItemRow = { product_name: string; price: number; quantity: number; product_id?: string | null; download_url?: string | null; is_digital?: boolean };

// Read --primary HSL from CSS and return [r,g,b]
function primaryRgb(): [number, number, number] {
  if (typeof window === "undefined") return [99, 102, 241];
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  const m = raw.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return [99, 102, 241];
  const h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100;
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

async function loadImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

// Bengali detection
const BN_RE = /[\u0980-\u09FF]/;
const hasBengali = (s: string) => !!s && BN_RE.test(s);

// Load Noto Sans Bengali as a real web font so the browser shapes conjuncts correctly.
let bengaliFontLoaded: Promise<boolean> | null = null;
function ensureBengaliWebFont(): Promise<boolean> {
  if (bengaliFontLoaded) return bengaliFontLoaded;
  bengaliFontLoaded = (async () => {
    try {
      const base = "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali@5.0.13/files";
      const reg = new FontFace("NotoBengaliWeb", `url(${base}/noto-sans-bengali-bengali-400-normal.woff2) format("woff2")`, { weight: "400" });
      const bold = new FontFace("NotoBengaliWeb", `url(${base}/noto-sans-bengali-bengali-700-normal.woff2) format("woff2")`, { weight: "700" });
      await Promise.all([reg.load(), bold.load()]);
      (document as any).fonts.add(reg);
      (document as any).fonts.add(bold);
      return true;
    } catch { return false; }
  })();
  return bengaliFontLoaded;
}

// Render text into a PNG dataURL via canvas — the browser does proper Bengali script shaping.
function renderTextImage(text: string, opts: { fontPt: number; bold?: boolean; color?: string }): { dataUrl: string; wMm: number; hMm: number } {
  const scale = 4; // px per pt for crisp output
  const fontPx = opts.fontPt * scale;
  const weight = opts.bold ? 700 : 400;
  const family = `"NotoBengaliWeb","Noto Sans Bengali","Hind Siliguri","Helvetica","Arial",sans-serif`;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `${weight} ${fontPx}px ${family}`;
  const w = Math.max(1, Math.ceil(measure.measureText(text).width)) + 6;
  const h = Math.ceil(fontPx * 1.4);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${weight} ${fontPx}px ${family}`;
  ctx.fillStyle = opts.color || "#000000";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 2, fontPx);
  const ptToMm = 0.3528;
  return { dataUrl: canvas.toDataURL("image/png"), wMm: (w / scale) * ptToMm, hMm: (h / scale) * ptToMm };
}

// Unified text drawer — native for ASCII, image for Bengali.
function drawText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  opts: { sizePt: number; bold?: boolean; color?: [number, number, number]; align?: "left" | "right" | "center"; maxWidthMm?: number }
) {
  if (!text) return;
  const [r, g, b] = opts.color || [0, 0, 0];
  if (!hasBengali(text)) {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.sizePt);
    doc.setTextColor(r, g, b);
    doc.text(text, x, y, { align: opts.align || "left" });
    return;
  }
  const img = renderTextImage(text, { fontPt: opts.sizePt, bold: opts.bold, color: `rgb(${r},${g},${b})` });
  let w = img.wMm, h = img.hMm;
  if (opts.maxWidthMm && w > opts.maxWidthMm) { const k = opts.maxWidthMm / w; w *= k; h *= k; }
  let drawX = x;
  if (opts.align === "right") drawX = x - w;
  else if (opts.align === "center") drawX = x - w / 2;
  doc.addImage(img.dataUrl, "PNG", drawX, y - h * 0.82, w, h);
}

export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const orderId = searchParams.get("order_id");
  const settings = useSiteSettings();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 1);
    if (!orderId) return;
    (async () => {
      // Try direct read first (works for admins / order owners), then fall back
      // to a public edge function so guest checkouts can still load their invoice.
      const { data: o } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (o) {
        setOrder(o as OrderRow);
        const { data: it } = await supabase.from("order_items").select("product_name,price,quantity,product_id").eq("order_id", orderId);
        if (it) {
          const ids = Array.from(new Set(it.map((i: any) => i.product_id).filter(Boolean)));
          let pmap: Record<string, { download_url: string | null; category: string }> = {};
          if (ids.length) {
            const { data: prods } = await supabase.from("products").select("id,download_url,category").in("id", ids);
            pmap = Object.fromEntries((prods || []).map((p: any) => [p.id, { download_url: p.download_url, category: p.category }]));
          }
          setItems(it.map((i: any) => ({
            ...i,
            download_url: i.product_id ? pmap[i.product_id]?.download_url || null : null,
            is_digital: i.product_id ? pmap[i.product_id]?.category === "digital" : false,
          })) as ItemRow[]);
        }
        return;
      }
      const { data, error } = await supabase.functions.invoke("get-order", { body: { order_id: orderId } });
      if (!error && data?.order) {
        setOrder(data.order as OrderRow);
        setItems((data.items || []) as ItemRow[]);
      }
    })();
  }, [orderId]);

  const orderNo = order?.order_number || (orderId ? orderId.slice(0, 8).toUpperCase() : "");

  const downloadInvoice = async () => {
    if (!order) { toast.error(bn ? "অর্ডার লোড হচ্ছে..." : "Order is loading..."); return; }
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const [pr, pg, pb] = primaryRgb();
      const brand = settings.brand_name || "ECOMSTATION";
      const bnFooter = bn ? "ধন্যবাদ আপনার অর্ডারের জন্য!" : "Thank you for your order!";

      // Preload Bengali web font so canvas shaping is ready before rendering.
      await ensureBengaliWebFont();

      // ====== GRADIENT HEADER BAND ======
      const headerH = 44;
      // Vertical gradient: primary at top -> ~25% lighter at bottom.
      const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.28));
      const [pr2, pg2, pb2] = [lighten(pr), lighten(pg), lighten(pb)];
      const strips = 60;
      for (let i = 0; i < strips; i++) {
        const t = i / (strips - 1);
        const r = Math.round(pr + (pr2 - pr) * t);
        const g = Math.round(pg + (pg2 - pg) * t);
        const b = Math.round(pb + (pb2 - pb) * t);
        doc.setFillColor(r, g, b);
        doc.rect(0, (headerH / strips) * i, W, headerH / strips + 0.3, "F");
      }
      // subtle bottom highlight stripe
      doc.setGState(new (doc as any).GState({ opacity: 0.25 }));
      doc.setFillColor(255, 255, 255);
      doc.rect(0, headerH, W, 1.5, "F");
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      // ====== HEADER CONTENT — ALL LEFT-ALIGNED ======
      let hx = 14;
      if (settings.logo_url) {
        const dataUrl = await loadImageAsDataURL(settings.logo_url);
        if (dataUrl) {
          try {
            const fmt = dataUrl.includes("image/png") ? "PNG" : dataUrl.includes("image/webp") ? "WEBP" : "JPEG";
            doc.addImage(dataUrl, fmt, 14, 11, 22, 22, undefined, "FAST");
            hx = 40;
          } catch { /* ignore */ }
        }
      }

      drawText(doc, brand, hx, 21, { sizePt: 22, bold: true, color: [255, 255, 255] });
      drawText(doc, settings.contact_address || "", hx, 28, { sizePt: 9, color: [255, 255, 255] });
      drawText(doc, `${settings.contact_phone || ""}  •  ${settings.contact_email || ""}`, hx, 34, { sizePt: 9, color: [255, 255, 255] });

      // INVOICE label (right side, stays as identifier)
      drawText(doc, "INVOICE", W - 14, 22, { sizePt: 26, bold: true, color: [255, 255, 255], align: "right" });
      drawText(doc, `#${orderNo}`, W - 14, 30, { sizePt: 10, color: [255, 255, 255], align: "right" });
      drawText(doc, new Date(order.created_at).toLocaleString(), W - 14, 36, { sizePt: 9, color: [255, 255, 255], align: "right" });

      // ====== BILL TO / META CARDS ======
      let y = 58;
      const cardH = 34;
      const half = (W - 14 * 2 - 6) / 2;

      doc.setFillColor(245, 247, 252);
      doc.roundedRect(14, y, half, cardH, 3, 3, "F");
      drawText(doc, "BILL TO", 18, y + 6, { sizePt: 9, bold: true, color: [pr, pg, pb] });
      drawText(doc, order.customer_name, 18, y + 13, { sizePt: 11, bold: true, color: [30, 30, 30], maxWidthMm: half - 8 });
      drawText(doc, order.customer_phone, 18, y + 19, { sizePt: 9, color: [30, 30, 30] });
      if (order.customer_email) drawText(doc, order.customer_email, 18, y + 24, { sizePt: 9, color: [30, 30, 30] });
      if (order.customer_address) drawText(doc, order.customer_address, 18, y + 30, { sizePt: 9, color: [30, 30, 30], maxWidthMm: half - 8 });

      const mx = 14 + half + 6;
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(mx, y, half, cardH, 3, 3, "F");
      drawText(doc, "ORDER DETAILS", mx + 4, y + 6, { sizePt: 9, bold: true, color: [pr, pg, pb] });
      const metaRows: [string, string][] = [
        ["Invoice No", `#${orderNo}`],
        ["Date", new Date(order.created_at).toLocaleDateString()],
        ["Status", order.status.toUpperCase()],
        ["Delivery", order.delivery_location ? (order.delivery_location === "inside" ? "Inside Dhaka" : "Outside Dhaka") : "—"],
      ];
      metaRows.forEach((r, i) => {
        drawText(doc, r[0], mx + 4, y + 13 + i * 5, { sizePt: 9, color: [110, 110, 120] });
        drawText(doc, r[1], mx + half - 4, y + 13 + i * 5, { sizePt: 9, bold: true, color: [30, 30, 30], align: "right" });
      });

      // ====== ITEMS TABLE ======
      // For Bengali product names, hide native text and draw image in didDrawCell.
      const rows = items.map((it, i) => [
        String(i + 1),
        it.product_name,
        String(it.quantity),
        `BDT ${Number(it.price).toLocaleString()}`,
        `BDT ${(Number(it.price) * it.quantity).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: y + cardH + 8,
        head: [["#", "Item", "Qty", "Price", "Total"]],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [pr, pg, pb], textColor: 255, fontStyle: "bold", halign: "left" },
        bodyStyles: { textColor: [40, 40, 50], fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 255] },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          2: { cellWidth: 18, halign: "center" },
          3: { cellWidth: 32, halign: "right" },
          4: { cellWidth: 34, halign: "right", fontStyle: "bold" },
        },
        styles: { cellPadding: 3, lineColor: [230, 232, 240] },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const txt = String(data.cell.raw || "");
            if (hasBengali(txt)) data.cell.text = [""];
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const txt = items[data.row.index]?.product_name || "";
            if (hasBengali(txt)) {
              const img = renderTextImage(txt, { fontPt: 10, color: "rgb(40,40,50)" });
              const maxW = data.cell.width - 4;
              let w = img.wMm, h = img.hMm;
              if (w > maxW) { const k = maxW / w; w *= k; h *= k; }
              doc.addImage(img.dataUrl, "PNG", data.cell.x + 2, data.cell.y + (data.cell.height - h) / 2, w, h);
            }
          }
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 8;

      // ====== TOTALS ======
      const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
      const totalsX = W - 14 - 80;
      doc.setFillColor(248, 250, 255);
      doc.roundedRect(totalsX, finalY, 80, 32, 3, 3, "F");

      drawText(doc, "Subtotal", totalsX + 4, finalY + 8, { sizePt: 10, color: [90, 90, 100] });
      drawText(doc, "Delivery", totalsX + 4, finalY + 15, { sizePt: 10, color: [90, 90, 100] });
      drawText(doc, `BDT ${subtotal.toLocaleString()}`, totalsX + 76, finalY + 8, { sizePt: 10, color: [30, 30, 30], align: "right" });
      drawText(doc, `BDT ${Number(order.delivery_charge || 0).toLocaleString()}`, totalsX + 76, finalY + 15, { sizePt: 10, color: [30, 30, 30], align: "right" });

      doc.setFillColor(pr, pg, pb);
      doc.roundedRect(totalsX, finalY + 20, 80, 12, 2, 2, "F");
      drawText(doc, "TOTAL", totalsX + 4, finalY + 28, { sizePt: 12, bold: true, color: [255, 255, 255] });
      drawText(doc, `BDT ${Number(order.total).toLocaleString()}`, totalsX + 76, finalY + 28, { sizePt: 12, bold: true, color: [255, 255, 255], align: "right" });

      // Notes
      if (order.notes) {
        drawText(doc, "Notes", 14, finalY + 8, { sizePt: 9, bold: true, color: [90, 90, 100] });
        // wrap manually if Bengali, else use jsPDF wrap
        if (hasBengali(order.notes)) {
          drawText(doc, order.notes, 14, finalY + 14, { sizePt: 9, color: [60, 60, 70], maxWidthMm: totalsX - 14 - 6 });
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 70);
          const lines = doc.splitTextToSize(order.notes, totalsX - 14 - 6);
          doc.text(lines, 14, finalY + 14);
        }
      }

      // ====== FOOTER (only thank-you, no phone/email) ======
      doc.setFillColor(pr, pg, pb);
      doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
      doc.rect(0, H - 18, W, 18, "F");
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
      drawText(doc, bnFooter, W / 2, H - 7, { sizePt: 11, bold: true, color: [pr, pg, pb], align: "center" });

      doc.save(`Invoice-${orderNo}.pdf`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate invoice");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 md:pt-32 pb-16">
        <div className="w-full max-w-lg text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            {bn ? "অর্ডার সফল হয়েছে!" : "Order Placed Successfully!"}
          </h1>

          <p className="text-muted-foreground text-base md:text-lg">
            {bn
              ? "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।"
              : "Your order has been received. Our team will contact you shortly."}
          </p>

          {orderId && (
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-muted rounded-full px-5 py-2.5 text-sm font-medium text-foreground mx-auto">
                <span className="text-muted-foreground">{bn ? "ইনভয়েস নম্বর:" : "Invoice No:"}</span>
                <span className="font-mono">{orderNo}</span>
              </div>
              <Button variant="hero" size="lg" onClick={downloadInvoice} disabled={downloading || !order} className="gap-2">
                <Download className="w-4 h-4" />
                {downloading ? (bn ? "তৈরি হচ্ছে..." : "Generating...") : (bn ? "ইনভয়েস PDF ডাউনলোড করুন" : "Download Invoice PDF")}
              </Button>
            </div>
          )}

          {items.some((i) => i.is_digital && i.download_url) && (
            <div className="text-left bg-primary/5 border border-primary/30 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                {bn ? "আপনার ডিজিটাল ফাইল ডাউনলোড" : "Your Digital Downloads"}
              </div>
              <div className="space-y-1.5">
                {items.filter((i) => i.is_digital && i.download_url).map((i, idx) => (
                  <a key={idx} href={i.download_url!} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 bg-background border border-border rounded-md px-3 py-2 text-sm hover:border-primary transition-colors">
                    <span className="truncate">{i.product_name}</span>
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-medium shrink-0">
                      <Download className="w-3.5 h-3.5" /> {bn ? "ডাউনলোড" : "Download"}
                    </span>
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {bn ? "এই লিংকগুলো সেভ করে রাখুন। ইনভয়েস নম্বর দিয়ে আবার এই পেজে ফিরে আসতে পারবেন।" : "Save these links. You can revisit this page with your invoice number anytime."}
              </p>
            </div>
          )}


          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/")} className="gap-2">
              <Home className="w-4 h-4" />
              {bn ? "হোম পেজ" : "Back to Home"}
            </Button>
            <Button variant="outline-glow" size="lg" onClick={() => navigate("/#shop")} className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              {bn ? "আরও শপিং" : "Continue Shopping"}
            </Button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              {bn ? "কোনো প্রশ্ন থাকলে সরাসরি জিজ্ঞাসা করুন" : "Have questions? Reach out directly"}
            </p>
            <a
              href={`https://wa.me/${settings.contact_whatsapp || "8801234567890"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {bn ? "হোয়াটসঅ্যাপে কথা বলুন" : "Chat on WhatsApp"}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
