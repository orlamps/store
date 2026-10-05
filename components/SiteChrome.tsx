'use client';

import { usePathname } from 'next/navigation';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import CookieBanner from '@/components/CookieBanner';
import { CartProvider } from '@/components/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { leerIvaConfig, leerRecargoTarjeta } from '@/lib/iva';

// Rutas donde NO se muestra el header (menú superior)
const RUTAS_SIN_HEADER = ['/login', '/registro', '/recuperar-contrasena'];

export default function SiteChrome({
  whatsappNumber,
  contenido,
  header,
  footer,
  children,
}: {
  whatsappNumber?: string;
  contenido: Record<string, string>;
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const esAdmin = pathname.startsWith('/admin');
  const esAuth = RUTAS_SIN_HEADER.includes(pathname);

  const mostrarHeader = !esAdmin && !esAuth;
  const mostrarFooter = !esAdmin;

  const iva = leerIvaConfig(contenido);
  const recargoTarjeta = leerRecargoTarjeta(contenido);

  return (
    <CartProvider>
      {mostrarHeader && header}
      <div className={mostrarHeader ? 'page-wrapper' : ''}>
        {children}
      </div>
      {mostrarFooter && footer}
      <FloatingWhatsApp whatsappNumber={whatsappNumber} />
      <CookieBanner />
      {!esAdmin && (
        <CartDrawer 
          whatsapp={whatsappNumber || ''} 
          ivaPorcentaje={iva.porcentaje} 
          ivaIncluido={iva.incluido} 
          recargoTarjeta={recargoTarjeta} 
        />
      )}
    </CartProvider>
  );
}
