import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LINKS = [
  ["/account", "Profile"],
  ["/account/orders", "My Orders"],
  ["/account/addresses", "Addresses"],
  ["/account/wishlist", "Wishlist"],
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/account");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">My Account</h1>
      <p className="mt-1 text-sm text-stone">{data.user.email}</p>
      <div className="mt-8 grid gap-8 md:grid-cols-4">
        <nav aria-label="Account" className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible no-scrollbar">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="shrink-0 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium transition hover:border-gold md:rounded-xl">
              {label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link href="/admin" className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory md:rounded-xl">
              Admin dashboard
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="w-full shrink-0 rounded-full px-5 py-2.5 text-left text-sm text-stone underline md:rounded-xl">Sign out</button>
          </form>
        </nav>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
