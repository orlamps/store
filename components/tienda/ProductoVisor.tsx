'use client';

import { useState } from 'react';
import ProductoDetalle from './ProductoDetalle';
import Link from 'next/link';

export default function ProductoVisor({ producto, contenido, iva, categoria }: any) {
  const variantes = producto.variantes || [];
  const [activeVariant, setActiveVariant] = useState<any>(variantes.length > 0 ? variantes[0] : null);

  const mainImageUrl = activeVariant?.imagen_url || producto.imagen_url;
  const currentStock = activeVariant ? activeVariant.stock : producto.stock;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start mb-16 lg:mb-20">
      {/* Imagen */}
      <div>
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={producto.nombre}
            style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', aspectRatio: '1 / 1', display: 'block', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}
          />
        ) : (
          <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '16px', backgroundColor: '#FBF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F0E6D0' }}>
            <span style={{color: '#9B6F2F', opacity: 0.5}}>Sin imagen</span>
          </div>
        )}
        
        {/* Thumbnails */}
        {variantes.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
             {variantes.filter((v:any)=>v.imagen_url).map((v:any) => (
                <img 
                  key={v.id} 
                  src={v.imagen_url} 
                  alt="variante" 
                  onClick={() => setActiveVariant(v)}
                  style={{ 
                    width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer',
                    border: activeVariant?.id === v.id ? '2px solid #141414' : '1px solid #eaeaea',
                    opacity: activeVariant?.id === v.id ? 1 : 0.6
                  }}
                />
             ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {categoria && (
          <Link href={`/tienda?categoria=${categoria.slug}`} style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, color: '#9B6F2F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', textDecoration: 'none' }}>
            {categoria.nombre}
          </Link>
        )}
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: '#141414', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          {producto.nombre}
        </h1>

        {/* Variantes Selection UI */}
        {variantes.length > 0 && (
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['material', 'tono', 'color', 'acabado'].map(prop => {
              const options = Array.from(new Set(variantes.map((v:any) => v[prop]).filter(Boolean)));
              if (options.length === 0) return null;
              
              return (
                <div key={prop}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#141414', display: 'block', marginBottom: '8px', textTransform: 'capitalize' }}>
                    {prop}: <span style={{fontWeight: 400}}>{activeVariant?.[prop] || ''}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {options.map((opt:any) => {
                      const isSelected = activeVariant?.[prop] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            const nextV = variantes.find((v:any) => v[prop] === opt);
                            if (nextV) setActiveVariant(nextV);
                          }}
                          style={{
                            padding: '8px 16px', borderRadius: '999px',
                            border: isSelected ? '1px solid #141414' : '1px solid #d1d5db',
                            backgroundColor: isSelected ? '#141414' : '#fff',
                            color: isSelected ? '#fff' : '#141414',
                            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Precio */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#9B6F2F' }}>${producto.precio}</span>
          {producto.precio_oferta && (
            <span style={{ fontSize: '1.1rem', color: '#9ca3af', textDecoration: 'line-through' }}>${producto.precio_oferta}</span>
          )}
        </div>

        {/* Descripción */}
        {producto.descripcion && (
          <p style={{ color: '#141414', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '28px' }}>
            {producto.descripcion}
          </p>
        )}

        <div style={{ height: '1px', backgroundColor: '#eaeaea', margin: '20px 0' }} />

        {/* Componente interactivo cliente */}
        <ProductoDetalle
          producto={{ id: producto.id, nombre: producto.nombre, precio: producto.precio, precio_oferta: producto.precio_oferta, imagen_url: mainImageUrl, slug: producto.slug, stock: currentStock }}
          activeVariant={activeVariant}
          whatsapp={contenido.contacto_whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}
          ivaPorcentaje={iva.porcentaje}
          ivaIncluido={iva.incluido}
          recargoTarjeta={iva.recargoTarjeta}
          transferenciaDatos={contenido.transferencia_datos || ''}
          efectivoInstrucciones={contenido.efectivo_instrucciones || ''}
          fechaDisponibilidad={contenido[`fecha_disp_${producto.id}`] || ''}
        />
      </div>
    </div>
  );
}
