import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Home, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const bn = lang === "bn";
  const orderId = searchParams.get("order_id");
  const [orderNo, setOrderNo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 1);
    if (orderId) {
      supabase.from("orders").select("order_number").eq("id", orderId).maybeSingle()
        .then(({ data }) => { if (data?.order_number) setOrderNo(data.order_number); });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
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
            <div className="inline-flex items-center gap-2 bg-muted rounded-full px-5 py-2.5 text-sm font-medium text-foreground mx-auto">
              <span className="text-muted-foreground">{bn ? "অর্ডার আইডি:" : "Order ID:"}</span>
              <span className="font-mono">{orderNo || orderId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/")} className="gap-2">
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
              href="https://wa.me/8801234567890"
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
