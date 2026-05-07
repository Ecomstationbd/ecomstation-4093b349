import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  logo_url: string;
  brand_name: string;
  contact_phone: string;
  contact_email: string;
  contact_whatsapp: string;
};

const defaults: SiteSettings = {
  logo_url: "",
  brand_name: "ECOMSTATION",
  contact_phone: "+880 1700-000000",
  contact_email: "hello@ecomstation.com",
  contact_whatsapp: "8801700000000",
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
