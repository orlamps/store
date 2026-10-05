import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión — OrLamps',
};

/**
 * Layout exclusivo para /login.
 * No hereda Header ni Footer del root layout —
 * Next.js usa el layout más cercano a la ruta.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}
