import Link from "next/link";
import { Award, Layers, MessageCircle, Wallet } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";
import ProductGrid from "@/components/ProductGrid";
import { getBanners, getCategoryTree, getHomeProducts, getSettings } from "@/lib/data";
import { whatsappLink } from "@/components/WhatsAppButton";
import type { Category } from "@/lib/types";

const COLLECTION_CARDS: { label: string; href: string; slug: string; sub?: string }[] = [
  { label: "Designer Laces", href: "/collections/laces?sub=designer-laces", slug: "l001-floral-designer-lace" },
  { label: "Border Laces", href: "/collections/laces?sub=border-laces", slug: "l002-gold-border-lace" },
  { label: "Fancy Laces", href: "/collections/laces?sub=fancy-laces", slug: "l003-pearl-fancy-lace" },
  { label: "Neckline Patches", href: "/collections/patches?sub=neckline-patches", slug: "p001-zari-neckline-patch" },
  { label: "Organza Borders", href: "/collections/organza?sub=organza-borders", slug: "or001-organza-border" },
  { label: "Piping", href: "/collections/piping", slug: "pi002-gold-designer-piping" },
  { label: "Designer Buttons", href: "/collections/buttons?sub=designer-buttons", slug: "b001-designer-button" },
  { label: "Buckrams", href: "/collections/buckrams", slug: "bk001-tailoring-buckram" },
  { label: "Sewing Supplies", href: "/collections/sewing-supplies", slug: "o001-sewing-machine-oil" },
  { label: "Tailoring Accessories", href: "/collections/tailoring-accessories", slug: "r001-measuring-ruler" },
];

function SectionHead({ title, href, kicker }: { title: string; href?: string; kicker?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">{kicker}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-gold-dark underline underline-offset-4">
          View all
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [banners, products, settings, tree] = await Promise.all([
    getBanners(),
    getHomeProducts(),
    getSettings(),
    getCategoryTree(),
  ]);
  const hasProducts = products.featured.length + products.best.length + products.newest.length > 0;

  return (
    <>
      <HeroCarousel banners={banners} />

      {/* Shop by collection */}
      <section className="container-page pt-16">
        <SectionHead kicker="Browse" title="Shop by Collection" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {COLLECTION_CARDS.map((c) => (
            <Link key={c.label} href={c.href} className="group relative block overflow-hidden rounded-2xl bg-cream">
              <div className="aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/products/${c.slug}.svg`}
                  alt={c.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12">
                <p className="font-display text-xl font-semibold text-ivory sm:text-2xl">{c.label}</p>
                <p className="text-xs uppercase tracking-widest text-gold-light opacity-0 transition group-hover:opacity-100">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {!hasProducts && (
        <section className="container-page py-20 text-center">
          <p className="font-display text-2xl">Products will appear here once the store is stocked.</p>
          <p className="mt-2 text-sm text-stone">Add products from the admin dashboard.</p>
        </section>
      )}

      {products.featured.length > 0 && (
        <section className="container-page pt-20">
          <SectionHead kicker="Hand-picked" title="Featured Products" href="/collections/all" />
          <ProductGrid products={products.featured} />
        </section>
      )}

      {products.best.length > 0 && (
        <section className="mt-20 bg-cream py-16">
          <div className="container-page">
            <SectionHead kicker="Most loved" title="Best Sellers" href="/collections/all?best=1&sort=best" />
            <ProductGrid products={products.best.slice(0, 4)} />
          </div>
        </section>
      )}

      {products.newest.length > 0 && (
        <section className="container-page pt-20">
          <SectionHead kicker="Just in" title="New Arrivals" href="/collections/all?new=1&sort=newest" />
          <ProductGrid products={products.newest.slice(0, 4)} />
        </section>
      )}

      {products.offers.length > 0 && (
        <section className="container-page pt-20">
          <div className="overflow-hidden rounded-3xl border border-gold/40 bg-gold-light/40 p-6 sm:p-10">
            <SectionHead kicker="Limited time" title="Special Offers" href="/collections/all?sale=1" />
            <ProductGrid products={products.offers} />
          </div>
        </section>
      )}

      {/* Why choose */}
      <section className="container-page pt-20">
        <SectionHead title="Why Choose Azan Lace?" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, title: "Quality Products", text: "Every lace, trim and tool is checked before it ships, so your work always finishes beautifully." },
            { icon: Layers, title: "Wide Product Variety", text: "From designer laces and patches to buttons, buckram and sewing essentials, all in one place." },
            { icon: Wallet, title: "Affordable Prices", text: "Premium looks at fair prices, with wholesale rates for tailors and boutiques." },
            { icon: MessageCircle, title: "Convenient Shopping", text: "Order online, pay on delivery, and reach us on WhatsApp whenever you need help." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-light text-gold-dark">
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp */}
      {settings.contact.whatsapp && (
        <section className="container-page pt-16">
          <div className="flex flex-col items-center justify-between gap-5 rounded-3xl bg-ink px-6 py-10 text-center text-ivory sm:flex-row sm:px-12 sm:text-left">
            <div>
              <h2 className="text-3xl font-semibold">Need help choosing? Wholesale orders?</h2>
              <p className="mt-2 text-sm text-ivory/70">Message us on WhatsApp, share a photo of your design and we&apos;ll help you find the right trim.</p>
            </div>
            <a
              href={whatsappLink(settings.contact.whatsapp, "Hello Azan Lace, I would like to ask about your products.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[#25D366] px-8 text-white hover:brightness-95"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
        </section>
      )}
    </>
  );
}

export type { Category };
