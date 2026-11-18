import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { whatsappLink } from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Azan Lace by phone, WhatsApp, email or visit our shop.",
};

export default async function ContactPage() {
  const { contact } = await getSettings();

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">Contact Us</h1>
      <p className="mt-2 max-w-xl text-stone">Questions about a lace, a bulk order or delivery? We&apos;re happy to help.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{contact.business_name ?? "Azan Lace"}</h2>
            {contact.address && <p className="flex gap-3 text-sm"><MapPin size={18} className="mt-0.5 shrink-0 text-gold-dark" />{contact.address}</p>}
            {contact.phone && (
              <p className="flex gap-3 text-sm"><Phone size={18} className="mt-0.5 shrink-0 text-gold-dark" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-gold-dark">{contact.phone}</a></p>
            )}
            {contact.email && (
              <p className="flex gap-3 text-sm"><Mail size={18} className="mt-0.5 shrink-0 text-gold-dark" />
                <a href={`mailto:${contact.email}`} className="break-all hover:text-gold-dark">{contact.email}</a></p>
            )}
            {contact.hours && (
              <p className="flex gap-3 text-sm"><Clock size={18} className="mt-0.5 shrink-0 text-gold-dark" /><span className="whitespace-pre-line">{contact.hours}</span></p>
            )}
            {contact.whatsapp && (
              <a href={whatsappLink(contact.whatsapp, "Hello Azan Lace!")} target="_blank" rel="noopener noreferrer" className="btn w-full bg-[#25D366] text-white hover:brightness-95">
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            )}
          </div>
          {contact.map_embed && (
            <div className="overflow-hidden rounded-3xl border border-line">
              <iframe
                title="Azan Lace shop location"
                src={contact.map_embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
          )}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
