import type { Metadata, Viewport } from "next";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartDrawer from "@/components/CartDrawer";
import Providers from "@/components/Providers";
import ChromeGate from "@/components/ChromeGate";
import { getCategoryTree, getSettings } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Azan Lace — Laces, Trims & Tailoring Supplies", template: "%s | Azan Lace" },
  description:
    "Premium laces, designer patches, piping, organza borders, buttons, buckram and tailoring supplies. Shop online with delivery across Pakistan.",
  icons: { icon: "/favicon.svg" },
  openGraph: { siteName: "Azan Lace", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FBF8F3" };

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([getCategoryTree(), getSettings()]);
  const messages = settings.announcements.enabled ? settings.announcements.messages : [];

  return (
    <html lang="en">
      <body>
        <Providers>
          <ChromeGate>
            <AnnouncementBar messages={messages} />
            <Header categories={categories} />
          </ChromeGate>
          <main className="min-h-[60vh]">{children}</main>
          <ChromeGate>
            <Footer categories={categories} contact={settings.contact} />
            <CartDrawer shipping={settings.shipping} />
            <WhatsAppButton number={settings.contact.whatsapp} />
          </ChromeGate>
        </Providers>
      </body>
    </html>
  );
}
