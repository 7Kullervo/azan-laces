import { PageHead } from "@/components/admin/ui";
import RoleButton from "@/components/admin/RoleButton";
import { listCustomerEmails } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

export default async function AdminCustomers() {
  const { supabase, user } = await requireAdmin();
  const [{ data: profiles }, emails, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    listCustomerEmails(),
    supabase.from("orders").select("user_id,total,status"),
  ]);
  const stats = new Map<string, { n: number; spent: number }>();
  (orders ?? []).forEach((o) => {
    if (!o.user_id) return;
    const s = stats.get(o.user_id) ?? { n: 0, spent: 0 };
    s.n += 1;
    if (o.status !== "cancelled") s.spent += Number(o.total);
    stats.set(o.user_id, s);
  });

  return (
    <>
      <PageHead title="Customers" />
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wider text-stone">
            <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Role</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(profiles ?? []).map((p) => {
              const s = stats.get(p.id);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3"><p className="font-medium">{p.full_name || "—"}</p><p className="text-xs text-stone">{emails[p.id]}</p></td>
                  <td className="px-4 py-3">{p.phone || "—"}</td>
                  <td className="px-4 py-3">{s ? `${s.n} · Rs. ${s.spent.toLocaleString("en-PK")}` : "0"}</td>
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}</td>
                  <td className="px-4 py-3"><RoleButton userId={p.id} role={p.role} self={p.id === user.id} /></td>
                </tr>
              );
            })}
            {!profiles?.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-stone">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
