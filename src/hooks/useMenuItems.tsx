import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PublicMenuItem = {
  id: string;
  label_en: string;
  label_bn: string;
  href: string;
  sort_order: number;
  open_in_new_tab: boolean;
};

export function useMenuItems() {
  const [items, setItems] = useState<PublicMenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id,label_en,label_bn,href,sort_order,open_in_new_tab")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setItems((data || []) as PublicMenuItem[]);
        setLoaded(true);
      });
  }, []);

  return { items, loaded };
}
