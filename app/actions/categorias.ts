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

function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function getCategorias() {
  const admin = createAdminClient();
  const { data } = await admin.from('categorias').select('*').eq('activa', true).order('orden');
  return data || [];
}

export async function getCategoriasAdmin() {
  const admin = createAdminClient();
  const { data } = await admin.from('categorias').select('*').order('orden');
  return { data: data || [] };
}

export async function crearCategoria(payload: { nombre: string; descripcion?: string }) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const admin = createAdminClient();
  const slug = generarSlug(payload.nombre);

  const { data: maxOrden } = await admin
    .from('categorias')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();
  const orden = (maxOrden?.orden ?? 0) + 1;

  const { data, error } = await admin
    .from('categorias')
    .insert({ ...payload, slug, orden })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/tienda');
  revalidatePath('/admin/categorias');
  return { data };
}

export async function actualizarCategoria(id: string, payload: {
  nombre?: string;
  descripcion?: string;
  activa?: boolean;
  orden?: number;
}) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const admin = createAdminClient();
  const { data, error } = await admin.from('categorias').update(payload).eq('id', id).select().single();
  if (error) return { error: error.message };
  revalidatePath('/tienda');
  revalidatePath('/admin/categorias');
  return { data };
}

export async function eliminarCategoria(id: string) {
  if (!(await isAdmin())) return { error: 'No autorizado' };
  const admin = createAdminClient();
  const { error } = await admin.from('categorias').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/tienda');
  revalidatePath('/admin/categorias');
  return { ok: true };
}
