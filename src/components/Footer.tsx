import Link from "next/link";
import { Facebook, Instagram, MapPin, Mail, MessageCircle, Phone } from "lucide-react";
import type { Category } from "@/lib/types";
import { whatsappLink } from "./WhatsAppButton";

interface Contact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export default function Footer({ categories, contact }: { categories: Category[]; contact: Contact }) {
  return (
    <footer className="mt-24 border-t border-line bg-ink text-ivory/85">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-block rounded-xl bg-ivory px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Azan Lace" className="h-10 w-auto" />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/70">
            Azan Lace is your online destination for premium laces, designer trims, patches, buttons and tailoring
            supplies. Quality products at fair prices for tailors, boutiques and designers.
          </p>
          <div className="mt-5 flex gap-2">
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition hover:border-gold hover:text-gold-light">
                <Facebook size={17} />
              </a>
            )}
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition hover:border-gold hover:text-gold-light">
                <Instagram size={17} />
              </a>
            )}
            {contact.whatsapp && (
              <a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition hover:border-gold hover:text-gold-light">
                <MessageCircle size={17} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl text-ivory">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["Home", "/"],
              ["All Products", "/collections/all"],
              ["New Arrivals", "/collections/all?new=1"],
              ["Best Sellers", "/collections/all?best=1"],
              ["Special Offers", "/collections/all?sale=1"],
              ["My Account", "/account"],
              ["Contact Us", "/contact"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-gold-light">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-ivory">Product Categories</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/collections/${c.slug}`} className="transition hover:text-gold-light">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-ivory">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {contact.address && (
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-light" />
                <span>{contact.address}</span>
              </li>
            )}
            {contact.phone && (
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold-light" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-gold-light">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.whatsapp && (
              <li className="flex gap-2.5">
                <MessageCircle size={16} className="mt-0.5 shrink-0 text-gold-light" />
                <a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-gold-light">
                  WhatsApp us
                </a>
              </li>
            )}
            {contact.email && (
              <li className="flex gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold-light" />
                <a href={`mailto:${contact.email}`} className="break-all hover:text-gold-light">
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
          <h3 className="mt-7 font-display text-xl text-ivory">Policies</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/policies/shipping" className="hover:text-gold-light">Shipping Policy</Link></li>
            <li><Link href="/policies/returns" className="hover:text-gold-light">Return &amp; Refund Policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-gold-light">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-gold-light">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Azan Lace. All rights reserved.</p>
          <p>Cash on Delivery · Bank Transfer · Prices in PKR</p>
        </div>
      </div>
    </footer>
  );
}
