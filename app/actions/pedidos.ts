'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calcularDesglose, leerIvaConfig, calcularRecargo, leerRecargoTarjeta } from '@/lib/iva';
import { getContenido } from '@/app/actions/contenido';
import { emailNuevoPedido, emailConfirmacionPedido, emailPagoPayphoneAprobado } from '@/lib/email';

// Suma (signo=1) o resta (signo=-1) las unidades de un pedido al stock de cada producto.
// Interna: NO se exporta, para que no quede expuesta como server action pública.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ajustarStock(admin: any, items: unknown, signo: 1 | -1) {
  if (!Array.isArray(items)) return;
  for (const it of items as Array<{ producto_id?: string; cantidad?: number }>) {
    if (!it?.producto_id) continue;
    const { data: p } = await admin.from('productos').select('stock').eq('id', it.producto_id).single();
    if (!p) continue;
    const nuevo = Math.max(0, Number(p.stock ?? 0) + signo * Number(it.cantidad || 0));
    await admin.from('productos').update({ stock: nuevo }).eq('id', it.producto_id);
  }
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function isAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return data && ['propietario', 'administrador'].includes(data.role);
}

export async function crearPedido(payload: {
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono?: string;
  cliente_direccion?: string;
  items: Array<{ producto_id: string; nombre: string; precio: number; cantidad: number; imagen_url?: string }>;
  total: number;
  metodo_pago?: string;
  notas?: string;
}) {
  const admin = createAdminClient();

  // ── Validación de los datos recibidos ──
  const nombre = String(payload.cliente_nombre ?? '').trim();
  const email = String(payload.cliente_email ?? '').trim();
  if (!nombre || nombre.length > 120 || !email.includes('@') || email.length > 160) {
    return { error: 'Ingresa un nombre y un email válidos.' };
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 50) {
    return { error: 'El pedido no tiene productos.' };
  }
  const metodoPago = payload.metodo_pago ?? 'transferencia';
  if (!['transferencia', 'efectivo', 'payphone', 'whatsapp'].includes(metodoPago)) {
    return { error: 'Método de pago inválido.' };
  }

  // Si va a pagar con tarjeta, verificar la configuración ANTES de crear el pedido
  const usaPayphone = metodoPago === 'payphone';
  const token = process.env.PAYPHONE_APP_TOKEN;
  const storeId = process.env.PAYPHONE_STORE_ID;
  if (usaPayphone && (!token || !storeId)) {
    return { error: 'El pago con tarjeta aún no está configurado. Elige WhatsApp o inténtalo más tarde.' };
  }

  // ── Precios REALES desde la base de datos (no se confía en el navegador) ──
  const ids = payload.items.map(i => String(i.producto_id));
  const { data: productos, error: errProductos } = await admin
    .from('productos')
    .select('id, nombre, precio, imagen_url, disponible, stock')
    .in('id', ids);
  if (errProductos) return { error: errProductos.message };

  const mapa = new Map<string, any>((productos || []).map((p: any) => [p.id, p]));
  const items: Array<{ producto_id: string; nombre: string; precio: number; cantidad: number; imagen_url?: string }> = [];
  let subtotal = 0;
  for (const it of payload.items) {
    const p = mapa.get(String(it.producto_id));
    const cantidad = Number(it.cantidad);
    if (!p || !p.disponible) return { error: 'Uno de los productos ya no está disponible.' };
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) return { error: 'Cantidad inválida.' };
    const stock = Number(p.stock ?? 0);
    if (stock <= 0) return { error: `"${p.nombre}" está agotado. Puedes hacer tu pedido por WhatsApp.` };
    if (cantidad > stock) return { error: `Solo quedan ${stock} unidad${stock === 1 ? '' : 'es'} de "${p.nombre}".` };
    const precio = Number(p.precio);
    items.push({ producto_id: p.id, nombre: p.nombre, precio, cantidad, imagen_url: p.imagen_url ?? undefined });
    subtotal += precio * cantidad;
  }

  // ── IVA configurado en el panel admin (/admin/contenido → Pagos e IVA) ──
  const contenido = await getContenido();
  const desglose = calcularDesglose(subtotal, leerIvaConfig(contenido));
  // Recargo por pago con tarjeta (cubre la comisión de PayPhone). Solo aplica a PayPhone.
  const recargo = usaPayphone ? calcularRecargo(desglose.total, leerRecargoTarjeta(contenido)) : 0;
  const totalFinal = desglose.total + recargo;
  const total = totalFinal / 100;

  const { count } = await admin.from('pedidos').select('*', { count: 'exact', head: true });
  const numero = `ORD-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

  const { data, error } = await admin.from('pedidos').insert({
    cliente_nombre: nombre,
    cliente_email: email,
    cliente_telefono: payload.cliente_telefono,
    cliente_direccion: payload.cliente_direccion,
    items,
    total,
    metodo_pago: metodoPago,
    notas: payload.notas,
    numero,
    estado: 'pendiente',
  }).select().single();

  if (error) return { error: error.message };

  let payphoneUrl: string | null = null;
  if (usaPayphone) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_STORE_URL;

      const res = await fetch('https://pay.payphonetodoesposible.com/api/button/Prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // amount = amountWithoutTax + amountWithTax + tax (centavos, enteros)
          // El recargo por tarjeta va en amountWithoutTax para que la suma sea exacta.
          amount: totalFinal,
          ...(desglose.iva > 0
            ? { amountWithTax: desglose.base, amountWithoutTax: recargo, tax: desglose.iva }
            : { amountWithoutTax: totalFinal }),
          currency: 'USD',
          storeId,
          clientTransactionId: numero,
          reference: `Pedido ${numero} OrLamps`,
          responseUrl: `${baseUrl}/pago/respuesta`,
          cancellationUrl: `${baseUrl}/tienda`,
          email: payload.cliente_email,
          timeZone: -5,
        }),
      });

      if (!res.ok) {
        console.error('PayPhone Prepare error:', res.status, await res.text());
        return { error: 'No se pudo iniciar el pago con tarjeta. Intenta de nuevo o elige WhatsApp.' };
      }

      const payphoneData = await res.json();
      payphoneUrl = payphoneData.payWithCard || payphoneData.payWithPayPhone || null;

      if (!payphoneUrl) {
        console.error('PayPhone Prepare sin URL de pago:', payphoneData);
        return { error: 'No se pudo iniciar el pago con tarjeta. Intenta de nuevo o elige WhatsApp.' };
      }

      await admin.from('pedidos').update({ referencia_pago: String(payphoneData.paymentId ?? '') }).eq('id', data.id);
    } catch (e) {
      console.error('PayPhone connection error', e);
      return { error: 'No se pudo conectar con la pasarela de pago. Intenta de nuevo o elige WhatsApp.' };
    }
  }
  // Enviar correos (no bloqueante - si falla no afecta el flujo del pedido)
  try {
    await Promise.all([
      ...(!usaPayphone ? [
        emailNuevoPedido({
          numero,
          clienteNombre: nombre,
          clienteEmail: email,
          clienteTelefono: payload.cliente_telefono,
          items,
          total,
          metodoPago,
        }),
        emailConfirmacionPedido({
          numero,
          clienteNombre: nombre,
          clienteEmail: email,
          items,
          total,
          metodoPago,
          transferenciaDatos: contenido.transferencia_datos,
          efectivoInstrucciones: contenido.efectivo_instrucciones,
        })
      ] : []),
    ]);

  } catch (emailErr) {
    console.error('[Pedido] Error enviando emails:', emailErr);
  }

  return { data, numero, payphoneUrl };
}

/**
 * Confirma una transacción de PayPhone (obligatorio: si no se confirma en ~5 min,
 * PayPhone la cancela automáticamente). Se llama desde /pago/respuesta.
 */
export async function confirmarPagoPayphone(id: number, clientTransactionId: string) {
  const token = process.env.PAYPHONE_APP_TOKEN;
  if (!token || !id || !clientTransactionId) return { aprobado: false, error: 'Datos incompletos' };

  try {
    const res = await fetch('https://pay.payphonetodoesposible.com/api/button/V2/Confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id: Number(id), clientTxId: clientTransactionId }),
    });

    if (!res.ok) {
      console.error('PayPhone Confirm error:', res.status, await res.text());
      return { aprobado: false, error: 'No se pudo verificar el pago' };
    }

    const result = await res.json();
    // statusCode 3 = Aprobada, 2 = Cancelada (documentación PayPhone)
    const aprobado = result.statusCode === 3 || result.transactionStatus === 'Approved';

    const admin = createAdminClient();

    // Estado previo: evita descontar el stock dos veces si el cliente recarga la página
    const { data: previo } = await admin.from('pedidos').select('estado, items, cliente_nombre, cliente_email').eq('numero', clientTransactionId).single();

    const referenciaPago = String(result.transactionId ?? result.authorizationCode ?? id);

    await admin
      .from('pedidos')
      .update({
        estado: aprobado ? 'pagado' : 'cancelado',
        referencia_pago: referenciaPago,
      })
      .eq('numero', clientTransactionId);

    if (aprobado && previo && previo.estado !== 'pagado') {
      await ajustarStock(admin, previo.items, -1);

      // Calcular total del pedido
      const totalPedido = (previo.items || []).reduce(
        (sum: number, it: any) => sum + (Number(it.precio) * Number(it.cantidad)), 0
      );

      // Enviar emails de confirmación al cliente y aviso al admin
      try {
        await emailPagoPayphoneAprobado({
          numero: clientTransactionId,
          clienteNombre: previo.cliente_nombre || 'Cliente',
          clienteEmail: previo.cliente_email || '',
          items: previo.items || [],
          total: totalPedido,
          referenciaPago,
        });
      } catch (emailErr) {
        console.error('[PayPhone] Error enviando email de confirmación:', emailErr);
      }

      // Enviar notificación por WhatsApp al admin (mensaje automático)
      const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
      const waNum = waNumber.startsWith('09') ? `593${waNumber.slice(1)}` : waNumber;
      if (waNum) {
        const waMsg = encodeURIComponent(
          `✅ Pago PayPhone aprobado\nPedido: ${clientTransactionId}\nCliente: ${previo.cliente_nombre || 'N/A'}\nTotal: $${totalPedido.toFixed(2)}\nRef: ${referenciaPago}`
        );
        // Log para referencia — el envío directo al admin vía WhatsApp API requiere WhatsApp Business
        console.info(`[PayPhone] WhatsApp admin notify: https://wa.me/${waNum}?text=${waMsg}`);
      }
    }

    revalidatePath('/admin/pedidos');
    revalidatePath('/admin/productos');
    revalidatePath('/tienda', 'layout');
    return { aprobado, numero: clientTransactionId };
  } catch (e) {
    console.error('PayPhone Confirm connection error', e);
    return { aprobado: false, error: 'No se pudo verificar el pago' };
  }
}

export async function getPedidosAdmin(estado?: string) {
  if (!(await isAdmin())) return { error: 'No autorizado', data: [] };

  const admin = createAdminClient();
  let query = admin.from('pedidos').select('*').order('created_at', { ascending: false });
  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function actualizarEstadoPedido(id: string, estado: string) {
  if (!(await isAdmin())) return { error: 'No autorizado' };

  const admin = createAdminClient();

  // Estado anterior, para saber si hay que mover el stock
  const { data: previo } = await admin.from('pedidos').select('estado, items, numero, cliente_nombre, cliente_email, total, metodo_pago').eq('id', id).single();

  const { data, error } = await admin.from('pedidos').update({ estado }).eq('id', id).select().single();
  if (error) return { error: error.message };

  if (previo) {
    if (estado === 'pagado' && previo.estado !== 'pagado') {
      await ajustarStock(admin, previo.items, -1);

      // Si se marca como pagado manualmente (ej. transferencia/efectivo), enviar correo de pago recibido al cliente.
      if (previo.cliente_email && (previo.metodo_pago === 'transferencia' || previo.metodo_pago === 'efectivo')) {
        try {
          const { emailPagoRecibido } = await import('@/lib/email');
          await emailPagoRecibido({
            numero: previo.numero,
            clienteNombre: previo.cliente_nombre,
            clienteEmail: previo.cliente_email,
            items: previo.items,
            total: previo.total,
          });
        } catch (err) {
          console.error('[actualizarEstadoPedido] Error enviando emailPagoRecibido:', err);
        }
      }
    } else if (previo.estado === 'pagado' && estado === 'cancelado') {
      await ajustarStock(admin, previo.items, 1);
    }
  }

  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/productos');
  revalidatePath('/tienda', 'layout');
  return { data };
}
export async function getUserRole() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'visitante';
  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return data?.role || 'visitante';
}

export async function eliminarPedidos(ids: string[]) {
  const role = await getUserRole();
  if (role !== 'propietario') return { error: 'No autorizado' };
  
  const admin = createAdminClient();
  const { error } = await admin.from('pedidos').delete().in('id', ids);
  
  if (error) return { error: error.message };
  revalidatePath('/admin/pedidos');
  return { ok: true };
}
