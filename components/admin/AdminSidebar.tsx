'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
};

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Resumen',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/productos',
    label: 'Productos',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/admin/categorias',
    label: 'Categorías',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: '/admin/pedidos',
    label: 'Pedidos',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/admin/visitas',
    label: 'Visitas en Vivo',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    href: '/admin/contenido',
    label: 'Editar Contenido',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/admin/legal',
    label: 'Textos Legales',
    roles: ['propietario', 'administrador'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    roles: ['propietario'],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({
  role,
  nombre,
}: {
  role: string;
  nombre: string;
}) {
  const pathname = usePathname();
  const allowedItems = navItems.filter(item => item.roles.includes(role));

  const badge =
    role === 'propietario'
      ? { label: 'Propietario', color: '#9B6F2F', bg: '#FBF6EE' }
      : { label: 'Administrador', color: '#1d4ed8', bg: '#dbeafe' };

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#141414',
      borderRight: '1px solid rgba(155,111,47,0.2)',
      color: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      zIndex: 40,
    }}>
      {/* Logo area */}
      <div style={{
        padding: '24px 24px 20px',
        borderBottom: '1px solid rgba(155,111,47,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Image
          src="/logo.png"
          alt="OrLamps"
          width={130}
          height={38}
          style={{ height: '34px', width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Subtítulo admin */}
      <div style={{
        padding: '10px 24px',
        borderBottom: '1px solid rgba(155,111,47,0.1)',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9B6F2F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Panel de Administración
        </div>
      </div>

      {/* User info */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(155,111,47,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: badge.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, color: badge.color, fontSize: '1.1rem',
          flexShrink: 0,
        }}>
          {nombre?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f3f4f6' }}>{nombre || 'Admin'}</div>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, color: badge.color,
            backgroundColor: badge.bg, padding: '2px 8px', borderRadius: '20px',
          }}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {allowedItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px', marginBottom: '4px',
                color: isActive ? '#C49A4A' : '#9ca3af',
                backgroundColor: isActive ? 'rgba(155,111,47,0.15)' : 'transparent',
                textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid #9B6F2F' : '3px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(155,111,47,0.1)', backgroundColor: '#141414' }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem',
            fontWeight: 600, transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C49A4A')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#9ca3af')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ver tienda
        </a>
      </div>
    </aside>
  );
}
