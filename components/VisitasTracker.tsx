'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitasTracker({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const visitaIdRef = useRef<string | null>(null);
  const pageLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    // Si estamos en /admin o /login no rastreamos
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
      return;
    }

    // Para evitar múltiples registros en Strict Mode o re-renders rápidos de la misma página
    if (pageLoadedRef.current === pathname) {
      return;
    }
    pageLoadedRef.current = pathname;

    // Generar o recuperar session_id
    let sessionId = sessionStorage.getItem('orlamps_session_id');
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('orlamps_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;

    const referrer = document.referrer || '';
    const userAgent = navigator.userAgent;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const language = navigator.language || '';

    let currentVisitaId: string | null = null;

    // Función para crear la visita
    const crearVisita = async () => {
      try {
        const res = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId || null,
            pagina: pathname,
            referrer,
            user_agent: userAgent,
            timezone,
            language,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            currentVisitaId = data.id;
            visitaIdRef.current = data.id;
          }
        }
      } catch {
        // silencioso
      }
    };

    crearVisita();

    // Ping cada 30 segundos al servidor
    intervalRef.current = setInterval(async () => {
      if (!currentVisitaId) return;
      try {
        await fetch('/api/track', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentVisitaId }),
        });
      } catch { /* silencioso */ }
    }, 30000);

    // Cerrar la visita actual al desmontar o cambiar de ruta
    const cerrarVisita = () => {
      if (!currentVisitaId) return;
      const payload = JSON.stringify({
        id: currentVisitaId,
        activo: false,
        ended_at: new Date().toISOString(),
      });
      navigator.sendBeacon('/api/track-close', payload);
      // Limpiamos referencias para la próxima
      currentVisitaId = null;
      if (visitaIdRef.current === currentVisitaId) {
        visitaIdRef.current = null;
      }
    };

    window.addEventListener('beforeunload', cerrarVisita);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', cerrarVisita);
      cerrarVisita();
      pageLoadedRef.current = null; // resetear para permitir montar otra vez
    };
  }, [pathname, userId]);

  return null;
}
