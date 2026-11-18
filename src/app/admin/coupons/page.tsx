import CouponManager, { type CouponRow } from "@/components/admin/CouponManager";
import { PageHead } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function AdminCoupons() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return (
    <>
      <PageHead title="Coupons" />
      <CouponManager coupons={(data ?? []) as CouponRow[]} />
    </>
  );
}
