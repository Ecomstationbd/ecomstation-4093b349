import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function buildKnowledgeBase(admin: any): Promise<string> {
  const [servicesRes, productsRes, combosRes, settingsRes] = await Promise.all([
    admin.from("services").select("title_en,title_bn,description_en,description_bn,price,price_text,features,coming_soon,slug").eq("is_active", true).order("sort_order"),
    admin.from("products").select("name_en,name_bn,description_en,description_bn,price,old_price,category,slug,stock").eq("is_active", true).order("sort_order").limit(200),
    admin.from("combos").select("name_en,name_bn,description_en,description_bn,price,old_price,slug").eq("is_active", true).order("sort_order"),
    admin.from("site_settings").select("key,value").in("key", ["brand_name","contact_phone","contact_email","contact_whatsapp","contact_address"]),
  ]);

  const settings = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]));

  const lines: string[] = [];
  lines.push(`# Company: ${settings.brand_name ?? "ECOMSTATION"}`);
  if (settings.contact_phone) lines.push(`Phone: ${settings.contact_phone}`);
  if (settings.contact_whatsapp) lines.push(`WhatsApp: ${settings.contact_whatsapp}`);
  if (settings.contact_email) lines.push(`Email: ${settings.contact_email}`);
  if (settings.contact_address) lines.push(`Address: ${settings.contact_address}`);

  if (servicesRes.data?.length) {
    lines.push("\n## Services we offer");
    for (const s of servicesRes.data) {
      const features = Array.isArray(s.features) ? s.features.filter((f: any) => typeof f === "string" || f?.text || f?.label).map((f: any) => typeof f === "string" ? f : (f.text || f.label)).join("; ") : "";
      const priceStr = s.price_text || (s.price != null ? `${s.price} BDT` : "Contact for pricing");
      lines.push(`- ${s.title_en} (${s.title_bn}) — ${priceStr}${s.coming_soon ? " [coming soon]" : ""}`);
      const desc = s.description_en || s.description_bn;
      if (desc) lines.push(`  ${desc}`);
      if (features) lines.push(`  Includes: ${features}`);
    }
  }

  if (productsRes.data?.length) {
    lines.push("\n## Products");
    for (const p of productsRes.data) {
      const price = p.old_price && p.old_price > p.price ? `${p.price} BDT (was ${p.old_price})` : `${p.price} BDT`;
      lines.push(`- ${p.name_en} (${p.name_bn}) [${p.category}] — ${price}${p.stock != null ? `, stock: ${p.stock}` : ""}`);
      const desc = p.description_en || p.description_bn;
      if (desc) lines.push(`  ${String(desc).slice(0, 200)}`);
    }
  }

  if (combosRes.data?.length) {
    lines.push("\n## Combo offers");
    for (const c of combosRes.data) {
      const price = c.old_price && c.old_price > c.price ? `${c.price} BDT (was ${c.old_price})` : `${c.price} BDT`;
      lines.push(`- ${c.name_en} (${c.name_bn}) — ${price}`);
      const desc = c.description_en || c.description_bn;
      if (desc) lines.push(`  ${desc}`);
    }
  }

  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conversationId, message, escalate, visitor } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get or create conversation
    let convId = conversationId as string | undefined;
    if (!convId) {
      const { data, error } = await admin
        .from("chat_conversations")
        .insert({ visitor_name: visitor?.name ?? null, visitor_contact: visitor?.contact ?? null })
        .select("id")
        .single();
      if (error) throw error;
      convId = data.id;
    } else if (visitor?.name || visitor?.contact) {
      // Keep visitor info in sync on existing conversation
      await admin.from("chat_conversations").update({
        visitor_name: visitor?.name ?? null,
        visitor_contact: visitor?.contact ?? null,
      }).eq("id", convId);
    }

    if (escalate) {
      await admin.from("chat_conversations").update({
        escalated: true,
        visitor_name: visitor?.name ?? null,
        visitor_contact: visitor?.contact ?? null,
      }).eq("id", convId);
      const note = `Customer ${visitor?.name ?? ""} requested human admin support. Contact: ${visitor?.contact ?? "n/a"}. An admin will reach out soon.`;
      await admin.from("chat_messages").insert({ conversation_id: convId, role: "system", content: note });
      return new Response(JSON.stringify({ conversationId: convId, escalated: true, reply: note }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400, headers: corsHeaders });
    }

    await admin.from("chat_messages").insert({ conversation_id: convId, role: "user", content: message });

    const { data: settings } = await admin
      .from("site_settings")
      .select("key,value")
      .in("key", ["chatbot_system_prompt", "chatbot_knowledge", "chatbot_enabled"]);
    const map = Object.fromEntries((settings ?? []).map((s: any) => [s.key, s.value]));
    if (map.chatbot_enabled === "false") {
      return new Response(JSON.stringify({ conversationId: convId, reply: "Chatbot is currently disabled." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const liveKnowledge = await buildKnowledgeBase(admin);

    const basePrompt = map.chatbot_system_prompt
      || "You are a friendly, helpful support assistant for an eCommerce + digital services agency. Reply in the same language as the customer (Bangla or English). Be concise, accurate, and warm.";

    const visitorLine = visitor?.name
      ? `\nYou are chatting with ${visitor.name} (contact: ${visitor.contact ?? "n/a"}). Address them by name when natural.`
      : "";

    const systemPrompt = `${basePrompt}${visitorLine}

Important rules:
- Only describe services, products, prices, and combos that appear in the LIVE DATA below. Do not invent offerings, pricing, or features.
- If a customer asks about something not listed, say it's not currently available and offer to connect them with an admin.
- Always answer in the customer's language (Bangla if they write Bangla, English otherwise).

=== LIVE DATA (auto-synced from the website) ===
${liveKnowledge}
=== END LIVE DATA ===

${map.chatbot_knowledge ? `Additional notes from admin:\n${map.chatbot_knowledge}` : ""}`;

    const { data: history } = await admin
      .from("chat_messages")
      .select("role,content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(30);

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).filter((m: any) => m.role !== "system").map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiJson = await aiRes.json();
    const reply: string = aiJson.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";

    await admin.from("chat_messages").insert({ conversation_id: convId, role: "assistant", content: reply });

    return new Response(JSON.stringify({ conversationId: convId, reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-bot error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
