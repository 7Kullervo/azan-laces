import { MessageCircle } from "lucide-react";

export function whatsappLink(number: string | undefined, text?: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Floating WhatsApp button, number comes from admin store settings. */
export default function WhatsAppButton({ number }: { number?: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number, "Hello Azan Lace, I would like some help with an order.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 sm:right-6"
    >
      <MessageCircle size={26} />
    </a>
  );
}
