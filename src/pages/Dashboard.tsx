import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Package, MessageSquare, User as UserIcon } from "lucide-react";

type Profile = { id: string; user_id: string; display_name: string | null; phone: string | null; avatar_url: string | null };
type Order = {
  id: string; total: number; status: string; created_at: string;
  customer_name: string; customer_phone: string; customer_address: string | null; notes: string | null;
  order_items?: { id: string; product_name: string; price: number; quantity: number }[];
};
type Msg = { id: string; subject: string | null; message: string; created_at: string; is_read: boolean };

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setDataLoading(true);
      const [{ data: p }, { data: o }, { data: m }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("id, subject, message, created_at, is_read").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p as Profile | null);
      setOrders((o as Order[]) || []);
      setMessages((m as Msg[]) || []);
      setDataLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-32 w-64" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const saveProfile = async () => {
    if (!profile) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      phone: profile.phone,
    }).eq("user_id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(bn ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated");
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { pending: "bg-warning/20 text-warning-foreground", completed: "bg-success/20", cancelled: "bg-destructive/20" };
    return <Badge variant="secondary" className={map[s] || ""}>{s}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {bn ? "হোম" : "Home"}
          </Link>
          <h1 className="font-bold text-lg gradient-text">{bn ? "আমার ড্যাশবোর্ড" : "My Dashboard"}</h1>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-1" /> {bn ? "লগআউট" : "Logout"}</Button>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1.5" /> {bn ? "অর্ডার" : "Orders"}</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-1.5" /> {bn ? "মেসেজ" : "Messages"}</TabsTrigger>
            <TabsTrigger value="profile"><UserIcon className="h-4 w-4 mr-1.5" /> {bn ? "প্রোফাইল" : "Profile"}</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-3 mt-4">
            {dataLoading ? <Skeleton className="h-24 w-full" /> :
              orders.length === 0 ? <p className="text-muted-foreground text-center py-12">{bn ? "এখনো কোনো অর্ডার নেই" : "No orders yet"}</p> :
              orders.map((o) => (
                <Card key={o.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-sm font-mono">#{o.id.slice(0, 8)}</CardTitle>
                      {statusBadge(o.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(o.order_items || []).map((it) => (
                      <div key={it.id} className="flex justify-between text-sm">
                        <span>{it.product_name} × {it.quantity}</span>
                        <span>৳{(it.price * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                      <span>{bn ? "মোট" : "Total"}</span>
                      <span className="gradient-text">৳{Number(o.total).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3 mt-4">
            {dataLoading ? <Skeleton className="h-24 w-full" /> :
              messages.length === 0 ? <p className="text-muted-foreground text-center py-12">{bn ? "কোনো মেসেজ নেই" : "No messages"}</p> :
              messages.map((m) => (
                <Card key={m.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between gap-2">
                      <CardTitle className="text-sm">{m.subject || (bn ? "(কোনো বিষয় নেই)" : "(no subject)")}</CardTitle>
                      <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader><CardTitle>{bn ? "প্রোফাইল তথ্য" : "Profile Info"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ""} disabled />
                  {!user.email_confirmed_at && (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs">
                      <span>{bn ? "ইমেইল ভেরিফাই করা হয়নি" : "Email not verified"}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const { error } = await supabase.auth.resend({ type: "signup", email: user.email! });
                          if (error) toast.error(error.message);
                          else toast.success(bn ? "ভেরিফিকেশন লিংক পাঠানো হয়েছে" : "Verification link sent");
                        }}
                      >
                        {bn ? "ভেরিফাই করুন" : "Verify now"}
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label>{bn ? "নাম" : "Name"}</Label>
                  <Input value={profile?.display_name || ""} onChange={(e) => setProfile((p) => p ? { ...p, display_name: e.target.value } : p)} />
                </div>
                <div>
                  <Label>{bn ? "ফোন" : "Phone"}</Label>
                  <Input value={profile?.phone || ""} onChange={(e) => setProfile((p) => p ? { ...p, phone: e.target.value } : p)} />
                  {user.phone && !user.phone_confirmed_at && (
                    <PhoneVerify phone={user.phone} bn={bn} />
                  )}
                  {!user.phone && profile?.phone && (
                    <PhoneVerify phone={profile.phone} bn={bn} />
                  )}
                </div>
                <Button variant="hero" onClick={saveProfile} disabled={busy || !profile}>
                  {busy ? "..." : bn ? "সেভ করুন" : "Save"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PhoneVerify({ phone, bn }: { phone: string; bn: boolean }) {
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ phone });
    setBusy(false);
    if (error) toast.error(error.message);
    else { setSent(true); toast.success(bn ? "OTP পাঠানো হয়েছে" : "OTP sent"); }
  };

  const verify = async () => {
    if (otp.length < 4) return toast.error(bn ? "OTP দিন" : "Enter OTP");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "phone_change" });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(bn ? "ফোন ভেরিফাইড" : "Phone verified");
  };

  return (
    <div className="mt-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span>{bn ? "ফোন ভেরিফাই করা হয়নি" : "Phone not verified"}</span>
        {!sent && (
          <Button size="sm" variant="outline" onClick={send} disabled={busy}>
            {bn ? "OTP পাঠান" : "Send OTP"}
          </Button>
        )}
      </div>
      {sent && (
        <div className="flex gap-2">
          <Input inputMode="numeric" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Button size="sm" onClick={verify} disabled={busy}>{bn ? "যাচাই" : "Verify"}</Button>
        </div>
      )}
    </div>
  );
}
