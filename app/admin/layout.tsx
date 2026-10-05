import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNotificaciones from '@/components/admin/AdminNotificaciones';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Panel Admin — OrLamps',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  let role = '';
  let nombre = '';

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role,nombre&limit=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        role = data[0].role || '';
        nombre = data[0].nombre || '';
      }
    }
  } catch (e) {
    console.error('[ADMIN LAYOUT] Error leyendo perfil:', e);
  }

  if (!role || !['propietario', 'administrador'].includes(role)) {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'stretch' }}>
      <AdminSidebar role={role} nombre={nombre} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          height: '60px', 
          backgroundColor: '#fff', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <AdminNotificaciones />
        </header>
        <div style={{ padding: '40px 32px', flex: 1 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
