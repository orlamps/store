'use client';

import { useState, useTransition } from 'react';
import { useCart } from './CartContext';
import { crearPedido } from '@/app/actions/pedidos';
import { calcularDesglose, calcularRecargo } from '@/lib/iva';
import Link from 'next/link';

export default function CartDrawer({
  whatsapp,
  ivaPorcentaje = 15,
  ivaIncluido = true,
  recargoTarjeta = 0,
}: {
  whatsapp: string;
  ivaPorcentaje?: number;
  ivaIncluido?: boolean;
  recargoTarjeta?: number;
}) {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [registro, setRegistro] = useState<{ numero: string; total: number; cantidad: number } | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nota, setNota] = useState('');
  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'efectivo' | 'payphone'>('transferencia');
  const [savedWhatsappUrl, setSavedWhatsappUrl] = useState('');
  const [error, setError] = useState('');

  if (!isCartOpen) return null;

  const totalBase = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  const desglose = calcularDesglose(totalBase, { porcentaje: ivaPorcentaje, incluido: ivaIncluido });
  const totalWithoutRecargo = desglose.total / 100;
  const recargoCent = metodoPago === 'payphone' ? calcularRecargo(desglose.total, recargoTarjeta) : 0;
  const totalAPagar = (desglose.total + recargoCent) / 100;

  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
  const numeroWhatsapp = cleanPhone.startsWith('09') ? `593${cleanPhone.slice(1)}` : cleanPhone;

  function buildWhatsappUrl(itemsList: typeof items, total: number, numero: string, metodo: string): string {
    const itemListText = itemsList.map(i => `- ${i.nombre} (x${i.cantidad}) — $${(i.precio * i.cantidad).toFixed(2)}`).join('\n');
    let mensaje = `Hola, acabo de realizar el pedido *${numero}* en OrLamps.\n\n*Detalle:*\n${itemListText}\n\n*Total: $${total.toFixed(2)}*`;
    if (metodo === 'transferencia') {
      mensaje += '\n\nPagaré por transferencia bancaria. Te adjunto el comprobante a continuación.';
    } else if (metodo === 'efectivo') {
      mensaje += '\n\nPagaré en efectivo. Quisiera coordinar la entrega o retiro.';
    }
    return `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;
  }

  function handleCheckout() {
    if (items.length === 0) return;
    if (!nombre.trim() || !email.trim()) {
      setError('Nombre y correo son obligatorios');
      return;
    }
    setError('');
    startTransition(async () => {
      const res = await crearPedido({
        cliente_nombre: nombre,
        cliente_email: email,
        cliente_telefono: telefono,
        cliente_direccion: '',
        items: items.map(i => ({
          producto_id: i.producto_id,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
          imagen_url: i.imagen_url
        })),
        total: totalAPagar,
        metodo_pago: metodoPago,
        notas: nota
      });

      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.numero) {
        // ⚠️ Guardar la URL ANTES de limpiar el carrito
        const url = buildWhatsappUrl(items, totalAPagar, res.numero, metodoPago);
        setSavedWhatsappUrl(url);
        setRegistro({ numero: res.numero, total: totalAPagar, cantidad: totalItems });
        setSuccess(true);
        clearCart();
      }
    });
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' as any };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,20,20,0.5)', zIndex: 9999, backdropFilter: 'blur(2px)' }} onClick={() => setIsCartOpen(false)} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '440px', backgroundColor: '#FAF8F5', zIndex: 10000, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#141414' }}>Tu Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#141414', margin: '0 0 12px' }}>¡Pedido {registro?.numero} Registrado!</h3>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '24px' }}>Total: <strong>${registro?.total.toFixed(2)}</strong></p>

              {(metodoPago === 'transferencia' || metodoPago === 'efectivo') && (
                <a href={savedWhatsappUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: '#fff', padding: '14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, marginBottom: '12px' }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.098.544 4.067 1.493 5.777L.057 23.928l6.305-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.607-.5-5.112-1.374l-.366-.217-3.745.982.999-3.648-.239-.375A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Completar compra por WhatsApp
                </a>
              )}
              {metodoPago === 'payphone' && (
                <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontSize: '0.9rem', color: '#92400e' }}>
                  Te contactaremos para procesar el pago con tarjeta.
                </div>
              )}

              <button onClick={() => { setSuccess(false); setIsCartOpen(false); }} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#141414', fontWeight: 700, cursor: 'pointer' }}>
                Seguir comprando
              </button>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '40px', color: '#6b7280' }}>
              Tu carrito está vacío.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', backgroundColor: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  {item.imagen_url ? (
                    <img src={item.imagen_url} alt={item.nombre} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '70px', height: '70px', backgroundColor: '#f3f4f6', borderRadius: '8px' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#141414', lineHeight: 1.3, marginBottom: '4px' }}>{item.nombre}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9B6F2F' }}>${item.precio}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} style={{ width: '24px', height: '24px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '4px', cursor: 'pointer', color: '#141414' }}>−</button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#141414', minWidth: '16px', textAlign: 'center' }}>{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} disabled={item.cantidad >= item.stock} style={{ width: '24px', height: '24px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '4px', cursor: item.cantidad >= item.stock ? 'not-allowed' : 'pointer', color: '#141414' }}>+</button>
                      <button onClick={() => removeItem(item.id)} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ height: '1px', backgroundColor: '#d1d5db', margin: '8px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#141414', marginBottom: '16px' }}>
                <span>Total:</span>
                <span>${totalAPagar.toFixed(2)}</span>
              </div>

              {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Nombre completo" value={nombre} onChange={e=>setNombre(e.target.value)} style={inputStyle} required />
                <input type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} required />
                <input type="text" placeholder="Teléfono" value={telefono} onChange={e=>setTelefono(e.target.value)} style={inputStyle} />
                <textarea placeholder="Notas (Opcional)" value={nota} onChange={e=>setNota(e.target.value)} style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} />
              </div>

              <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#141414', display: 'block', marginBottom: '8px' }}>Método de pago</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', color: '#141414' }}>
                    <input type="radio" name="pago_cart" checked={metodoPago === 'transferencia'} onChange={() => setMetodoPago('transferencia')} style={{ accentColor: '#9B6F2F' }} />
                    Transferencia Bancaria
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', color: '#141414' }}>
                    <input type="radio" name="pago_cart" checked={metodoPago === 'efectivo'} onChange={() => setMetodoPago('efectivo')} style={{ accentColor: '#9B6F2F' }} />
                    Efectivo
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', color: '#141414' }}>
                    <input type="radio" name="pago_cart" checked={metodoPago === 'payphone'} onChange={() => setMetodoPago('payphone')} style={{ accentColor: '#9B6F2F' }} />
                    Tarjeta Crédito / Débito
                    {recargoTarjeta > 0 && <span style={{ fontSize: '0.78rem', color: '#9B6F2F', fontWeight: 600 }}>(+{recargoTarjeta}% recargo)</span>}
                  </label>
                </div>
              </div>

              {metodoPago === 'payphone' && recargoTarjeta > 0 && (
                <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7, backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px' }}>
                  <div>Subtotal: <strong>${totalWithoutRecargo.toFixed(2)}</strong></div>
                  <div>Recargo tarjeta ({recargoTarjeta}%): <strong>${((recargoCent) / 100).toFixed(2)}</strong></div>
                  <div style={{ color: '#141414', fontWeight: 700 }}>Total a pagar: ${totalAPagar.toFixed(2)}</div>
                </div>
              )}

              <button onClick={handleCheckout} disabled={isPending} style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, marginTop: '8px' }}>
                {isPending ? 'Procesando...' : metodoPago === 'payphone' ? `Pagar $${totalAPagar.toFixed(2)} con Tarjeta` : 'Confirmar Pedido'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
