import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Actualizar sesión de Supabase
  const res = await updateSession(request);
  
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  const isDev = process.env.NODE_ENV === 'development';
  // Comprueba si el host empieza por "admin."
  const isAdminDomain = hostname.startsWith('admin.');

  // 2. Reglas de Subdominio
  if (!isDev) {
    // Si NO es el subdominio admin, ocultar las rutas /admin y /login
    if (!isAdminDomain && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/login'))) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Si es el subdominio admin, redirigir la raíz (/) directamente a /admin
    if (isAdminDomain && url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
