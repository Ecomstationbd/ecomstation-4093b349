import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const STORAGE_KEY = "ecomstation_chat_conv";

export function ChatWidget() {
  const { lang } = useLanguage();
  const settings = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const enabled = settings.chatbot_enabled !== "false";
  const welcome = lang === "bn"
    ? (settings.chatbot_welcome_bn || "হ্যালো! আমি কীভাবে সাহায্য করতে পারি?")
    : (settings.chatbot_welcome_en || "Hello! How can I help you?");

  useEffect(() => {
    if (messages.length === 0) setMessages([{ role: "assistant", content: welcome }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-bot", {
        body: { conversationId: convId, message: text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data.conversationId && data.conversationId !== convId) {
        setConvId(data.conversationId);
        localStorage.setItem(STORAGE_KEY, data.conversationId);
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      toast.error(e.message || "Chat error");
    } finally {
      setLoading(false);
    }
  };

  const submitEscalation = async () => {
    if (!name.trim() || !contact.trim()) {
      toast.error(lang === "bn" ? "নাম ও যোগাযোগ দিন" : "Name and contact required");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-bot", {
        body: { conversationId: convId, escalate: true, visitor: { name, contact } },
      });
      if (error) throw error;
      if (data.conversationId && data.conversationId !== convId) {
        setConvId(data.conversationId);
        localStorage.setItem(STORAGE_KEY, data.conversationId);
      }
      setMessages((m) => [...m, { role: "system", content: data.reply }]);
      setShowEscalate(false);
      toast.success(lang === "bn" ? "অ্যাডমিনের কাছে পাঠানো হয়েছে" : "Forwarded to admin");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-50 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-primary text-primary-foreground shadow-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-smooth animate-glow-pulse group"
          aria-label="Open chat"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
          <span className="absolute right-full mr-3 hidden sm:block whitespace-nowrap px-3 py-1.5 rounded-full bg-card text-foreground text-xs font-medium shadow-elegant border border-border/60 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none">
            {lang === "bn" ? "যেকোনো প্রশ্ন? চ্যাট করুন!" : "Need help? Chat with us!"}
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden bg-card border border-border/60 shadow-elegant animate-fade-up rounded-2xl
                     bottom-24 md:bottom-6 right-3 left-3 max-h-[70dvh] h-[30rem]
                     sm:left-auto sm:bottom-24 sm:right-6 sm:w-[26rem] sm:max-w-md sm:h-[34rem]"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-primary text-primary-foreground shrink-0 rounded-t-2xl">

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <div>
                <div className="text-sm font-semibold">{settings.brand_name} Support</div>
                <div className="text-[10px] opacity-90">{lang === "bn" ? "২৪/৭ সক্রিয়" : "Online 24/7"}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="h-9 w-9 -mr-2 flex items-center justify-center rounded-lg hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2 bg-background/60">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : m.role === "system"
                    ? "bg-accent/30 text-foreground border border-accent/40 italic"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                }`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-3 py-2 text-sm flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {showEscalate ? (
            <div className="p-3 border-t border-border/50 space-y-2 bg-card shrink-0"
                 style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              <div className="text-xs text-muted-foreground">{lang === "bn" ? "অ্যাডমিন আপনাকে শীঘ্রই যোগাযোগ করবে।" : "Admin will reach out shortly."}</div>
              <Input placeholder={lang === "bn" ? "আপনার নাম" : "Your name"} value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder={lang === "bn" ? "ফোন/ইমেইল" : "Phone/Email"} value={contact} onChange={(e) => setContact(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowEscalate(false)}>{lang === "bn" ? "বাতিল" : "Cancel"}</Button>
                <Button size="sm" className="flex-1" onClick={submitEscalation} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === "bn" ? "পাঠান" : "Submit")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-2 border-t border-border/50 bg-card shrink-0"
                 style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
              <div className="flex gap-1.5 items-center">
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowEscalate(true)} title={lang === "bn" ? "অ্যাডমিনের সাথে কথা বলুন" : "Talk to admin"}>
                  <UserCog className="h-5 w-5" />
                </Button>
                <Input
                  className="h-11 text-base"
                  placeholder={lang === "bn" ? "মেসেজ লিখুন..." : "Type a message..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  disabled={loading}
                />
                <Button size="icon" className="h-11 w-11 shrink-0" onClick={() => send(input)} disabled={loading || !input.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
