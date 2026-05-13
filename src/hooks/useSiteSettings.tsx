import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  logo_url: string;
  brand_name: string;
  contact_phone: string;
  contact_email: string;
  contact_whatsapp: string;
  chatbot_enabled: string;
  chatbot_welcome_bn: string;
  chatbot_welcome_en: string;
  chatbot_system_prompt: string;
  chatbot_knowledge: string;
};

const defaults: SiteSettings = {
  logo_url: "",
  brand_name: "ECOMSTATION",
  contact_phone: "+880 1700-000000",
  contact_email: "hello@ecomstation.com",
  contact_whatsapp: "8801700000000",
  chatbot_enabled: "true",
  chatbot_welcome_bn: "হ্যালো! Ecomstation-এ স্বাগতম। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  chatbot_welcome_en: "Hello! Welcome to Ecomstation. How can I help you today?",
  chatbot_system_prompt: "",
  chatbot_knowledge: "",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      if (!data) return;
      const merged = { ...defaults };
      data.forEach((r: any) => { (merged as any)[r.key] = r.value || (defaults as any)[r.key]; });
      setSettings(merged);
    });
  }, []);
  return settings;
}
