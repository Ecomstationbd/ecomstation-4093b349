import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PublicMenuItem = {
  id: string;
  label_en: string;
  label_bn: string;
  href: string;
  sort_order: number;
  open_in_new_tab: boolean;
  parent_id: string | null;
  children?: PublicMenuItem[];
};

export function useMenuItems() {
  const [items, setItems] = useState<PublicMenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id,label_en,label_bn,href,sort_order,open_in_new_tab,parent_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const all = (data || []) as PublicMenuItem[];
        const byId = new Map<string, PublicMenuItem>();
        all.forEach((it) => byId.set(it.id, { ...it, children: [] }));
        const roots: PublicMenuItem[] = [];
        byId.forEach((it) => {
          if (it.parent_id && byId.has(it.parent_id)) {
            byId.get(it.parent_id)!.children!.push(it);
          } else {
            roots.push(it);
          }
        });
        setItems(roots);
        setLoaded(true);
      });
  }, []);

  return { items, loaded };
}
