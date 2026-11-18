import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/CatalogView";
import { getCategoryTree } from "@/lib/data";
import type { SP } from "@/lib/catalog-params";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "all") {
    return { title: "All Products", description: "Browse every lace, patch, trim, button and tailoring supply at Azan Lace." };
  }
  const cat = (await getCategoryTree()).find((c) => c.slug === slug);
  if (!cat) return { title: "Collection not found" };
  return { title: cat.name, description: `Shop ${cat.name} at Azan Lace. Quality products priced in PKR with delivery across Pakistan.` };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const tree = await getCategoryTree();

  if (slug === "all") {
    return (
      <CatalogView
        basePath="/collections/all"
        searchParams={sp}
        title="All Products"
        intro="Laces, patches, piping, organza, buttons, buckram, sewing supplies and tailoring tools."
        crumbs={[{ label: "Home", href: "/" }, { label: "All Products" }]}
      />
    );
  }

  const cat = tree.find((c) => c.slug === slug);
  if (!cat) notFound();
  const sub = cat.children?.find((s) => s.slug === (Array.isArray(sp.sub) ? sp.sub[0] : sp.sub));

  return (
    <CatalogView
      basePath={`/collections/${cat.slug}`}
      searchParams={sp}
      categorySlug={cat.slug}
      title={sub ? sub.name : cat.name}
      intro={sub ? `${sub.name} from our ${cat.name} collection.` : undefined}
      crumbs={[
        { label: "Home", href: "/" },
        { label: cat.name, href: sub ? `/collections/${cat.slug}` : undefined },
        ...(sub ? [{ label: sub.name }] : []),
      ]}
    />
  );
}
