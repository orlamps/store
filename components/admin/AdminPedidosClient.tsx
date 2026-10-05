'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarEstadoPedido, eliminarPedidos } from '@/app/actions/pedidos';

type Pedido = {
  id: string;
  numero: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono?: string;
  items: any[];
  total: number;
  metodo_pago: string;
  estado: string;
  created_at: string;
  notas?: string;
};

const COMISION_PAYPHONE = 0.05 * 1.15;

const ESTADOS = ['pendiente', 'pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
const ESTADO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:      { label: 'Pendiente',     color: '#d97706', bg: '#fffbeb' },
  pagado:         { label: 'Pagado',         color: '#059669', bg: '#ecfdf5' },
  en_preparacion: { label: 'En preparación', color: '#0891b2', bg: '#ecfeff' },
  enviado:        { label: 'Enviado',        color: '#7c3aed', bg: '#f3e8ff' },
  entregado:      { label: 'Entregado',      color: '#15803d', bg: '#f0fdf4' },
  cancelado:      { label: 'Cancelado',      color: '#dc2626', bg: '#fef2f2' },
};

export default function AdminPedidosClient({ pedidos, role }: { pedidos: Pedido[], role: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filtro, setFiltro] = useState('todos');
  const [detalleId, setDetalleId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const itemsPerPage = 25;

  // Filtrado
  const filtrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);
  
  // Paginación
  const totalPages = Math.ceil(filtrados.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginated = filtrados.slice(startIndex, startIndex + itemsPerPage);

  const pedidoDetalle = pedidos.find(p => p.id === detalleId);

  async function cambiarEstado(id: string, estado: string) {
    startTransition(async () => {
      await actualizarEstadoPedido(id, estado);
      router.refresh();
    });
  }

  function toggleAll() {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(p => p.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function handleEliminarSeleccionados() {
    if (selectedIds.size === 0) return;
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.size} pedido(s)? Esta acción no se puede deshacer.`)) return;

    startTransition(async () => {
      await eliminarPedidos(Array.from(selectedIds));
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>Pedidos</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} en total</p>
        </div>
        
        {role === 'propietario' && selectedIds.size > 0 && (
          <button 
            onClick={handleEliminarSeleccionados} 
            disabled={isPending}
            style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Eliminar ({selectedIds.size})
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['todos', ...ESTADOS].map(e => (
          <button key={e} onClick={() => { setFiltro(e); setPage(1); setSelectedIds(new Set()); }} style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderColor: filtro === e ? '#9B6F2F' : '#e5e7eb', backgroundColor: filtro === e ? '#FBF6EE' : '#fff', color: filtro === e ? '#9B6F2F' : '#6b7280' }}>
            {e === 'todos' ? 'Todos' : ESTADO_LABELS[e]?.label || e}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
          <div style={{ width: '52px', height: '52px', margin: '0 auto 16px', borderRadius: '12px', backgroundColor: '#FBF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B6F2F' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>{pedidos.length === 0 ? 'Aún no hay pedidos registrados.' : 'No hay pedidos con este estado.'}</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                  {role === 'propietario' && (
                    <th style={{ padding: '12px 16px', width: '40px' }}>
                      <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0} onChange={toggleAll} style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }} />
                    </th>
                  )}
                  {['N° Pedido', 'Cliente', 'Total', 'Pago', 'Estado', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => {
                  const badge = ESTADO_LABELS[p.estado] || { label: p.estado, color: '#6b7280', bg: '#f3f4f6' };
                  return (
                    <tr key={p.id} style={{ borderBottom: i < paginated.length - 1 ? '1px solid #f9fafb' : 'none', backgroundColor: selectedIds.has(p.id) ? '#f8fafc' : 'transparent' }}>
                      {role === 'propietario' && (
                        <td style={{ padding: '14px 16px' }}>
                          <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }} />
                        </td>
                      )}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#141414', fontSize: '0.9rem' }}>{p.numero}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#141414', fontSize: '0.88rem' }}>{p.cliente_nombre}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{p.cliente_email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#141414' }}>${p.total}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#6b7280' }}>
                        {p.metodo_pago === 'payphone' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Tarjeta (PayPhone)
                          </span>
                        ) : p.metodo_pago === 'transferencia' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                            Transferencia
                          </span>
                        ) : p.metodo_pago === 'efectivo' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Efectivo
                          </span>
                        ) : p.metodo_pago === 'whatsapp' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            WhatsApp
                          </span>
                        ) : (
                          p.metodo_pago
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => setDetalleId(p.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.78rem', color: '#141414', whiteSpace: 'nowrap' }}>Ver</button>
                          <select onChange={e => cambiarEstado(p.id, e.target.value)} value={p.estado} disabled={isPending} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.75rem', cursor: 'pointer', maxWidth: '130px' }}>
                            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]?.label || e}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                Página {page} de {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </>
      )}

      {pedidoDetalle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#141414', margin: 0 }}>Pedido {pedidoDetalle.numero}</h2>
              <button onClick={() => setDetalleId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Cliente</div>
                <div style={{ fontWeight: 600, color: '#141414' }}>{pedidoDetalle.cliente_nombre}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{pedidoDetalle.cliente_email}</div>
                {pedidoDetalle.cliente_telefono && (
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {pedidoDetalle.cliente_telefono}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Productos</div>
                {(pedidoDetalle.items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb', fontSize: '0.88rem' }}>
                    <span style={{ color: '#141414' }}>{item.nombre} <span style={{ color: '#9ca3af' }}>× {item.cantidad}</span></span>
                    <span style={{ fontWeight: 700 }}>${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontWeight: 800, color: '#141414', fontSize: '1.05rem' }}>
                  <span>Total cobrado</span><span>${Number(pedidoDetalle.total).toFixed(2)}</span>
                </div>
                {pedidoDetalle.metodo_pago === 'payphone' && (() => {
                  const total = Number(pedidoDetalle.total);
                  const comision = total * COMISION_PAYPHONE;
                  return (
                    <div style={{ marginTop: '12px', padding: '12px 14px', backgroundColor: '#FBF6EE', border: '1px solid #F0E6D0', borderRadius: '10px', fontSize: '0.85rem', color: '#141414', lineHeight: 1.8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Comisión PayPhone estimada (≈ {(COMISION_PAYPHONE * 100).toFixed(2).replace('.', ',')}%)</span>
                        <span>− ${comision.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#9B6F2F' }}>
                        <span>Neto estimado que recibes</span>
                        <span>${(total - comision).toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '4px' }}>
                        Estimación según la tarifa publicada por PayPhone (5% + IVA). El valor exacto aparece en tu cuenta de PayPhone.
                      </div>
                    </div>
                  );
                })()}
              </div>
              {pedidoDetalle.notas && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Notas</div>
                  <p style={{ fontSize: '0.9rem', color: '#141414', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px' }}>{pedidoDetalle.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
