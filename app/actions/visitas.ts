'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getMetricasVisitas() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { error: 'No autorizado', hoy: 0, semana: 0, mes: 0, enLinea: 0 };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['propietario', 'administrador'].includes(profile.role)) {
    return { error: 'No autorizado', hoy: 0, semana: 0, mes: 0, enLinea: 0 };
  }

  const now = new Date();

  const limitePing = new Date(now.getTime() - 60000).toISOString();
  await adminClient
    .from('visitas')
    .update({ activo: false, ended_at: new Date().toISOString() })
    .eq('activo', true)
    .lt('ultimo_ping', limitePing);

  const inicioHoy = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const diaSemana = now.getDay();
  const diffLunes = (diaSemana === 0 ? -6 : 1) - diaSemana;
  const lunes = new Date(now);
  lunes.setDate(now.getDate() + diffLunes);
  lunes.setHours(0, 0, 0, 0);
  const inicioSemana = lunes.toISOString();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();

  const [resHoy, resSemana, resMes, resEnLinea] = await Promise.all([
    adminClient.from('visitas').select('*', { count: 'exact', head: true }).gte('started_at', inicioHoy),
    adminClient.from('visitas').select('*', { count: 'exact', head: true }).gte('started_at', inicioSemana),
    adminClient.from('visitas').select('*', { count: 'exact', head: true }).gte('started_at', inicioMes),
    adminClient.from('visitas').select('*', { count: 'exact', head: true }).eq('activo', true).gte('ultimo_ping', limitePing),
  ]);

  return {
    hoy: resHoy.count || 0,
    semana: resSemana.count || 0,
    mes: resMes.count || 0,
    enLinea: resEnLinea.count || 0,
  };
}

export async function getHistorialVisitas(page: number, limit: number = 25) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { error: 'No autorizado', data: [], count: 0 };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['propietario', 'administrador'].includes(profile.role)) {
    return { error: 'No autorizado', data: [], count: 0 };
  }

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, count, error } = await adminClient
    .from('visitas')
    .select('id, session_id, user_id, pagina, pais, ciudad, referrer, user_agent, activo, ultimo_ping, started_at, ended_at, duracion_seg', { count: 'exact' })
    .eq('activo', false)
    .order('ended_at', { ascending: false, nullsFirst: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching historial:', error);
    return { error: error.message, data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

// ── Eliminar visitas específicas del historial (solo propietario) ──
export async function eliminarVisitas(ids: string[]) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'propietario') return { error: 'Solo el propietario puede eliminar el historial de visitas.' };

  const { error } = await adminClient.from('visitas').delete().in('id', ids);
  if (error) return { error: error.message };
  return { ok: true };
}

// ── Limpiar todo el historial (solo propietario) ──
export async function eliminarTodasVisitas() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'propietario') return { error: 'Solo el propietario puede limpiar el historial de visitas.' };

  const { error } = await adminClient.from('visitas').delete().eq('activo', false);
  if (error) return { error: error.message };
  return { ok: true };
}
