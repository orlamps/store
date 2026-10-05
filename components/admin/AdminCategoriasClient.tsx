'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '@/app/actions/categorias';

type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  slug: string;
  activa: boolean;
  orden: number;
};

function Paginacion({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Página {page} de {totalPages}</span>
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

export default function AdminCategoriasClientWrapper({ categorias, role }: { categorias: Categoria[]; role: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const totalPages = Math.ceil(categorias.length / ITEMS_PER_PAGE);
  const paginated = categorias.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function toggleAll() {
    if (selectedIds.size === paginated.length && paginated.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(c => c.id)));
  }
  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  function abrirNuevo() { setEditando(null); setNombre(''); setDescripcion(''); setError(''); setModalOpen(true); }
  function abrirEditar(c: Categoria) { setEditando(c); setNombre(c.nombre); setDescripcion(c.descripcion || ''); setError(''); setModalOpen(true); }

  function handleSubmit() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    setError('');
    startTransition(async () => {
      const res = editando
        ? await actualizarCategoria(editando.id, { nombre, descripcion })
        : await crearCategoria({ nombre, descripcion });
      if (res.error) { setError(res.error); return; }
      setModalOpen(false);
      router.refresh();
    });
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return;
    await eliminarCategoria(id);
    router.refresh();
  }

  async function handleEliminarSeleccionados() {
    if (selectedIds.size === 0) return;
    if (!confirm(`¿Eliminar ${selectedIds.size} categoría(s)?`)) return;
    startTransition(async () => {
      for (const id of Array.from(selectedIds)) await eliminarCategoria(id);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  async function handleToggleActiva(c: Categoria) {
    startTransition(async () => { await actualizarCategoria(c.id, { activa: !c.activa }); router.refresh(); });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>Categorías</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{categorias.length} categoría{categorias.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {role === 'propietario' && selectedIds.size > 0 && (
            <button onClick={handleEliminarSeleccionados} disabled={isPending} style={{ padding: '9px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eliminar ({selectedIds.size})
            </button>
          )}
          <button onClick={abrirNuevo} style={{ padding: '11px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Nueva Categoría
          </button>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>Sin categorías. Crea la primera usando el botón de arriba.</p>
        </div>
      ) : (
        <>
          {/* Barra de selección (solo propietario) */}
          {role === 'propietario' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '10px 16px', backgroundColor: '#fafafa', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <input
                type="checkbox"
                checked={selectedIds.size === paginated.length && paginated.length > 0}
                onChange={toggleAll}
                style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 500 }}>
                {selectedIds.size > 0 ? `${selectedIds.size} seleccionada(s)` : 'Seleccionar todo'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paginated.map(c => (
              <div key={c.id} style={{ backgroundColor: selectedIds.has(c.id) ? '#fafafa' : '#fff', borderRadius: '12px', border: `1px solid ${selectedIds.has(c.id) ? '#d1d5db' : '#e5e7eb'}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {role === 'propietario' && (
                  <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleOne(c.id)} style={{ width: '16px', height: '16px', accentColor: '#141414', cursor: 'pointer', flexShrink: 0 }} />
                )}
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FBF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B6F2F', flexShrink: 0 }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontWeight: 700, color: '#141414', fontSize: '0.98rem' }}>{c.nombre}</div>
                  {c.descripcion && <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>{c.descripcion}</div>}
                  <code style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '2px', display: 'block' }}>/{c.slug}</code>
                </div>
                <button onClick={() => handleToggleActiva(c)} disabled={isPending} style={{ padding: '4px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', backgroundColor: c.activa ? '#d1fae5' : '#f3f4f6', color: c.activa ? '#065f46' : '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.activa ? '#10b981' : '#9ca3af' }} />
                  {c.activa ? 'Activa' : 'Inactiva'}
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => abrirEditar(c)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: '#141414' }}>Editar</button>
                  <button onClick={() => handleEliminar(c.id)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fee2e2', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: '#dc2626' }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <Paginacion page={page} totalPages={totalPages} onChange={(p) => { setPage(p); setSelectedIds(new Set()); }} />
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#141414', margin: 0 }}>{editando ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>Nombre *</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Lámparas de Techo" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>Descripción</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} placeholder="Descripción opcional..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            </div>
            <div style={{ padding: '20px 28px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>Cancelar</button>
              <button onClick={handleSubmit} disabled={isPending} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, opacity: isPending ? 0.7 : 1 }}>
                {isPending ? 'Guardando...' : editando ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
