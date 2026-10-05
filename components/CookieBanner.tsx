'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('orlamps-cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  // No mostrar en admin ni en páginas de autenticación
  if (pathname.startsWith('/admin')) return null;
  if (pathname === '/login' || pathname === '/registro' || pathname === '/recuperar-contrasena') return null;

  function aceptarTodas() {
    localStorage.setItem('orlamps-cookie-consent', 'all');
    setVisible(false);
  }

  function rechazarNoEsenciales() {
    localStorage.setItem('orlamps-cookie-consent', 'essential');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#141414',
      borderTop: '2px solid rgba(155,111,47,0.4)',
      boxShadow: '0 -4px 32px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '18px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        {/* Texto */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(155,111,47,0.18)', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B6F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            <span style={{ fontWeight: 700, color: '#EAEAEA', fontSize: '0.95rem' }}>
              Utilizamos cookies
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.84rem', lineHeight: 1.55, margin: 0 }}>
            Usamos cookies para garantizar el funcionamiento del sitio y mejorar tu experiencia.{' '}
            <Link href="/cookies" style={{ color: '#9B6F2F', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 500 }}>
              Política de Cookies
            </Link>
          </p>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={rechazarNoEsenciales}
            style={{
              padding: '9px 18px',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            Solo esenciales
          </button>
          <button
            onClick={aceptarTodas}
            style={{
              padding: '9px 22px',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: '#9B6F2F',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#B8862E'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#9B6F2F'; }}
          >
            Aceptar todas
          </button>
        </div>
      </div>

      {/* Móvil: stack vertical */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .cookie-actions { flex-direction: column !important; width: 100% !important; }
          .cookie-actions button { width: 100%; text-align: center; border-radius: 8px !important; padding: 12px 16px !important; }
        }
      ` }} />
    </div>
  );
}
