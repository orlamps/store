'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getHistorialVisitas, getMetricasVisitas, eliminarVisitas, eliminarTodasVisitas } from '@/app/actions/visitas';

type Visita = {
  id: string;
  session_id: string;
  user_id: string | null;
  pagina: string;
  pais: string;
  ciudad: string;
  referrer: string;
  user_agent: string;
  activo: boolean;
  ultimo_ping: string;
  started_at: string;
  ended_at: string | null;
  duracion_seg: number | null;
};

interface Metricas { hoy: number; semana: number; mes: number; enLinea: number; }

const ITEMS_PER_PAGE = 25;

function fmt(seg: number) {
  if (seg < 60) return `${Math.floor(seg)}s`;
  const m = Math.floor(seg / 60), s = Math.floor(seg % 60);
  return `${m}m ${s}s`;
}

export default function AdminRealtimeVisitas({ initialVisitas, role }: { initialVisitas: Visita[]; role: string }) {
  const [visitas, setVisitas] = useState<Visita[]>(initialVisitas);
  const [ahora, setAhora] = useState<number>(Date.now());
  const [historial, setHistorial] = useState<Visita[]>([]);
  const [totalHistorial, setTotalHistorial] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [metricas, setMetricas] = useState<Metricas>({ hoy: 0, semana: 0, mes: 0, enLinea: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const loadMetricas = async () => {
    const data = await getMetricasVisitas();
    if (data && !('error' in data)) setMetricas({ hoy: data.hoy || 0, semana: data.semana || 0, mes: data.mes || 0, enLinea: data.enLinea || 0 });
  };

  const loadHistory = async (p: number) => {
    setIsLoadingHistory(true);
    const { data, count } = await getHistorialVisitas(p, ITEMS_PER_PAGE);
    if (data) { setHistorial(data as Visita[]); setTotalHistorial(count || 0); }
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    loadMetricas();
    loadHistory(1);
    const metricasInterval = setInterval(loadMetricas, 15000);
    return () => clearInterval(metricasInterval);
  }, []);

  useEffect(() => { if (page > 1) loadHistory(page); }, [page]);
  useEffect(() => { const t = setInterval(() => setAhora(Date.now()), 1000); return () => clearInterval(t); }, []);

  // Realtime suscription
  useEffect(() => {
    if (!['propietario', 'administrador'].includes(role)) return;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const channel = supabase.channel('realtime_visitas_orlamps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitas' }, (payload) => {
        const nueva = payload.new as Visita;
        setVisitas(prev => {
          if (payload.eventType === 'INSERT') return prev.some(v => v.id === nueva.id) ? prev : [nueva, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map(v => v.id === nueva.id ? { ...v, ...nueva } : v);
          if (payload.eventType === 'DELETE') return prev.filter(v => v.id !== (payload.old as Visita).id);
          return prev;
        });
        loadMetricas();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [role]);

  if (!['propietario', 'administrador'].includes(role)) return null;

  const activas = visitas
    .filter(v => v.activo && (ahora - new Date(v.ultimo_ping).getTime() < 70000))
    .sort((a, b) => new Date(b.ultimo_ping).getTime() - new Date(a.ultimo_ping).getTime());

  const totalPages = Math.ceil(totalHistorial / ITEMS_PER_PAGE);

  function toggleAll() {
    if (selectedIds.size === historial.length && historial.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(historial.map(v => v.id)));
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  function handleEliminarSeleccionados() {
    if (selectedIds.size === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.size} registro(s) del historial?`)) return;
    startTransition(async () => {
      await eliminarVisitas(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadHistory(page);
    });
  }

  function handleLimpiarTodo() {
    if (!confirm('¿Limpiar todo el historial de visitas? Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      await eliminarTodasVisitas();
      setSelectedIds(new Set());
      setPage(1);
      await loadHistory(1);
    });
  }

  return (
    <div>
      {/* ── CONTADORES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { valor: activas.length, label: 'En línea ahora', color: '#059669', bg: '#ecfdf5', dot: true },
          { valor: metricas.hoy, label: 'Hoy', color: '#9B6F2F', bg: '#FBF6EE', dot: false },
          { valor: metricas.semana, label: 'Esta Semana', color: '#2563eb', bg: '#eff6ff', dot: false },
          { valor: metricas.mes, label: 'Este Mes', color: '#7c3aed', bg: '#f5f3ff', dot: false },
        ].map(({ valor, label, color, bg, dot }) => (
          <div key={label} style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {dot ? (
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, animation: 'pulse-green 1.8s ease-in-out infinite' }} />
              ) : (
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#141414', lineHeight: 1 }}>{valor}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color, marginTop: '4px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ACTIVOS AHORA ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse-green 1.8s ease-in-out infinite' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#141414' }}>Visitantes Activos ({activas.length})</span>
        <div style={{ height: '1px', flex: 1, backgroundColor: '#e5e7eb' }} />
      </div>

      {activas.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '32px 24px', textAlign: 'center', border: '1px dashed #d1d5db', color: '#9ca3af', fontSize: '0.9rem', marginBottom: '36px' }}>
          No hay visitantes navegando en la tienda en este momento.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
          {activas.map(v => {
            const duracion = Math.max(1, (ahora - new Date(v.started_at).getTime()) / 1000);
            return (
              <div key={v.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse-green 1.8s ease-in-out infinite', flexShrink: 0 }} />
                <div style={{ flex: 1.2, minWidth: '180px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#141414' }}>{v.pais || 'Ecuador'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {v.ciudad || 'Zona Local'}
                  </div>
                </div>
                <div style={{ flex: 2, minWidth: '160px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Página visitada</div>
                  <code style={{ fontSize: '0.84rem', color: '#9B6F2F', fontWeight: 600, backgroundColor: '#FBF6EE', padding: '2px 8px', borderRadius: '6px' }}>{v.pagina}</code>
                </div>
                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>Tiempo activo</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>{fmt(duracion)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── HISTORIAL ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#141414' }}>Historial de Visitas Finalizadas</span>
          <div style={{ height: '1px', width: '60px', backgroundColor: '#e5e7eb' }} />
        </div>
        {role === 'propietario' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedIds.size > 0 && (
              <button onClick={handleEliminarSeleccionados} disabled={isPending} style={{ padding: '7px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar ({selectedIds.size})
              </button>
            )}
            {totalHistorial > 0 && (
              <button onClick={handleLimpiarTodo} disabled={isPending} style={{ padding: '7px 14px', backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                Limpiar todo
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
        {historial.length === 0 && !isLoadingHistory ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>No hay visitas registradas en el historial.</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', opacity: isLoadingHistory ? 0.6 : 1, transition: 'opacity 0.2s', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                  {role === 'propietario' && (
                    <th style={{ padding: '12px 16px', width: '40px' }}>
                      <input type="checkbox" checked={selectedIds.size === historial.length && historial.length > 0} onChange={toggleAll} style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }} />
                    </th>
                  )}
                  {['País', 'Ciudad / Zona', 'Página', 'Duración', 'Fecha y Hora'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: i < historial.length - 1 ? '1px solid #f9fafb' : 'none', backgroundColor: selectedIds.has(v.id) ? '#fafafa' : 'transparent' }}>
                    {role === 'propietario' && (
                      <td style={{ padding: '14px 16px' }}>
                        <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleOne(v.id)} style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }} />
                      </td>
                    )}
                    <td style={{ padding: '14px 16px', fontSize: '0.88rem', fontWeight: 600, color: '#141414' }}>{v.pais || 'Ecuador'}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.84rem', color: '#6b7280' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {v.ciudad || 'Zona Local'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ fontSize: '0.82rem', color: '#141414', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{v.pagina}</code>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>{fmt(v.duracion_seg || 0)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>
                      {v.started_at ? new Date(v.started_at).toLocaleString('es-EC', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalHistorial)} de {totalHistorial} visitas
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setPage(p => Math.max(1, p - 1)); setSelectedIds(new Set()); }} disabled={page === 1 || isLoadingHistory} style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '6px 12px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>Pág. {page} / {totalPages}</span>
                  <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); setSelectedIds(new Set()); }} disabled={page >= totalPages || isLoadingHistory} style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '6px 12px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.25); transform: scale(1); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.08); transform: scale(1.08); }
        }
      ` }} />
    </div>
  );
}
