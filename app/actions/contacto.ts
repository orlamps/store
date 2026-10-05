'use server';

import { emailNuevoContacto, emailConfirmacionContacto } from '@/lib/email';

export async function enviarContacto(formData: FormData) {
  const nombre = (formData.get('nombre') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const telefono = (formData.get('telefono') as string)?.trim();
  const mensaje = (formData.get('mensaje') as string)?.trim();

  if (!nombre || !email || !mensaje) {
    return { error: 'Por favor completa todos los campos obligatorios.' };
  }
  if (!email.includes('@')) {
    return { error: 'Por favor ingresa un correo electrónico válido.' };
  }

  try {
    // Enviar en paralelo: aviso a OrLamps + confirmación al cliente
    await Promise.all([
      emailNuevoContacto({ nombre, email, telefono, mensaje }),
      emailConfirmacionContacto({ nombre, email }),
    ]);
    return { ok: true };
  } catch (error) {
    console.error('[Contacto] Error enviando emails:', error);
    return { error: 'Ocurrió un error al enviar tu mensaje. Por favor intenta de nuevo.' };
  }
}
