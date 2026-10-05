'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const DEFAULT_SECURITY_PASSWORD = '#2026-S@';
const ROLES_VALIDOS = ['administrador', 'propietario'];

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Obtener la contraseña de seguridad maestra de la base de datos
export async function getMasterPassword() {
  const admin = createAdminClient();
  const { data } = await admin.from('contenido_sitio').select('valor').eq('clave', 'master_security_password').single();
  return data?.valor || DEFAULT_SECURITY_PASSWORD;
}

// ── Cifrado de las contraseñas de los usuarios ──
async function derivarLlave() {
  const master = await getMasterPassword();
  return createHash('sha256')
    .update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}::${master}`)
    .digest();
}

async function cifrar(texto: string): Promise<string> {
  const iv = randomBytes(12);
  const key = await derivarLlave();
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

async function descifrar(valor: string): Promise<string | null> {
  try {
    const buf = Buffer.from(valor, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const key = await derivarLlave();
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// ── Autorización: SOLO propietario ──
async function getPropietario() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'propietario' ? user : null;
}

async function autorizar(claveSeguridad: string) {
  const propietario = await getPropietario();
  if (!propietario) return { ok: false as const, error: 'No autorizado. Solo el propietario puede gestionar usuarios.' };
  
  const masterReal = await getMasterPassword();
  if (claveSeguridad !== masterReal) return { ok: false as const, error: 'Contraseña de seguridad incorrecta.' };
  
  return { ok: true as const, user: propietario };
}

// Cambiar la contraseña maestra de seguridad
export async function cambiarMasterPassword(nuevaClave: string, claveSeguridad: string) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };

  const admin = createAdminClient();
  const { error } = await admin.from('contenido_sitio').upsert({ clave: 'master_security_password', valor: nuevaClave, updated_at: new Date().toISOString() });
  
  if (error) return { error: error.message };
  return { ok: true };
}

// Ver la contraseña maestra actual
export async function verMasterPassword(claveSeguridad: string) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };
  return { ok: true, password: await getMasterPassword() };
}

export async function getUsuariosAdmin() {
  if (!(await getPropietario())) {
    return { error: 'No autorizado. Solo el propietario puede ver los usuarios.', data: [] };
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, nombre, apellido, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function crearUsuario(
  payload: { nombre: string; email: string; password: string; role: string },
  claveSeguridad: string
) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };

  const nombre = payload.nombre.trim();
  const email = payload.email.trim().toLowerCase();
  if (!nombre || !email || !payload.password) return { error: 'Completa nombre, correo y contraseña.' };
  if (payload.password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  if (!ROLES_VALIDOS.includes(payload.role)) return { error: 'Rol no válido.' };

  const admin = createAdminClient();
  const pwdEnc = await cifrar(payload.password);
  
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { nombre },
    app_metadata: { pwd_enc: pwdEnc },
  });
  if (error || !data.user) return { error: error?.message || 'No se pudo crear el usuario.' };

  const { error: perfilError } = await admin.from('profiles').upsert({
    id: data.user.id,
    nombre,
    email,
    role: payload.role,
  });
  if (perfilError) return { error: perfilError.message };

  revalidatePath('/admin/usuarios');
  return {
    ok: true,
    usuario: { id: data.user.id, nombre, apellido: null, email, role: payload.role, created_at: new Date().toISOString() },
  };
}

export async function editarUsuario(
  id: string,
  payload: { nombre: string; email: string; role: string },
  claveSeguridad: string
) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };

  const nombre = payload.nombre.trim();
  const email = payload.email.trim().toLowerCase();
  if (!nombre || !email) return { error: 'Completa nombre y correo.' };
  if (!ROLES_VALIDOS.includes(payload.role)) return { error: 'Rol no válido.' };
  if (id === auth.user.id && payload.role !== 'propietario') {
    return { error: 'No puedes quitarte a ti mismo el rol de propietario.' };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
    user_metadata: { nombre },
  });
  if (error) return { error: error.message };

  const { error: perfilError } = await admin.from('profiles').update({ nombre, email, role: payload.role }).eq('id', id);
  if (perfilError) return { error: perfilError.message };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function verContrasena(id: string, claveSeguridad: string) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error || !data.user) return { error: error?.message || 'Usuario no encontrado.' };

  const enc = (data.user.app_metadata as any)?.pwd_enc as string | undefined;
  const pass = enc ? await descifrar(enc) : null;
  if (!pass) {
    return { error: 'Este usuario fue creado antes de este sistema. Usa "Cambiar contraseña" para registrar una nueva y poder verla después.' };
  }
  return { ok: true, password: pass };
}

export async function cambiarContrasena(id: string, nuevaContrasena: string, claveSeguridad: string) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };
  if (!nuevaContrasena || nuevaContrasena.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' };

  const admin = createAdminClient();
  const { data: actual } = await admin.auth.admin.getUserById(id);
  const pwdEnc = await cifrar(nuevaContrasena);
  
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: nuevaContrasena,
    app_metadata: { ...(actual?.user?.app_metadata || {}), pwd_enc: pwdEnc },
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function eliminarUsuario(id: string, claveSeguridad: string) {
  const auth = await autorizar(claveSeguridad);
  if (!auth.ok) return { error: auth.error };
  if (id === auth.user.id) return { error: 'No puedes eliminar tu propia cuenta.' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };
  await admin.from('profiles').delete().eq('id', id);

  revalidatePath('/admin/usuarios');
  return { ok: true };
}