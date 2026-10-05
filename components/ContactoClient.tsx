'use client';

import { useState, useTransition } from 'react';
import { enviarContacto } from '@/app/actions/contacto';

type Contenido = Record<string, string>;

export default function ContactoClient({ contenido }: { contenido: Contenido }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await enviarContacto(formData);
      if (res.error) { setError(res.error); return; }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    backgroundColor: '#fff',
  };

  const whatsapp = contenido.contacto_whatsapp;
  const email = contenido.contacto_email;
  const telefono = contenido.contacto_telefono;
  const direccion = contenido.contacto_direccion;
  const instagram = contenido.contacto_instagram;
  const facebook = contenido.contacto_facebook;

  return (
    <main className="inner-page">
      <div className="inner-page-body">
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9B6F2F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Contáctanos
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#141414', marginBottom: '10px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {contenido.contacto_titulo || 'ESTAMOS PARA AYUDARTE'}
          </h1>
          <p style={{ color: '#141414', fontSize: '1.1rem', lineHeight: 1.7 }}>
            {contenido.contacto_subtitulo || 'Escríbenos con tu consulta y te responderemos a la brevedad.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 items-start">
          {/* Info de contacto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '12px' }}>
            {email && (
              <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ color: '#141414' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#141414', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Email</div>
                  <div style={{ fontWeight: 600, color: '#141414', fontSize: '1.05rem' }}>{email}</div>
                </div>
              </a>
            )}

            {direccion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'inherit' }}>
                <div style={{ color: '#141414' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#141414', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Ubicación</div>
                  <div style={{ fontWeight: 600, color: '#141414', fontSize: '1.05rem' }}>{direccion}</div>
                </div>
              </div>
            )}

            {whatsapp && (() => {
              const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
              const waLink = cleanPhone.startsWith('09') ? `593${cleanPhone.slice(1)}` : cleanPhone;
              return (
                <a href={`https://wa.me/${waLink}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ color: '#141414' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#141414', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>WhatsApp</div>
                    <div style={{ fontWeight: 600, color: '#141414', fontSize: '1.05rem' }}>{whatsapp}</div>
                  </div>
                </a>
              );
            })()}

            {/* Redes Sociales (solo iconos) */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              {instagram && (
                <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#141414', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {facebook && (
                <a href={facebook.startsWith('http') ? facebook : `https://${facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: '#141414', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {contenido.contacto_tiktok && (
                <a href={contenido.contacto_tiktok.startsWith('http') ? contenido.contacto_tiktok : `https://tiktok.com/${contenido.contacto_tiktok.startsWith('@') ? contenido.contacto_tiktok : '@'+contenido.contacto_tiktok}`} target="_blank" rel="noopener noreferrer" style={{ color: '#141414', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
              )}
              {contenido.contacto_pinterest && (
                <a href={contenido.contacto_pinterest.startsWith('http') ? contenido.contacto_pinterest : `https://${contenido.contacto_pinterest}`} target="_blank" rel="noopener noreferrer" style={{ color: '#141414', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 20l4 -9" /><path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7" /><circle cx="12" cy="12" r="9" /></svg>
                </a>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '36px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#141414', marginBottom: '24px' }}>Envíanos un mensaje</h2>

            {success ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#15803d' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1.1rem', marginBottom: '6px' }}>¡Mensaje enviado!</div>
                <div style={{ color: '#166534', fontSize: '0.9rem' }}>Te responderemos a la brevedad. ¡Gracias por contactarnos!</div>
                <button onClick={() => setSuccess(false)} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', border: '1px solid #bbf7d0', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form 
                noValidate
                onSubmit={e => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  if (!form.checkValidity()) {
                    const primerInvalido = form.querySelector(':invalid') as HTMLInputElement | HTMLTextAreaElement | null;
                    if (primerInvalido) {
                      primerInvalido.focus();
                      let mensaje = 'Por favor, completa los campos obligatorios (*).';
                      if (primerInvalido.type === 'email' && primerInvalido.value) {
                        mensaje = 'Por favor, ingresa un correo electrónico válido.';
                      }
                      setError(mensaje);
                    }
                    return;
                  }
                  handleSubmit(e);
                }} 
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', fontSize: '0.875rem' }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>Nombre *</label>
                    <input name="nombre" type="text" required placeholder="Tu nombre" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>Email *</label>
                    <input name="email" type="email" required placeholder="tu@email.com" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>Teléfono</label>
                  <input name="telefono" type="tel" placeholder="Opcional" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>Mensaje *</label>
                  <textarea name="mensaje" required rows={5} placeholder="¿En qué podemos ayudarte?" style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isPending} className="btn-primary" style={{ opacity: isPending ? 0.7 : 1, paddingLeft: '32px', paddingRight: '32px' }}>
                    {isPending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .contacto-grid { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </main>
  );
}
