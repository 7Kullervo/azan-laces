import type { Metadata } from "next";
import CatalogView from "@/components/CatalogView";
import type { SP } from "@/lib/catalog-params";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  return (
    <CatalogView
      basePath="/search"
      searchParams={sp}
      title={q ? `Results for “${q}”` : "Search"}
      intro="Search by product name, product code, SKU, category or type."
      crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
    />
  );
}
