'use client';

import { useState, useTransition } from 'react';
import { crearPedido } from '@/app/actions/pedidos';
import { calcularDesglose, calcularRecargo } from '@/lib/iva';
import { useCart } from '../CartContext';

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  precio_oferta?: number | null;
  imagen_url?: string;
  slug: string;
  stock?: number | null;
};

const UMBRAL_POCO_STOCK = 5;

export default function ProductoDetalle({
  producto,
  whatsapp,
  ivaPorcentaje = 15,
  ivaIncluido = true,
  recargoTarjeta = 0,
  transferenciaDatos = '',
  efectivoInstrucciones = '',
  fechaDisponibilidad = '',
  activeVariant,
}: {
  producto: Producto;
  whatsapp: string;
  ivaPorcentaje?: number;
  ivaIncluido?: boolean;
  recargoTarjeta?: number;
  transferenciaDatos?: string;
  efectivoInstrucciones?: string;
  fechaDisponibilidad?: string;
  activeVariant?: any;
}) {
  const [cantidad, setCantidad] = useState(1);
  const { addItem } = useCart();

  const stock = Math.max(0, Number(producto.stock ?? 0));
  const agotado = stock <= 0;

  // Fecha 'YYYY-MM-DD' -> '15 de octubre de 2026' (sin desfase de zona horaria)
  const fechaTexto = (() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaDisponibilidad);
    if (!m) return '';
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      .toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const precio = producto.precio;
  const desglose = calcularDesglose(precio * cantidad, { porcentaje: ivaPorcentaje, incluido: ivaIncluido });
  const total = desglose.total / 100;

  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
  const numeroWhatsapp = cleanPhone.startsWith('09') ? `593${cleanPhone.slice(1)}` : cleanPhone;

  // Mensajes de variante
  const variantText = activeVariant ? ` [${[activeVariant.material, activeVariant.tono, activeVariant.color, activeVariant.acabado].filter(Boolean).join(' / ')}]` : '';
  const itemNombre = `${producto.nombre}${variantText}`;

  // Pedido directo por WhatsApp (producto disponible)
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el producto *${itemNombre}* (${cantidad} unidad${cantidad > 1 ? 'es' : ''}). Total: $${total.toFixed(2)}`
  );
  const whatsappUrl = `https://wa.me/${numeroWhatsapp}?text=${whatsappMessage}`;

  // Pedido directo por WhatsApp (producto agotado)
  const whatsappAgotadoMessage = encodeURIComponent(
    `Hola, quisiera hacer un pedido del producto *${itemNombre}*, que aparece agotado en la tienda. ¿Cuándo tendrán disponibilidad?`
  );
  const whatsappAgotadoUrl = `https://wa.me/${numeroWhatsapp}?text=${whatsappAgotadoMessage}`;

  return (
    <div>
      {/* Stock */}
      <div style={{ marginBottom: '18px' }}>
        {agotado ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5', backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid #ef4444', borderRadius: '999px', padding: '5px 14px' }}>
              ● Agotado
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#9B6F2F', backgroundColor: '#FBF6EE', border: '1px solid #9B6F2F', borderRadius: '999px', padding: '5px 14px' }}>
              ● En producción{fechaTexto ? ` · Disponible el ${fechaTexto}` : ''}
            </span>
          </div>
        ) : stock <= UMBRAL_POCO_STOCK ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#fcd34d', backgroundColor: 'rgba(217,119,6,0.12)', border: '1px solid #d97706', borderRadius: '999px', padding: '5px 14px' }}>
            ● ¡Últimas {stock} unidad{stock === 1 ? '' : 'es'}!
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#4ade80', backgroundColor: 'rgba(21,128,61,0.12)', border: '1px solid #15803d', borderRadius: '999px', padding: '5px 14px' }}>
            ● En stock: {stock} unidades
          </span>
        )}
      </div>

      {/* Cantidad (solo si hay stock) */}
      {!agotado && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', display: 'block', marginBottom: '8px' }}>Cantidad</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
            <button onClick={() => setCantidad(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'var(--card-bg)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>−</button>
            <span style={{ width: '52px', textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', color: '#141414', background: 'var(--card-bg)', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cantidad}</span>
            <button
              onClick={() => setCantidad(q => Math.min(stock, q + 1))}
              disabled={cantidad >= stock}
              style={{ width: '40px', height: '40px', border: 'none', background: 'var(--card-bg)', color: 'var(--text-color)', cursor: cantidad >= stock ? 'not-allowed' : 'pointer', opacity: cantidad >= stock ? 0.4 : 1, fontSize: '1.2rem', fontWeight: 700 }}
            >+</button>
          </div>
        </div>
      )}

      {/* Precio total (solo si hay stock) */}
      {!agotado && (
        <>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#141414', marginBottom: ivaPorcentaje > 0 ? '6px' : '28px' }}>
            ${total.toFixed(2)}
            {cantidad > 1 && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px' }}>(${precio} c/u)</span>}
          </div>
          {ivaPorcentaje > 0 && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
              {ivaIncluido ? (
                <>Incluye IVA {ivaPorcentaje}% (${(desglose.iva / 100).toFixed(2)})</>
              ) : (
                <>Subtotal ${(desglose.base / 100).toFixed(2)} + IVA {ivaPorcentaje}% ${(desglose.iva / 100).toFixed(2)}</>
              )}
            </div>
          )}
        </>
      )}

      {/* AGOTADO: no se puede pagar, solo pedir por WhatsApp */}
      {agotado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Este producto está agotado por el momento y no se puede pagar en línea. Escríbenos para hacer un pedido especial.
          </p>
          {numeroWhatsapp && (
            <a href={whatsappAgotadoUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ justifyContent: 'center' }}>
              Hacer pedido por WhatsApp
            </a>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
               addItem({
                 id: `${producto.id}-${activeVariant?.id || 'base'}`,
                 producto_id: producto.id,
                 nombre: itemNombre,
                 precio,
                 cantidad,
                 imagen_url: producto.imagen_url,
                 stock
               });
            }} 
            style={{ flex: 1, minWidth: '160px', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(155, 111, 47, 0.3)' }}
          >
            Añadir al carrito
          </button>
          
          {numeroWhatsapp && (
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-whatsapp"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.098.544 4.067 1.493 5.777L.057 23.928l6.305-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.607-.5-5.112-1.374l-.366-.217-3.745.982.999-3.648-.239-.375A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}
