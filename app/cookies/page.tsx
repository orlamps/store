import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { getContenido } from '@/app/actions/contenido';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Política de Cookies — OrLamps',
  description: 'Política de Cookies del sitio web y canales digitales de OrLamps.',
};

// ── Paleta OrLamps ──────────────────────────────────────────────────────────
const G = '#9B6F2F';
const ip = {
  width: 18, height: 18, viewBox: '0 0 24 24',
  fill: 'none', stroke: G, strokeWidth: '1.8',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

// ── Íconos SVG por sección ───────────────────────────────────────────────────
const IconQue   = () => <svg {...ip}><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="9.5" r="1.5" fill={G} stroke="none"/><circle cx="14" cy="8" r="1" fill={G} stroke="none"/><circle cx="15" cy="14" r="1.5" fill={G} stroke="none"/><circle cx="9" cy="15.5" r="1" fill={G} stroke="none"/></svg>;
const IconTipos = () => <svg {...ip}><rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10" width="12" height="3" rx="1"/><rect x="3" y="16" width="15" height="3" rx="1"/></svg>;
const IconWA    = () => <svg {...ip}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
const IconGear  = () => <svg {...ip}><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
const IconEdit  = () => <svg {...ip}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      width: '34px', height: '34px', borderRadius: '8px',
      backgroundColor: 'rgba(155,111,47,0.09)',
      border: '1px solid rgba(155,111,47,0.2)',
      display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

function LegalBlock({ icon, titulo, children }: { icon: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#141414', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IconBox>{icon}</IconBox>
        {titulo}
      </h2>
      <div style={{ paddingLeft: '16px', borderLeft: '2px solid #F0E6D0', lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
        {children}
      </div>
    </div>
  );
}

function TipoCookie({ nombre, descripcion, color, bg }: { nombre: string; descripcion: string; color: string; bg: string }) {
  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${color}30`, borderRadius: '10px', padding: '14px 18px', marginBottom: '10px' }}>
      <div style={{ fontWeight: 700, color, fontSize: '0.9rem', marginBottom: '4px' }}>{nombre}</div>
      <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7 }}>{descripcion}</div>
    </div>
  );
}

export default async function CookiesPage() {
  const contenido = await getContenido();

  const cookies_intro = contenido.legal_cookies_intro || 'En OrLamps utilizamos cookies y tecnologías similares para garantizar el correcto funcionamiento del sitio web, mejorar la experiencia del usuario y obtener información estadística sobre la navegación.';
  const cookies_que_son = contenido.legal_cookies_que_son || 'Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario al visitar un sitio web. Estas permiten reconocer el navegador, recordar preferencias y recopilar información sobre el uso del sitio.';
  const cookies_tipos = contenido.legal_cookies_tipos || 'Cookies técnicas o necesarias\nPermiten el funcionamiento básico del sitio web y no requieren consentimiento previo, ya que son esenciales para su uso correcto.\n\nCookies de análisis\nPermiten recopilar información anónima sobre el comportamiento de los usuarios en el sitio (páginas visitadas, tiempo de navegación), con el fin de mejorar contenidos y servicios.\n\nCookies de terceros\nEste sitio puede utilizar cookies de servicios externos, como herramientas de medición o plataformas integradas, que se rigen por sus propias políticas de privacidad y cookies.';
  const cookies_gestion = contenido.legal_cookies_gestion || 'El usuario puede configurar su navegador para aceptar, rechazar o eliminar cookies en cualquier momento. La desactivación de algunas cookies puede afectar el correcto funcionamiento del sitio web.';

  return (
    <main style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: G, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Información Legal
          </p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#141414', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
            Política de Cookies
          </h1>
          <div style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            {cookies_intro.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        {/* Aviso de aceptación */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #F0E6D0', borderLeft: '4px solid #9B6F2F', borderRadius: '10px', padding: '18px 22px', marginBottom: '48px', color: '#374151', fontSize: '0.9rem', lineHeight: 1.7 }}>
          Al acceder y continuar navegando en este sitio web, el usuario <strong>acepta el uso de cookies</strong> conforme a la presente Política.
        </div>

        <LegalBlock icon={<IconQue />} titulo="¿Qué son las cookies?">
          {cookies_que_son.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </LegalBlock>

        <LegalBlock icon={<IconTipos />} titulo="Tipos de cookies utilizadas">
          <TipoCookie nombre="Cookies técnicas o necesarias" descripcion="Permiten el funcionamiento básico del sitio web y no requieren consentimiento previo, ya que son esenciales para su uso correcto." color="#059669" bg="#ecfdf5" />
          <TipoCookie nombre="Cookies de análisis" descripcion="Permiten recopilar información anónima sobre el comportamiento de los usuarios en el sitio (páginas visitadas, tiempo de navegación), con el fin de mejorar contenidos y servicios." color="#2563eb" bg="#eff6ff" />
          <TipoCookie nombre="Cookies de terceros" descripcion="Este sitio puede utilizar cookies de servicios externos, como herramientas de medición o plataformas integradas, que se rigen por sus propias políticas de privacidad y cookies." color="#7c3aed" bg="#f5f3ff" />
          <div style={{ marginTop: '16px', color: '#6b7280', fontSize: '0.9rem' }}>
            <em>Nota sobre tipos adicionales:</em> {cookies_tipos}
          </div>
        </LegalBlock>

        <LegalBlock icon={<IconWA />} titulo="Enlace a WhatsApp">
          <p>El sitio web contiene enlaces directos a WhatsApp para facilitar la comunicación con el cliente. Al hacer clic en dichos enlaces, el usuario abandona este sitio web y pasa a estar sujeto a las políticas de privacidad y cookies de la plataforma correspondiente.</p>
          <p>OrLamps no controla ni se responsabiliza por el uso de cookies, datos o prácticas de privacidad de plataformas externas.</p>
        </LegalBlock>

        <LegalBlock icon={<IconGear />} titulo="Gestión y desactivación de cookies">
          {cookies_gestion.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          <p>Las opciones de configuración varían según el navegador utilizado:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {[
              { nombre: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
              { nombre: 'Firefox', url: 'https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias' },
              { nombre: 'Safari', url: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac' },
              { nombre: 'Edge', url: 'https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d' },
            ].map(b => (
              <a key={b.nombre} href={b.url} target="_blank" rel="noopener noreferrer"
                style={{ padding: '6px 14px', backgroundColor: '#FBF6EE', border: '1px solid #F0E6D0', borderRadius: '8px', color: G, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                {b.nombre} →
              </a>
            ))}
          </div>
        </LegalBlock>

        <LegalBlock icon={<IconEdit />} titulo="Modificaciones">
          <p>OrLamps se reserva el derecho de modificar la presente Política de Cookies en cualquier momento, en función de cambios normativos o técnicos. Las modificaciones entrarán en vigor desde su publicación en{' '}
            <a href="https://www.orlamps.site" target="_blank" rel="noopener noreferrer" style={{ color: G, fontWeight: 600 }}>www.orlamps.site</a>.
          </p>
        </LegalBlock>

        <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '16px 0 40px' }} />

        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px 28px' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 600 }}>Documentos relacionados</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/aviso-legal" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#FBF6EE', border: '1px solid #F0E6D0', borderRadius: '8px', color: G, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              <svg width="14" height="14" fill="none" stroke={G} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Aviso Legal y Términos y Condiciones
            </Link>
            <Link href="/privacidad" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#FBF6EE', border: '1px solid #F0E6D0', borderRadius: '8px', color: G, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              <svg width="14" height="14" fill="none" stroke={G} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Política de Privacidad
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} OrLamps — Iluminación &amp; Diseño ·{' '}
            <a href="https://www.orlamps.site" style={{ color: G }}>www.orlamps.site</a> · Ecuador
          </p>
        </div>

      </div>
    </main>
  );
}
