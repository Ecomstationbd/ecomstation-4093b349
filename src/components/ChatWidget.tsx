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
  }, [welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

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
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-primary text-primary-foreground shadow-glow flex items-center justify-center hover:scale-110 transition-smooth animate-glow-pulse group"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
          <span className="absolute right-full mr-3 hidden sm:block whitespace-nowrap px-3 py-1.5 rounded-full bg-card text-foreground text-xs font-medium shadow-elegant border border-border/60 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none">
            {lang === "bn" ? "যেকোনো প্রশ্ন? চ্যাট করুন!" : "Need help? Chat with us!"}
          </span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[26rem] max-w-md h-[75vh] sm:h-[34rem] rounded-2xl glass shadow-elegant border border-border/60 flex flex-col overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <div>
                <div className="text-sm font-semibold">{settings.brand_name} Support</div>
                <div className="text-[10px] opacity-90">{lang === "bn" ? "২৪/৭ সক্রিয়" : "Online 24/7"}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
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
            <div className="p-3 border-t border-border/50 space-y-2 bg-card">
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
            <div className="p-2 border-t border-border/50 bg-card">
              <div className="flex gap-1.5">
                <Button variant="ghost" size="icon" onClick={() => setShowEscalate(true)} title={lang === "bn" ? "অ্যাডমিনের সাথে কথা বলুন" : "Talk to admin"}>
                  <UserCog className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={lang === "bn" ? "মেসেজ লিখুন..." : "Type a message..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  disabled={loading}
                />
                <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
