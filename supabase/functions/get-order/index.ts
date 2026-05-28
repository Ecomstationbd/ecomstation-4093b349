// Public endpoint to fetch order + items by id for the thank-you / invoice page.
// Order IDs are random UUIDv4 (effectively unguessable), so id-based access is acceptable.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { order_id } = await req.json();
    if (!order_id || typeof order_id !== "string") {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order, error: oe } = await supabase
      .from("orders").select("*").eq("id", order_id).maybeSingle();
    if (oe) throw oe;
    if (!order) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: items, error: ie } = await supabase
      .from("order_items").select("product_name,price,quantity,product_id").eq("order_id", order_id);
    if (ie) throw ie;
    const ids = Array.from(new Set((items || []).map((i: any) => i.product_id).filter(Boolean)));
    let productMap: Record<string, { download_url: string | null; category: string }> = {};
    if (ids.length) {
      const { data: prods } = await supabase.from("products").select("id,download_url,category").in("id", ids);
      productMap = Object.fromEntries((prods || []).map((p: any) => [p.id, { download_url: p.download_url, category: p.category }]));
    }
    const enriched = (items || []).map((i: any) => ({
      ...i,
      download_url: i.product_id ? productMap[i.product_id]?.download_url || null : null,
      is_digital: i.product_id ? productMap[i.product_id]?.category === "digital" : false,
    }));
    return new Response(JSON.stringify({ order, items: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
