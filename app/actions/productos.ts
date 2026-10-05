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

async function getAuthUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function isAdmin() {
  const user = await getAuthUser();
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

// La fecha de disponibilidad (producto en producción) se guarda en contenido_sitio
// con la clave `fecha_disp_<id>`; vacío = sin fecha.
async function guardarFechaDisponibilidad(admin: ReturnType<typeof createAdminClient>, id: string, fecha?: string | null) {
  if (fecha === undefined) return;
  await admin.from('contenido_sitio').upsert({
    clave: `fecha_disp_${id}`,
    valor: fecha || '',
    updated_at: new Date().toISOString(),
  });
}

export async function crearProducto(payload: {
  nombre: string;
  descripcion?: string;
  contenido?: string;
  precio: number;
  precio_oferta?: number | null;
  imagen_url?: string;
  imagenes?: string[];
  categoria_id?: string | null;
  stock?: number;
  disponible?: boolean;
  destacado?: boolean;
  variantes?: any[];
  fecha_disponibilidad?: string | null;
}) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const { fecha_disponibilidad, ...campos } = payload;
  const admin = createAdminClient();
  let slug = generarSlug(campos.nombre);

  const { data: existing } = await admin.from('productos').select('slug').like('slug', `${slug}%`);
  if (existing && existing.length > 0) {
    slug = `${slug}-${existing.length + 1}`;
  }

  const { data, error } = await admin.from('productos').insert({
    ...campos,
    slug,
  }).select().single();

  if (error) return { error: error.message };
  await guardarFechaDisponibilidad(admin, data.id, fecha_disponibilidad);
  revalidatePath('/tienda');
  revalidatePath('/admin/productos');
  return { data, slug: data.slug };
}

export async function actualizarProducto(id: string, payload: {
  nombre?: string;
  descripcion?: string;
  contenido?: string;
  precio?: number;
  precio_oferta?: number | null;
  imagen_url?: string;
  imagenes?: string[];
  categoria_id?: string | null;
  stock?: number;
  disponible?: boolean;
  destacado?: boolean;
  variantes?: any[];
  fecha_disponibilidad?: string | null;
}) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const { fecha_disponibilidad, ...campos } = payload;
  const admin = createAdminClient();
  const { data, error } = await admin.from('productos').update(campos).eq('id', id).select().single();

  if (error) return { error: error.message };
  await guardarFechaDisponibilidad(admin, id, fecha_disponibilidad);
  revalidatePath('/tienda');
  revalidatePath('/tienda/' + data.slug);
  revalidatePath('/admin/productos');
  return { data };
}

export async function eliminarProducto(id: string) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const admin = createAdminClient();
  const { error } = await admin.from('productos').delete().eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/tienda');
  revalidatePath('/admin/productos');
  return { ok: true };
}

export async function subirImagenProducto(formData: FormData) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const file = formData.get('file') as File;
  if (!file) return { error: 'No se recibió imagen' };

  const admin = createAdminClient();
  const ext = file.name.split('.').pop();
  const filename = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from('orlamps').upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = admin.storage.from('orlamps').getPublicUrl(filename);
  return { url: publicUrl };
}

export async function getProductosAdmin() {
  if (!(await isAdmin())) return { error: 'No autorizado', data: [] };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('productos')
    .select('*, categorias(nombre)')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: [] };

  const { data: fechas } = await admin.from('contenido_sitio').select('clave, valor').like('clave', 'fecha_disp_%');
  const mapa: Record<string, string> = {};
  fechas?.forEach(f => { mapa[f.clave.replace('fecha_disp_', '')] = f.valor; });

  return { data: (data || []).map(p => ({ ...p, fecha_disponibilidad: mapa[p.id] || '' })) };
}
