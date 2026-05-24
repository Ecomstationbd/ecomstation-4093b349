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
type ItemRow = { product_name: string; price: number; quantity: number };

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

// Bengali detection + font registration (Noto Sans Bengali via Google Fonts)
const BN_RE = /[\u0980-\u09FF]/;
const hasBengali = (s: string) => !!s && BN_RE.test(s);
let bengaliFontB64: string | null | undefined;
async function ensureBengaliFont(doc: jsPDF): Promise<boolean> {
  if (bengaliFontB64 === null) return false;
  if (bengaliFontB64 === undefined) {
    try {
      // Direct TTF from jsdelivr (Noto Sans Bengali Regular)
      const url = "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali@5.0.13/files/noto-sans-bengali-bengali-400-normal.woff";
      // jsPDF needs TTF, so use a TTF mirror instead:
      const ttfUrl = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf";
      const res = await fetch(ttfUrl);
      if (!res.ok) throw new Error("font fetch failed");
      const buf = new Uint8Array(await res.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
      bengaliFontB64 = btoa(bin);
    } catch {
      bengaliFontB64 = null;
      return false;
    }
  }
  try {
    (doc as any).addFileToVFS("NotoSansBengali.ttf", bengaliFontB64);
    (doc as any).addFont("NotoSansBengali.ttf", "NotoBengali", "normal");
    (doc as any).addFont("NotoSansBengali.ttf", "NotoBengali", "bold");
    return true;
  } catch { return false; }
}
function pickFont(doc: jsPDF, text: string, style: "normal" | "bold" = "normal") {
  if (hasBengali(text)) {
    try { doc.setFont("NotoBengali", style); return; } catch { /* fall through */ }
  }
  doc.setFont("helvetica", style);
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
      const { data: o } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (o) setOrder(o as OrderRow);
      const { data: it } = await supabase.from("order_items").select("product_name,price,quantity").eq("order_id", orderId);
      if (it) setItems(it as ItemRow[]);
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

      // Register Bengali font for any non-ASCII text in the invoice
      const bnFooter = bn ? "ধন্যবাদ আপনার অর্ডারের জন্য!" : "Thank you for your order!";
      const needsBengali = [
        brand, settings.contact_address, order.customer_name, order.customer_address,
        order.notes || "", bnFooter, ...items.map(i => i.product_name),
      ].some(t => hasBengali(t || ""));
      const bnReady = needsBengali ? await ensureBengaliFont(doc) : false;
      const setF = (text: string, style: "normal" | "bold" = "normal") => {
        if (bnReady && hasBengali(text)) doc.setFont("NotoBengali", style);
        else doc.setFont("helvetica", style);
      };

      // ====== HEADER BAND ======
      doc.setFillColor(pr, pg, pb);
      doc.rect(0, 0, W, 42, "F");
      // soft accent stripe
      doc.setFillColor(pr, pg, pb);
      doc.setGState(new (doc as any).GState({ opacity: 0.35 }));
      doc.rect(0, 42, W, 4, "F");
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      // Logo
      if (settings.logo_url) {
        const dataUrl = await loadImageAsDataURL(settings.logo_url);
        if (dataUrl) {
          try {
            const fmt = dataUrl.includes("image/png") ? "PNG" : dataUrl.includes("image/webp") ? "WEBP" : "JPEG";
            doc.addImage(dataUrl, fmt, 14, 10, 22, 22, undefined, "FAST");
          } catch { /* ignore */ }
        }
      }

      doc.setTextColor(255, 255, 255);
      setF(brand, "bold");
      doc.setFontSize(22);
      doc.text(brand, 40, 19);
      doc.setFontSize(9);
      setF(settings.contact_address || "");
      doc.text(settings.contact_address || "", 40, 26);
      setF("", "normal");
      doc.text(`${settings.contact_phone || ""}  •  ${settings.contact_email || ""}`, 40, 31);

      // INVOICE label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text("INVOICE", W - 14, 22, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`#${orderNo}`, W - 14, 30, { align: "right" });
      doc.text(new Date(order.created_at).toLocaleString(), W - 14, 35, { align: "right" });

      // ====== BILL TO / META CARDS ======
      let y = 56;
      const cardH = 32;
      const half = (W - 14 * 2 - 6) / 2;

      // Bill To card
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(14, y, half, cardH, 3, 3, "F");
      doc.setTextColor(pr, pg, pb);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("BILL TO", 18, y + 6);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(order.customer_name, 18, y + 13);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(order.customer_phone, 18, y + 19);
      if (order.customer_email) doc.text(order.customer_email, 18, y + 24);
      if (order.customer_address) {
        const lines = doc.splitTextToSize(order.customer_address, half - 8);
        doc.text(lines.slice(0, 1), 18, y + 29);
      }

      // Order Meta card
      const mx = 14 + half + 6;
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(mx, y, half, cardH, 3, 3, "F");
      doc.setTextColor(pr, pg, pb);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ORDER DETAILS", mx + 4, y + 6);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const metaRows: [string, string][] = [
        ["Invoice No", `#${orderNo}`],
        ["Date", new Date(order.created_at).toLocaleDateString()],
        ["Status", order.status.toUpperCase()],
        ["Delivery", order.delivery_location ? (order.delivery_location === "inside" ? "Inside Dhaka" : "Outside Dhaka") : "—"],
      ];
      metaRows.forEach((r, i) => {
        doc.setTextColor(110, 110, 120);
        doc.text(r[0], mx + 4, y + 13 + i * 5);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.text(r[1], mx + half - 4, y + 13 + i * 5, { align: "right" });
        doc.setFont("helvetica", "normal");
      });

      // ====== ITEMS TABLE ======
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
      });

      const finalY = (doc as any).lastAutoTable.finalY + 8;

      // ====== TOTALS ======
      const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
      const totalsX = W - 14 - 80;
      doc.setFillColor(248, 250, 255);
      doc.roundedRect(totalsX, finalY, 80, 32, 3, 3, "F");

      doc.setFontSize(10);
      doc.setTextColor(90, 90, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal", totalsX + 4, finalY + 8);
      doc.text("Delivery", totalsX + 4, finalY + 15);

      doc.setTextColor(30, 30, 30);
      doc.text(`BDT ${subtotal.toLocaleString()}`, totalsX + 76, finalY + 8, { align: "right" });
      doc.text(`BDT ${Number(order.delivery_charge || 0).toLocaleString()}`, totalsX + 76, finalY + 15, { align: "right" });

      // Total band
      doc.setFillColor(pr, pg, pb);
      doc.roundedRect(totalsX, finalY + 20, 80, 12, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TOTAL", totalsX + 4, finalY + 28);
      doc.text(`BDT ${Number(order.total).toLocaleString()}`, totalsX + 76, finalY + 28, { align: "right" });

      // Notes
      if (order.notes) {
        doc.setTextColor(90, 90, 100);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Notes", 14, finalY + 8);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(order.notes, totalsX - 14 - 6);
        doc.text(lines, 14, finalY + 14);
      }

      // ====== FOOTER ======
      doc.setFillColor(pr, pg, pb);
      doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
      doc.rect(0, H - 22, W, 22, "F");
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      doc.setTextColor(pr, pg, pb);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(bn ? "ধন্যবাদ আপনার অর্ডারের জন্য!" : "Thank you for your order!", W / 2, H - 13, { align: "center" });
      doc.setTextColor(110, 110, 120);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${brand}  •  ${settings.contact_phone || ""}  •  ${settings.contact_email || ""}`, W / 2, H - 7, { align: "center" });

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
