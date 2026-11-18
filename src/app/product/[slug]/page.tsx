import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Truck, ShieldCheck } from "lucide-react";
import AddToCart from "@/components/AddToCart";
import Price from "@/components/Price";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";
import StockLabel from "@/components/StockLabel";
import { whatsappLink } from "@/components/WhatsAppButton";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { effectivePrice } from "@/lib/units";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: `${p.name} (${p.sku})`,
    description: p.description?.slice(0, 160) ?? `Buy ${p.name} at Azan Lace.`,
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([getRelatedProducts(product), getSettings()]);

  // Specs: managed from the admin dashboard, plus colour/material when set and not already listed.
  const specs = [...product.specs];
  const has = (label: string) => specs.some((s) => s.label.toLowerCase() === label);
  if (product.colour && !has("colour")) specs.push({ label: "Colour", value: product.colour });
  if (product.material && !has("material")) specs.push({ label: "Material", value: product.material });
  specs.push({ label: "SKU", value: product.sku });
  specs.push({ label: "Sold per", value: product.unit.label });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: effectivePrice(product),
      availability: product.stock >= product.min_qty ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const waText = `Hello Azan Lace, I'm interested in ${product.name} (${product.sku}).`;

  return (
    <div className="container-page py-8 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-stone">
        <Link href="/" className="hover:text-gold-dark">Home</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link href={`/collections/${product.category.slug}`} className="hover:text-gold-dark">{product.category.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone">
              {product.subcategory?.name ?? product.category?.name}
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-sm text-stone">Product code: <strong className="text-ink">{product.sku}</strong></p>
          </div>

          <Price product={product} size="lg" />
          <StockLabel product={product} />

          <AddToCart product={product} />

          {settings.contact.whatsapp && (
            <a
              href={whatsappLink(settings.contact.whatsapp, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#128C4B] underline underline-offset-4"
            >
              <MessageCircle size={17} /> Ask about this product on WhatsApp
            </a>
          )}

          <div className="grid gap-3 border-t border-line pt-5 text-sm text-stone sm:grid-cols-2">
            <p className="flex items-center gap-2"><Truck size={17} className="text-gold-dark" /> Delivery across Pakistan</p>
            <p className="flex items-center gap-2"><ShieldCheck size={17} className="text-gold-dark" /> Cash on delivery available</p>
          </div>

          {product.description && (
            <div className="border-t border-line pt-5">
              <h2 className="text-2xl font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-stone">{product.description}</p>
            </div>
          )}

          <div className="border-t border-line pt-5">
            <h2 className="text-2xl font-semibold">Specifications</h2>
            <dl className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white text-sm">
              {specs.map((s) => (
                <div key={s.label} className="grid grid-cols-5 gap-3 px-4 py-2.5">
                  <dt className="col-span-2 text-stone">{s.label}</dt>
                  <dd className="col-span-3 font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8">You May Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
