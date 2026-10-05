import Link from 'next/link';
import Image from 'next/image';
import { getContenido } from '@/app/actions/contenido';

export default async function Footer() {
  const contenido = await getContenido();
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#141414', color: '#888', padding: '80px 24px 40px', borderTop: '1px solid #141414' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', marginBottom: '64px' }}>
        
        {/* Brand */}
        <div>
          <Image 
            src="/logo.png" 
            alt="OrLamps" 
            width={140} 
            height={40} 
            style={{ height: '36px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.9, marginBottom: '16px' }} 
          />
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', maxWidth: '300px' }}>
            {contenido.footer_texto || 'Iluminación & Diseño'}
          </p>
          {/* Aviso Legal debajo del logo y slogan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              href="/aviso-legal"
              style={{ fontSize: '0.8rem', color: '#9B6F2F', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(155,111,47,0.3)', paddingBottom: '2px', width: 'fit-content' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Aviso Legal y Términos y Condiciones
            </Link>
            <Link
              href="/privacidad"
              style={{ fontSize: '0.8rem', color: '#9B6F2F', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(155,111,47,0.3)', paddingBottom: '2px', width: 'fit-content' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Política de Privacidad
            </Link>
            <Link
              href="/cookies"
              style={{ fontSize: '0.8rem', color: '#9B6F2F', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(155,111,47,0.3)', paddingBottom: '2px', width: 'fit-content' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/><circle cx="14" cy="8" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg>
              Política de Cookies
            </Link>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ color: '#EAEAEA', fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Navegación</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Inicio</Link>
            <Link href="/tienda" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Catálogo</Link>
            <Link href="/quienes-somos" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Sobre Nosotros</Link>
            <Link href="/contacto" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Contacto</Link>
          </nav>
        </div>

        {/* Social & Contact */}
        <div>
          <h4 style={{ color: '#EAEAEA', fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px' }}>Conecta con nosotros</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contenido.contacto_instagram && (
              <a href={contenido.contacto_instagram.startsWith('http') ? contenido.contacto_instagram : `https://instagram.com/${contenido.contacto_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram
              </a>
            )}
            {contenido.contacto_facebook && (
              <a href={contenido.contacto_facebook.startsWith('http') ? contenido.contacto_facebook : `https://${contenido.contacto_facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> Facebook
              </a>
            )}
            {contenido.contacto_tiktok && (
              <a href={contenido.contacto_tiktok.startsWith('http') ? contenido.contacto_tiktok : `https://tiktok.com/${contenido.contacto_tiktok.startsWith('@') ? contenido.contacto_tiktok : '@'+contenido.contacto_tiktok}`} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg> TikTok
              </a>
            )}
            {contenido.contacto_pinterest && (
              <a href={contenido.contacto_pinterest.startsWith('http') ? contenido.contacto_pinterest : `https://${contenido.contacto_pinterest}`} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 20l4 -9" /><path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7" /><circle cx="12" cy="12" r="9" /></svg> Pinterest
              </a>
            )}
            {contenido.contacto_email && (
              <a href={`mailto:${contenido.contacto_email}`} style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> {contenido.contacto_email}
              </a>
            )}
          </div>
        </div>

      </div>
      
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem' }}>
        <div>&copy; {year} OrLamps. Todos los derechos reservados.</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>{contenido.footer_ciudad || 'Ecuador'}</span>
          <Link href="/aviso-legal" style={{ color: '#9B6F2F', textDecoration: 'none', fontWeight: 500 }}>
            Aviso Legal
          </Link>
          <Link href="/privacidad" style={{ color: '#9B6F2F', textDecoration: 'none', fontWeight: 500 }}>
            Privacidad
          </Link>
          <Link href="/cookies" style={{ color: '#9B6F2F', textDecoration: 'none', fontWeight: 500 }}>
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
