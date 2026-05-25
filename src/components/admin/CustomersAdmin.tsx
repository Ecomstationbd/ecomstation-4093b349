import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ShieldCheck, ShieldOff, Trash2, RefreshCw, Search, UserPlus, Mail } from "lucide-react";

type AdminUser = {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  provider?: string;
  roles: string[];
};

export function CustomersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const call = async (action: string, payload: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body: { action, ...payload } });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return data;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data: any = await call("list");
      setUsers(data.users || []);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grant = async (email: string) => {
    setBusy(true);
    try { await call("grant_admin", { email }); toast.success("Admin granted"); await load(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const revoke = async (email: string) => {
    setBusy(true);
    try { await call("revoke_admin", { email }); toast.success("Admin revoked"); await load(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async (email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setBusy(true);
    try { await call("delete_user", { email }); toast.success("User deleted"); await load(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    try {
      await call("invite_admin", { email: inviteEmail.trim(), redirect_to: `${window.location.origin}/admin` });
      toast.success("Invite sent. User added as admin.");
      setInviteOpen(false);
      setInviteEmail("");
      await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const filtered = users.filter((u) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return (u.email || "").toLowerCase().includes(t) || (u.display_name || "").toLowerCase().includes(t);
  });
  const admins = filtered.filter((u) => u.roles.includes("admin"));
  const customers = filtered.filter((u) => !u.roles.includes("admin"));

  const fmt = (s: string | null) => s ? new Date(s).toLocaleString() : "—";

  const Row = ({ u }: { u: AdminUser }) => {
    const isAdmin = u.roles.includes("admin");
    return (
      <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg bg-card hover:shadow-soft transition-shadow">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{u.display_name || u.email}</span>
            {isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">ADMIN</span>}
            {u.provider && u.provider !== "email" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{u.provider}</span>}
            {!u.email_confirmed_at && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600">unverified</span>}
          </div>
          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Joined {fmt(u.created_at)} • Last login {fmt(u.last_sign_in_at)}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isAdmin ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => revoke(u.email!)} title="Revoke admin">
              <ShieldOff className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => grant(u.email!)} title="Grant admin">
              <ShieldCheck className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={() => remove(u.email!)} title="Delete user">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Customers & Admins</h2>
          <p className="text-sm text-muted-foreground">Manage user accounts and admin access.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="hero">
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite a new admin</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter the email. If the user already exists, they will be granted admin access. Otherwise an invite email is sent and the admin role is assigned on signup.
                </p>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="newadmin@example.com" />
                </div>
                <Button variant="hero" className="w-full" onClick={invite} disabled={busy || !inviteEmail.trim()}>
                  <Mail className="h-4 w-4 mr-1" /> Send invite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by email or name…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading users…</div>
      ) : (
        <>
          <section>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Admins ({admins.length})</h3>
            <div className="space-y-2">
              {admins.length === 0 && <div className="text-sm text-muted-foreground">No admins yet.</div>}
              {admins.map((u) => <Row key={u.id} u={u} />)}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Customers ({customers.length})</h3>
            <div className="space-y-2">
              {customers.length === 0 && <div className="text-sm text-muted-foreground">No customers yet.</div>}
              {customers.map((u) => <Row key={u.id} u={u} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
