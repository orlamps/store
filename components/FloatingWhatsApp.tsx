'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingWhatsApp({ whatsappNumber }: { whatsappNumber?: string }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (pathname.startsWith('/admin')) return null;
  if (pathname === '/login' || pathname === '/registro' || pathname === '/recuperar-contrasena') return null;
  if (!whatsappNumber) return null;

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const number = cleanPhone.startsWith('09') ? `593${cleanPhone.slice(1)}` : cleanPhone;
  const message = encodeURIComponent('Hola, me comunico desde la tienda online de OrLamps. Quisiera más información, por favor.');
  const url = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}
    >
      {/* Tooltip */}
      <span style={{
        backgroundColor: '#141414',
        color: '#fff',
        fontSize: '0.82rem',
        fontWeight: 600,
        padding: '7px 14px',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(8px)',
        transition: 'all 0.25s ease',
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        ¿Hablamos?
      </span>

      {/* Botón circular */}
      <span style={{
        width: '58px',
        height: '58px',
        backgroundColor: '#25D366',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hovered
          ? '0 6px 24px rgba(37,211,102,0.55), 0 2px 8px rgba(0,0,0,0.12)'
          : '0 4px 16px rgba(37,211,102,0.4), 0 2px 6px rgba(0,0,0,0.08)',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        flexShrink: 0,
      }}>
        {/* SVG oficial WhatsApp */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="30"
          height="30"
          fill="#fff"
        >
          <path d="M24 4C12.95 4 4 12.95 4 24c0 3.56.94 6.9 2.58 9.8L4 44l10.47-2.55A19.93 19.93 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm0 36c-3.14 0-6.1-.82-8.66-2.27l-.62-.36-6.2 1.51 1.55-6.02-.4-.65A15.94 15.94 0 018 24c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16zm8.77-11.72c-.48-.24-2.84-1.4-3.28-1.56-.44-.16-.76-.24-1.08.24-.32.48-1.24 1.56-1.52 1.88-.28.32-.56.36-1.04.12-.48-.24-2.02-.74-3.84-2.36-1.42-1.26-2.38-2.82-2.66-3.3-.28-.48-.03-.74.21-.98.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-1.08-2.6-1.48-3.56-.39-.93-.78-.8-1.08-.82-.28-.01-.6-.01-.92-.01-.32 0-.84.12-1.28.6-.44.48-1.68 1.64-1.68 4s1.72 4.64 1.96 4.96c.24.32 3.38 5.16 8.2 7.24 1.14.49 2.04.79 2.73 1.01 1.15.36 2.19.31 3.01.19.92-.14 2.84-1.16 3.24-2.28.4-1.12.4-2.08.28-2.28-.12-.2-.44-.32-.92-.56z" />
        </svg>
      </span>

      {/* Pulso animado */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wa-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .wa-pulse-ring {
          position: absolute;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #25D366;
          animation: wa-pulse 2.2s ease-out infinite;
          pointer-events: none;
        }
      ` }} />
      <span className="wa-pulse-ring" style={{ position: 'absolute', right: '28px', bottom: '28px', zIndex: 9997 }} />
    </a>
  );
}
