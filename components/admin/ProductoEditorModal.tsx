'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { crearProducto, actualizarProducto, subirImagenProducto } from '@/app/actions/productos';
import { useRouter } from 'next/navigation';

type Categoria = {
  id: string;
  nombre: string;
};

type Variante = {
  id: string;
  imagen_url: string;
  material: string;
  tono: string;
  color: string;
  acabado: string;
  stock: number;
};

type Producto = {
  id?: string;
  nombre?: string;
  descripcion?: string;
  contenido?: string;
  precio?: number;
  precio_oferta?: number | null;
  imagen_url?: string;
  categoria_id?: string | null;
  stock?: number;
  disponible?: boolean;
  destacado?: boolean;
  fecha_disponibilidad?: string;
  variantes?: Variante[];
};

export default function ProductoEditorModal({
  producto,
  categorias,
  onClose,
  onSaved,
}: {
  producto?: Producto;
  categorias: Categoria[];
  onClose: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [contenido, setContenido] = useState(producto?.contenido || '');
  const [precio, setPrecio] = useState(String(producto?.precio || ''));
  const [precioOferta, setPrecioOferta] = useState(String(producto?.precio_oferta || ''));
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id || '');
  const [stock, setStock] = useState(String(producto?.stock ?? 0));
  const [disponible, setDisponible] = useState(producto?.disponible ?? true);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [imagenUrl, setImagenUrl] = useState(producto?.imagen_url || '');
  const [fechaDisp, setFechaDisp] = useState(producto?.fecha_disponibilidad || '');
  const [variantes, setVariantes] = useState<Variante[]>(producto?.variantes || []);
  
  const [uploading, setUploading] = useState(false);
  const [uploadingVariant, setUploadingVariant] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const fileRef = useRef<HTMLInputElement>(null);
  const variantFileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = producto?.contenido || '';
  }, []);

  const isEdit = !!producto?.id;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await subirImagenProducto(fd);
    setUploading(false);
    if (res.error) { setError(res.error); return; }
    setImagenUrl(res.url!);
  }

  async function handleVariantUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeVariantId) return;
    setUploadingVariant(activeVariantId);
    const fd = new FormData();
    fd.append('file', file);
    const res = await subirImagenProducto(fd);
    setUploadingVariant(null);
    setActiveVariantId(null);
    if (res.error) { setError(res.error); return; }
    setVariantes(prev => prev.map(v => v.id === activeVariantId ? { ...v, imagen_url: res.url! } : v));
  }

  function addVariant() {
    setVariantes([...variantes, {
      id: Math.random().toString(36).slice(2),
      imagen_url: '',
      material: '',
      tono: '',
      color: '',
      acabado: '',
      stock: 1
    }]);
  }

  function updateVariant(id: string, field: keyof Variante, value: string | number) {
    setVariantes(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  }

  function removeVariant(id: string) {
    setVariantes(prev => prev.filter(v => v.id !== id));
  }

  function execCmd(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    setContenido(editorRef.current?.innerHTML || '');
  }

  function handleSubmit() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    if (!precio || isNaN(parseFloat(precio))) { setError('El precio es obligatorio'); return; }
    setError('');

    startTransition(async () => {
      const payload = {
        nombre,
        descripcion,
        contenido,
        precio: parseFloat(precio),
        precio_oferta: precioOferta ? parseFloat(precioOferta) : null,
        imagen_url: imagenUrl,
        categoria_id: categoriaId || null,
        stock: parseInt(stock) || 0,
        disponible,
        destacado,
        fecha_disponibilidad: fechaDisp || null,
        variantes,
      };

      const res = isEdit
        ? await actualizarProducto(producto!.id!, payload)
        : await crearProducto(payload);

      if (res.error) { setError(res.error); return; }
      onSaved?.();
      onClose();
      router.refresh();
    });
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = {
    fontSize: '0.85rem', fontWeight: 600 as const, color: '#141414',
    display: 'block' as const, marginBottom: '6px',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%',
        maxWidth: '960px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#141414', margin: 0 }}>
              {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Nombre del producto *</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Lámpara Colgante Dorada" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Descripción corta (aparece en la tarjeta)</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div><label style={labelStyle}>Precio * ($)</label><input type="number" value={precio} onChange={e => setPrecio(e.target.value)} min="0" step="0.01" style={inputStyle} /></div>
            <div><label style={labelStyle}>Precio oferta ($)</label><input type="number" value={precioOferta} onChange={e => setPrecioOferta(e.target.value)} min="0" step="0.01" style={inputStyle} /></div>
            <div><label style={labelStyle}>Stock General</label><input type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Categoría</label>
              <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} style={{ ...inputStyle, backgroundColor: '#fff', cursor: 'pointer' }}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Disponible en tienda', checked: disponible, onChange: setDisponible },
              { label: 'Destacado en inicio', checked: destacado, onChange: setDestacado },
            ].map(({ label, checked, onChange }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#9B6F2F' }} />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label style={labelStyle}>Imagen principal general</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#141414', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {uploading ? 'Subiendo...' : 'Subir imagen'}
              </button>
              {imagenUrl && <img src={imagenUrl} alt="preview" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />

          {/* Variantes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#141414' }}>Imágenes y Variantes</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  Agrega una foto por cada combinación de material, tono, color o acabado.
                </p>
              </div>
              <button type="button" onClick={addVariant} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#141414', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                + Agregar foto/variante
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {variantes.map((v, index) => (
                <div key={v.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb', alignItems: 'flex-start' }}>
                  {/* Imagen de variante */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '120px', flexShrink: 0 }}>
                    {v.imagen_url ? (
                      <img src={v.imagen_url} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => { setActiveVariantId(v.id); variantFileRef.current?.click(); }}
                      disabled={uploadingVariant === v.id}
                      style={{ padding: '6px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', backgroundColor: '#fff' }}
                    >
                      {uploadingVariant === v.id ? 'Subiendo...' : 'Subir foto'}
                    </button>
                  </div>

                  {/* Campos */}
                  <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{...labelStyle, fontSize:'0.75rem'}}>Material (Ej. Madera Laurel)</label>
                      <input type="text" value={v.material} onChange={e => updateVariant(v.id, 'material', e.target.value)} style={{...inputStyle, padding:'8px'}} />
                    </div>
                    <div>
                      <label style={{...labelStyle, fontSize:'0.75rem'}}>Tono (Ej. Copal)</label>
                      <input type="text" value={v.tono} onChange={e => updateVariant(v.id, 'tono', e.target.value)} style={{...inputStyle, padding:'8px'}} />
                    </div>
                    <div>
                      <label style={{...labelStyle, fontSize:'0.75rem'}}>Color</label>
                      <input type="text" value={v.color} onChange={e => updateVariant(v.id, 'color', e.target.value)} style={{...inputStyle, padding:'8px'}} />
                    </div>
                    <div>
                      <label style={{...labelStyle, fontSize:'0.75rem'}}>Acabado (Ej. Mate)</label>
                      <input type="text" value={v.acabado} onChange={e => updateVariant(v.id, 'acabado', e.target.value)} style={{...inputStyle, padding:'8px'}} />
                    </div>
                    <div>
                      <label style={{...labelStyle, fontSize:'0.75rem'}}>Stock de esta opción</label>
                      <input type="number" value={v.stock} onChange={e => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)} min="0" style={{...inputStyle, padding:'8px'}} />
                    </div>
                  </div>

                  <button type="button" onClick={() => removeVariant(v.id)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }} title="Eliminar variante">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {variantes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #d1d5db', borderRadius: '12px', color: '#6b7280', fontSize: '0.9rem' }}>
                  No has agregado variantes. Se usará el stock general.
                </div>
              )}
            </div>
            <input ref={variantFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleVariantUpload} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />

          {/* Contenido Rich Text */}
          <div>
            <label style={labelStyle}>Descripción completa (aparece en la página del producto)</label>
            <div style={{ display: 'flex', gap: '4px', padding: '8px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px 8px 0 0', flexWrap: 'wrap' }}>
              {[
                { cmd: 'bold', label: <strong>N</strong>, title: 'Negrita' },
                { cmd: 'italic', label: <em>K</em>, title: 'Cursiva' },
                { cmd: 'underline', label: <u>S</u>, title: 'Subrayado' },
              ].map(({ cmd, label, title }) => (
                <button key={cmd} type="button" title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd); }} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: '5px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {label}
                </button>
              ))}
              <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
              {[
                { cmd: 'insertUnorderedList', label: '• Lista', title: 'Lista con viñetas' },
                { cmd: 'insertOrderedList', label: '1. Lista', title: 'Lista numerada' },
              ].map(({ cmd, label, title }) => (
                <button key={cmd} type="button" title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd); }} style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '5px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {label}
                </button>
              ))}
            </div>
            <div
              ref={editorRef}
              dir="ltr"
              contentEditable
              suppressContentEditableWarning
              onInput={() => setContenido(editorRef.current?.innerHTML || '')}
              style={{
                minHeight: '150px', padding: '16px',
                border: '1px solid #d1d5db', borderTop: 'none',
                borderRadius: '0 0 8px 8px', outline: 'none',
                direction: 'ltr', textAlign: 'left', unicodeBidi: 'plaintext',
                fontSize: '0.95rem', lineHeight: '1.7', fontFamily: 'inherit', color: '#141414',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={isPending} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, opacity: isPending ? 0.7 : 1 }}>
            {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar producto'}
          </button>
        </div>
      </div>
    </div>
  );
}
