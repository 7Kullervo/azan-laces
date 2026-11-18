import Link from "next/link";
import { Suspense } from "react";
import { getCatalog, getCategoryTree } from "@/lib/data";
import { parseCatalogParams, type SP } from "@/lib/catalog-params";
import FilterPanel from "./FilterPanel";
import ProductGrid from "./ProductGrid";

function pageHref(base: string, sp: SP, page: number) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val && k !== "page") params.set(k, val);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

interface Props {
  basePath: string;
  searchParams: SP;
  categorySlug?: string;
  title: string;
  intro?: string;
  crumbs?: { label: string; href?: string }[];
}

export default async function CatalogView({ basePath, searchParams, categorySlug, title, intro, crumbs }: Props) {
  const query = parseCatalogParams(searchParams, categorySlug);
  const [result, categories] = await Promise.all([getCatalog(query), getCategoryTree()]);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="container-page py-10">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {c.href ? <Link href={c.href} className="hover:text-gold-dark">{c.label}</Link> : c.label}
              {i < crumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </nav>
      )}
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-stone">{intro}</p>}
        <p className="mt-2 text-sm text-stone lg:hidden">
          {result.total} product{result.total === 1 ? "" : "s"}
        </p>
      </header>

      <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
        <FilterPanel
          categories={categories}
          facets={result.facets}
          activeCategory={categorySlug && categorySlug !== "all" ? categorySlug : undefined}
          total={result.total}
        >
          {result.products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white py-20 text-center">
              <p className="font-display text-3xl">No products found</p>
              <p className="mt-2 text-sm text-stone">Try removing a filter or searching for something else.</p>
              <Link href={basePath} className="btn-dark mt-6">Clear filters</Link>
            </div>
          ) : (
            <ProductGrid products={result.products} />
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(basePath, searchParams, p)}
                  aria-current={p === result.page ? "page" : undefined}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition ${
                    p === result.page ? "border-ink bg-ink text-ivory" : "border-line bg-white hover:border-gold"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </FilterPanel>
      </Suspense>
    </div>
  );
}
