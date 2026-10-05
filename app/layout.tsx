import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Suspense } from "react";
import SiteChrome from "@/components/SiteChrome";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FooterWrapper from "@/components/FooterWrapper";
import VisitasTracker from "@/components/VisitasTracker";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getContenido } from "@/app/actions/contenido";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | OrLamps",
    default: "OrLamps | Iluminación & Diseño",
  },
  description: "Descubre nuestra colección de lámparas y luminarias de diseño. OrLamps, especialistas en iluminación artesanal y de autor.",
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg", sizes: "any" },
    ],
    shortcut: "/favicon.jpg",
    apple: [
      { url: "/favicon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "OrLamps | Iluminación & Diseño",
    title: "OrLamps | Iluminación & Diseño",
    description: "Descubre nuestra colección de lámparas y luminarias de diseño.",
    images: [
      {
        url: "https://www.orlamps.site/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OrLamps | Iluminación & Diseño",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OrLamps | Iluminación & Diseño",
    description: "Descubre nuestra colección de lámparas y luminarias de diseño.",
    images: ["https://www.orlamps.site/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, contenido] = await Promise.all([
    supabase.auth.getUser(),
    getContenido(),
  ]);

  return (
    <html lang="es" className={montserrat.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <VisitasTracker userId={user?.id} />
        </Suspense>
        <div id="site-root">
          <SiteChrome
            whatsappNumber={contenido?.contacto_whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
            contenido={contenido}
            header={<Header />}
            footer={<FooterWrapper><Footer /></FooterWrapper>}
          >
            {children}
          </SiteChrome>
        </div>
      </body>
    </html>
  );
}
