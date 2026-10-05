'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function isAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return data && ['propietario', 'administrador'].includes(data.role);
}

export async function getContenido() {
  const admin = createAdminClient();
  const { data } = await admin.from('contenido_sitio').select('*');
  const map: Record<string, string> = {};
  data?.forEach((item: { clave: string; valor: string }) => { map[item.clave] = item.valor; });
  return map;
}

export async function actualizarContenido(clave: string, valor: string) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const admin = createAdminClient();
  const { error } = await admin.from('contenido_sitio').upsert({ clave, valor, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/quienes-somos');
  revalidatePath('/contacto');
  return { ok: true };
}

export async function actualizarMultipleContenido(cambios: Record<string, string>) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  // Validación de la configuración de IVA
  if ('iva_porcentaje' in cambios) {
    const n = Number(String(cambios.iva_porcentaje).replace(',', '.').trim());
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      return { error: 'El IVA debe ser un número entre 0 y 100.' };
    }
    cambios.iva_porcentaje = String(n);
  }
  if ('precios_incluyen_iva' in cambios && !['si', 'no', 'sin_iva'].includes(cambios.precios_incluyen_iva)) {
    return { error: 'Valor inválido en Modalidad de precios.' };
  }
  if ('payphone_recargo_porcentaje' in cambios) {
    const r = Number(String(cambios.payphone_recargo_porcentaje || '0').replace(',', '.').trim());
    if (!Number.isFinite(r) || r < 0 || r > 30) {
      return { error: 'El recargo por tarjeta debe ser un número entre 0 y 30.' };
    }
    cambios.payphone_recargo_porcentaje = String(r);
  }

  const admin = createAdminClient();
  const rows = Object.entries(cambios).map(([clave, valor]) => ({
    clave,
    valor,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await admin.from('contenido_sitio').upsert(rows);
  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/quienes-somos');
  revalidatePath('/contacto');
  revalidatePath('/tienda', 'layout');
  return { ok: true };
}
