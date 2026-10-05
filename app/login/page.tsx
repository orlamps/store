'use client';

import { useState, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const finalEmail = email.includes('@') ? email : email + '@orlamps.site';

      const { error: err } = await supabase.auth.signInWithPassword({ email: finalEmail, password });
      if (err) { setError('Usuario, correo o contraseña incorrectos.'); return; }
      window.location.href = '/admin';
    });
  }

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '420px', border: '1px solid #eaeaea', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image src="/logo.png" alt="OrLamps" width={160} height={48} style={{ height: '44px', width: 'auto', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9B6F2F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Panel de Administración
          </div>
        </div>

        <form 
          noValidate
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            if (!form.checkValidity()) {
              const primerInvalido = form.querySelector(':invalid') as HTMLInputElement | null;
              if (primerInvalido) {
                primerInvalido.focus();
                let mensaje = 'Por favor, completa este campo obligatorio.';
                if (primerInvalido.type === 'email' && primerInvalido.value) {
                  mensaje = 'Por favor, ingresa un correo electrónico válido.';
                }
                setError(mensaje);
              }
              return;
            }
            handleLogin(e);
          }} 
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@orlamps.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: '#9B6F2F', width: '15px', height: '15px', cursor: 'pointer' }} 
            />
            <label htmlFor="remember" style={{ fontSize: '0.85rem', color: '#141414', cursor: 'pointer', userSelect: 'none' }}>
              Recordar mi inicio de sesión
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{ padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, transition: 'background-color 0.2s' }}
          >
            {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: '#141414', textDecoration: 'none', fontWeight: 500 }}>
            ← Volver a la tienda
          </a>
        </div>
      </div>
    </main>
  );
}