import { createSupabaseServerClient } from '@/lib/supabase/server';
import AdminRealtimeVisitas from '@/components/admin/AdminRealtimeVisitas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'Visitas en Vivo — Admin OrLamps' };

export default async function AdminVisitasPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  const [profileRes, visitasRes] = await Promise.allSettled([
    fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role&limit=1`, { headers, cache: 'no-store' }),
    fetch(`${supabaseUrl}/rest/v1/visitas?select=id,session_id,user_id,pagina,pais,ciudad,referrer,user_agent,activo,ultimo_ping,started_at,ended_at,duracion_seg&order=ultimo_ping.desc&limit=50`, { headers, cache: 'no-store' }),
  ]);

  let myRole = '';
  let initialVisitas: any[] = [];

  if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
    const d = await profileRes.value.json();
    myRole = d?.[0]?.role || '';
  }
  if (visitasRes.status === 'fulfilled' && visitasRes.value.ok) {
    initialVisitas = await visitasRes.value.json();
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>
        Visitas en Vivo
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '0.95rem' }}>
        Monitoriza en tiempo real la actividad de los visitantes en tu tienda.
      </p>
      <AdminRealtimeVisitas initialVisitas={initialVisitas} role={myRole} />
    </div>
  );
}
