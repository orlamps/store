import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'count=exact',
  };

  const [productosRes, pedidosPendientesRes, visitasHoyRes] = await Promise.allSettled([
    fetch(`${supabaseUrl}/rest/v1/productos?select=id`, { headers: { ...headers }, cache: 'no-store' }),
    fetch(`${supabaseUrl}/rest/v1/pedidos?estado=eq.pendiente&select=id`, { headers: { ...headers }, cache: 'no-store' }),
    fetch(`${supabaseUrl}/rest/v1/visitas?started_at=gte.${new Date(Date.now() - 86400000).toISOString()}&select=id`, { headers: { ...headers }, cache: 'no-store' }),
  ]);

  const getCount = (res: PromiseSettledResult<Response>) => {
    if (res.status !== 'fulfilled') return 0;
    const cr = res.value.headers.get('content-range');
    return cr ? parseInt(cr.split('/')[1]) || 0 : 0;
  };

  const stats = [
    {
      label: 'Productos Activos',
      value: getCount(productosRes),
      color: '#9B6F2F',
      bg: '#FBF6EE',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Pedidos Pendientes',
      value: getCount(pedidosPendientesRes),
      color: '#dc2626',
      bg: '#fef2f2',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Visitas (24h)',
      value: getCount(visitasHoyRes),
      color: '#059669',
      bg: '#ecfdf5',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    {
      href: '/admin/productos',
      label: 'Gestionar Productos',
      desc: 'Agregar, editar o eliminar productos del catálogo',
      color: '#9B6F2F',
      bg: '#FBF6EE',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/admin/categorias',
      label: 'Categorías',
      desc: 'Crear y organizar categorías de productos',
      color: '#7c3aed',
      bg: '#f3e8ff',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      href: '/admin/pedidos',
      label: 'Pedidos',
      desc: 'Ver y gestionar pedidos de clientes',
      color: '#dc2626',
      bg: '#fef2f2',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: '/admin/visitas',
      label: 'Visitas en Vivo',
      desc: 'Monitoriza visitantes en tiempo real',
      color: '#059669',
      bg: '#ecfdf5',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      href: '/admin/contenido',
      label: 'Editar Contenido',
      desc: 'Modificar textos del sitio sin código',
      color: '#0891b2',
      bg: '#ecfeff',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>
        Panel OrLamps
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '36px', fontSize: '1rem' }}>
        Vista general del estado de tu tienda
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              backgroundColor: stat.bg, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#141414', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9ca3af', marginTop: '5px' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#141414', marginBottom: '18px' }}>
        Accesos Rápidos
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {quickLinks.map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="admin-quick-card"
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#141414', marginBottom: '6px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: '1.5' }}>
              {card.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
