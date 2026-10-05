'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { eliminarProducto, actualizarProducto } from '@/app/actions/productos';
import ProductoEditorModal from '@/components/admin/ProductoEditorModal';

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  precio_oferta?: number | null;
  imagen_url?: string;
  disponible: boolean;
  destacado: boolean;
  stock: number;
  slug: string;
  categoria_id?: string | null;
  descripcion?: string;
  contenido?: string;
  categorias?: { nombre: string } | null;
  fecha_disponibilidad?: string;
};

type Categoria = { id: string; nombre: string };

// ── Componente de paginación reutilizable ────────────────
function Paginacion({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Página {page} de {totalPages}</span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

export default function AdminProductosClient({
  productos,
  categorias,
  role,
}: {
  productos: Producto[];
  categorias: Categoria[];
  role: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const totalPages = Math.ceil(productos.length / ITEMS_PER_PAGE);
  const paginated = productos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function toggleAll() {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(p => p.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  async function handleEliminarSeleccionados() {
    if (selectedIds.size === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.size} producto(s)? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      for (const id of Array.from(selectedIds)) {
        await eliminarProducto(id);
      }
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    setDeletingId(id);
    await eliminarProducto(id);
    setDeletingId(null);
    router.refresh();
  }

  async function toggleDisponible(p: Producto) {
    startTransition(async () => {
      await actualizarProducto(p.id, { disponible: !p.disponible });
      router.refresh();
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>Productos</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{productos.length} producto{productos.length !== 1 ? 's' : ''} en el catálogo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {role === 'propietario' && selectedIds.size > 0 && (
            <button
              onClick={handleEliminarSeleccionados}
              disabled={isPending}
              style={{ padding: '9px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eliminar ({selectedIds.size})
            </button>
          )}
          <button onClick={() => { setEditando(undefined); setModalOpen(true); }} style={{ padding: '11px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
          <div style={{ width: '52px', height: '52px', margin: '0 auto 16px', borderRadius: '12px', backgroundColor: '#FBF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B6F2F' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#141414', marginBottom: '8px' }}>Sin productos aún</h3>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>Agrega tu primer producto usando el botón &quot;Nuevo Producto&quot;.</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                  {role === 'propietario' && (
                    <th style={{ padding: '12px 16px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginated.length && paginated.length > 0}
                        onChange={toggleAll}
                        style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }}
                      />
                    </th>
                  )}
                  {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < paginated.length - 1 ? '1px solid #f9fafb' : 'none', backgroundColor: selectedIds.has(p.id) ? '#fafafa' : 'transparent' }}>
                    {role === 'propietario' && (
                      <td style={{ padding: '14px 16px' }}>
                        <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }} />
                      </td>
                    )}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #e5e7eb' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#FBF6EE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9B6F2F' }}>
                            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#141414', fontSize: '0.92rem' }}>{p.nombre}</div>
                          {p.destacado && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B6F2F', backgroundColor: '#FBF6EE', padding: '3px 8px', borderRadius: '99px', marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6b7280' }}>{(p.categorias as any)?.nombre || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#141414', fontSize: '0.95rem' }}>${p.precio}</div>
                      {p.precio_oferta && <div style={{ fontSize: '0.78rem', color: '#9ca3af', textDecoration: 'line-through' }}>${p.precio_oferta}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 600, color: p.stock === 0 ? '#dc2626' : '#141414' }}>{p.stock}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => toggleDisponible(p)} disabled={isPending} style={{ padding: '4px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', backgroundColor: p.disponible ? '#d1fae5' : '#f3f4f6', color: p.disponible ? '#065f46' : '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.disponible ? '#10b981' : '#9ca3af' }} />
                        {p.disponible ? 'Visible' : 'Oculto'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEditando(p); setModalOpen(true); }} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: '#141414' }}>Editar</button>
                        <button onClick={() => handleEliminar(p.id)} disabled={deletingId === p.id} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: '#dc2626' }}>
                          {deletingId === p.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion page={page} totalPages={totalPages} onChange={(p) => { setPage(p); setSelectedIds(new Set()); }} />
        </>
      )}

      {modalOpen && (
        <ProductoEditorModal
          producto={editando}
          categorias={categorias}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
