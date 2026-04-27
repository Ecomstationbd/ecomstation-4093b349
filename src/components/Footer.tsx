import { Rocket, Facebook, Youtube, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <a href="#" className="flex items-center gap-2 font-bold text-lg mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="gradient-text text-xl">Ecomstation</span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              বাংলাদেশের ই-কমার্স উদ্যোক্তাদের জন্য পূর্ণাঙ্গ ডিজিটাল গ্রোথ পার্টনার।
            </p>
            <div className="flex gap-2">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">সার্ভিস</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-primary transition-smooth">ই-কমার্স ওয়েবসাইট</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth">পারফরম্যান্স মার্কেটিং</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth">SEO অপ্টিমাইজেশন</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth">AI অটোমেশন</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">কোম্পানি</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#why" className="hover:text-primary transition-smooth">আমাদের সম্পর্কে</a></li>
              <li><a href="#testimonials" className="hover:text-primary transition-smooth">ক্লায়েন্ট রিভিউ</a></li>
              <li><a href="#shop" className="hover:text-primary transition-smooth">শপ</a></li>
              <li><a href="#contact" className="hover:text-primary transition-smooth">যোগাযোগ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +৮৮০ ১৭০০-০০০০০০</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> hello@ecomstation.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> ঢাকা, বাংলাদেশ</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ecomstation. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-smooth">প্রাইভেসি পলিসি</a>
            <a href="#" className="hover:text-primary transition-smooth">টার্মস</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
