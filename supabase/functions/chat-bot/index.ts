import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    }

    // Handle escalation request
    if (escalate) {
      await admin.from("chat_conversations").update({
        escalated: true,
        visitor_name: visitor?.name ?? null,
        visitor_contact: visitor?.contact ?? null,
      }).eq("id", convId);
      const note = "Customer requested human admin support. An admin will reach out soon.";
      await admin.from("chat_messages").insert({ conversation_id: convId, role: "system", content: note });
      return new Response(JSON.stringify({ conversationId: convId, escalated: true, reply: note }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400, headers: corsHeaders });
    }

    // Save user message
    await admin.from("chat_messages").insert({ conversation_id: convId, role: "user", content: message });

    // Load training settings
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

    const systemPrompt = `${map.chatbot_system_prompt ?? "You are a helpful support assistant."}\n\nKnowledge base:\n${map.chatbot_knowledge ?? ""}`;

    // Load history
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
