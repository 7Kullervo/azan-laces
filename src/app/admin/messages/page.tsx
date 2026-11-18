import { PageHead } from "@/components/admin/ui";
import MessageItem from "@/components/admin/MessageItem";
import { requireAdmin } from "@/lib/admin";

export default async function AdminMessages() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHead title="Messages" />
      {data?.length ? (
        <ul className="space-y-3">{data.map((m) => <MessageItem key={m.id} m={m} />)}</ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-white py-14 text-center text-stone">No messages yet.</p>
      )}
    </>
  );
}
