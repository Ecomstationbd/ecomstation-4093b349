// Admin-only endpoint to list users, invite new admins, and grant/revoke admin role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const token = auth.replace("Bearer ", "");
    const { data: claims, error: ce } = await userClient.auth.getClaims(token);
    if (ce || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const uid = claims.claims.sub as string;

    const admin = createClient(url, service);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action: string = body.action || "list";

    if (action === "list") {
      // List up to 1000 users
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const ids = data.users.map((u) => u.id);
      const { data: roles } = await admin.from("user_roles").select("user_id, role").in("user_id", ids);
      const { data: profiles } = await admin.from("profiles").select("user_id, display_name, phone");
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });
      const profMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profMap.set(p.user_id, p));
      const users = data.users.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        provider: (u.app_metadata as any)?.provider,
        display_name: profMap.get(u.id)?.display_name || null,
        roles: roleMap.get(u.id) || [],
      }));
      return json({ users });
    }

    const email: string | undefined = body.email?.toString().trim().toLowerCase();
    if (!email) return json({ error: "email required" }, 400);

    const findUserByEmail = async () => {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      return data.users.find((u) => u.email?.toLowerCase() === email) || null;
    };

    if (action === "invite_admin") {
      const redirectTo = body.redirect_to || undefined;
      let user = await findUserByEmail();
      if (!user) {
        const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
        if (error) throw error;
        user = data.user;
      }
      if (!user) return json({ error: "could not create user" }, 500);
      await admin.from("user_roles").insert({ user_id: user.id, role: "admin" }).select();
      return json({ ok: true, user_id: user.id });
    }

    if (action === "grant_admin" || action === "revoke_admin") {
      const user = await findUserByEmail();
      if (!user) return json({ error: "user not found" }, 404);
      if (action === "grant_admin") {
        await admin.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
      } else {
        // Prevent removing the last admin
        const { data: admins } = await admin.from("user_roles").select("user_id").eq("role", "admin");
        if ((admins?.length || 0) <= 1 && admins?.[0]?.user_id === user.id) {
          return json({ error: "Cannot remove the last admin" }, 400);
        }
        await admin.from("user_roles").delete().eq("user_id", user.id).eq("role", "admin");
      }
      return json({ ok: true });
    }

    if (action === "delete_user") {
      const user = await findUserByEmail();
      if (!user) return json({ error: "user not found" }, 404);
      if (user.id === uid) return json({ error: "Cannot delete yourself" }, 400);
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e: any) {
    return json({ error: e?.message || "error" }, 500);
  }
});
