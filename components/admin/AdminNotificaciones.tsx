'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Notificacion = {
  id: string;
  tipo: 'pedido' | 'contacto';
  titulo: string;
  descripcion: string;
  tiempo: Date;
  leida: boolean;
};

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [animando, setAnimando] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  // Sonido de notificación usando Web Audio API (sin archivos externos)
  const reproducirSonido = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      
      // Secuencia de dos tonos (estilo campana)
      [[880, 0, 0.15], [1100, 0.18, 0.15]].forEach(([freq, delay, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq as number;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + (delay as number));
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + (delay as number) + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (delay as number) + (dur as number));
        osc.start(ctx.currentTime + (delay as number));
        osc.stop(ctx.currentTime + (delay as number) + (dur as number));
      });
    } catch {}
  }, []);

  const agregarNotificacion = useCallback((n: Omit<Notificacion, 'id' | 'tiempo' | 'leida'>) => {
    const nueva: Notificacion = {
      ...n,
      id: crypto.randomUUID(),
      tiempo: new Date(),
      leida: false,
    };
    setNotificaciones(prev => [nueva, ...prev].slice(0, 30));
    setAnimando(true);
    reproducirSonido();
    setTimeout(() => setAnimando(false), 600);
  }, [reproducirSonido]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [abierto]);

  // Subscripción a Supabase Realtime
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Canal para nuevos pedidos
    const canalPedidos = supabase
      .channel('admin-pedidos-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pedidos',
      }, (payload) => {
        const p = payload.new as any;
        agregarNotificacion({
          tipo: 'pedido',
          titulo: `Nuevo pedido ${p.numero || ''}`,
          descripcion: `${p.cliente_nombre || 'Cliente'} — $${Number(p.total || 0).toFixed(2)} · ${p.metodo_pago || ''}`,
        });
      })
      .subscribe();

    // Canal para formularios de contacto (si tienes tabla mensajes_contacto)
    // Puedes activarlo cuando crees esa tabla
    // const canalContacto = supabase
    //   .channel('admin-contacto-realtime')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes_contacto' }, ...)
    //   .subscribe();

    return () => {
      supabase.removeChannel(canalPedidos);
    };
  }, [agregarNotificacion]);

  function marcarTodasLeidas() {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  }

  function tiempoRelativo(fecha: Date): string {
    const seg = Math.floor((Date.now() - fecha.getTime()) / 1000);
    if (seg < 60) return 'Ahora';
    if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
    if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
    return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Botón campana */}
      <button
        onClick={() => {
          setAbierto(o => !o);
          if (!abierto) marcarTodasLeidas();
        }}
        title="Notificaciones"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#C49A4A'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
      >
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            transition: 'transform 0.15s',
            transform: animando ? 'rotate(-20deg)' : 'none',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge contador */}
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '16px',
            height: '16px',
            borderRadius: '999px',
            backgroundColor: '#dc2626',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
            border: '1.5px solid #141414',
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {abierto && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '340px',
          backgroundColor: '#1e1e1e',
          border: '1px solid rgba(155,111,47,0.25)',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {/* Header panel */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid rgba(155,111,47,0.15)',
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f3f4f6' }}>
              Notificaciones
            </div>
            {notificaciones.length > 0 && (
              <button
                onClick={marcarTodasLeidas}
                style={{ fontSize: '0.75rem', color: '#9B6F2F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Marcar todo leído
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notificaciones.length === 0 ? (
              <div style={{ padding: '32px 18px', textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Sin notificaciones aún
              </div>
            ) : (
              notificaciones.map(n => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    backgroundColor: n.leida ? 'transparent' : 'rgba(155,111,47,0.06)',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Icono */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: n.tipo === 'pedido' ? 'rgba(155,111,47,0.15)' : 'rgba(59,130,246,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: n.tipo === 'pedido' ? '#9B6F2F' : '#60a5fa',
                  }}>
                    {n.tipo === 'pedido' ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.titulo}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.5 }}>
                      {n.descripcion}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>
                      {tiempoRelativo(n.tiempo)}
                    </div>
                  </div>
                  {/* Punto no leída */}
                  {!n.leida && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9B6F2F', flexShrink: 0, marginTop: '4px' }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(155,111,47,0.1)', display: 'flex', justifyContent: 'center' }}>
              <a
                href="/admin/pedidos"
                onClick={() => setAbierto(false)}
                style={{ fontSize: '0.8rem', color: '#9B6F2F', textDecoration: 'none', fontWeight: 600 }}
              >
                Ver todos los pedidos →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
