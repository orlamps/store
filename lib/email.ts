// ═══════════════════════════════════════════════════════════
// lib/email.ts — Sistema de correos OrLamps con Resend
// ═══════════════════════════════════════════════════════════

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://orlamps.site';

// Remitente: info@orlamps.site (dominio propio en Resend)
// Recepción interna: infoorlamps@gmail.com (configurado con RESEND_REPLY_TO)
const FROM = `OrLamps <${process.env.RESEND_FROM_EMAIL || 'info@orlamps.site'}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'infoorlamps@gmail.com';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

// ── Función base de envío ─────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!RESEND_API_KEY) {
    console.warn('[OrLamps Email] RESEND_API_KEY no configurada — correo no enviado');
    return;
  }
  const body: any = { from: FROM, to: [to], subject, html };
  if (replyTo) body.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[OrLamps Email] Error Resend:', err);
  }
}

// ── Bloque de encabezado — línea gráfica OrLamps ─────────
// Oro (#9B6F2F), crema (#FBF6EE), negro (#141414)
function buildHeader() {
  return `
  <div style="font-family:'Montserrat',Arial,sans-serif;max-width:600px;margin:0 auto;color:#141414;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #F0E6D0;">
    <!-- Header negro con logo blanco -->
    <div style="background:#141414;padding:32px 20px;text-align:center;">
      <a href="$SITE_URL" style="text-decoration:none;display:inline-block;">
        <img src="$SITE_URL/logo-blanco.png" alt="OrLamps" style="height:48px;width:auto;display:block;border:0;outline:none;margin:0 auto;" />
      </a>
    </div>
    <!-- Linea dorada decorativa -->
    <div style="height:3px;background:linear-gradient(90deg,#9B6F2F,#D4A96A,#9B6F2F);"></div>
    <!-- Cuerpo -->
    <div style="padding:32px 24px;background:#ffffff;">
`;
}

async function buildFooter() {
  const wa = WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  const waNum = wa.startsWith('09') ? `593${wa.slice(1)}` : wa;
  
  // Try to get social links dynamically if possible, else default to empty
  let ig = '';
  let fb = '';
  try {
    const { getContenido } = await import('@/app/actions/contenido');
    const contenido = await getContenido();
    ig = contenido.contacto_instagram || '';
    fb = contenido.contacto_facebook || '';
  } catch(e) {
    console.error('Error fetching social links for email', e);
  }

  return `
    </div>
    <!-- Footer -->
    <div style="background:#FBF6EE;padding:28px 20px;text-align:center;border-top:1px solid #F0E6D0;">
      <p style="margin:0 0 16px;font-size:0.85rem;color:#9B6F2F;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Encuéntranos en</p>
      <div style="margin-bottom:24px;display:flex;justify-content:center;gap:16px;align-items:center;">
        ${waNum ? `<a href="https://wa.me/${waNum}" style="display:inline-block;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/50/9B6F2F/whatsapp--v1.png" alt="WhatsApp" style="width:28px;height:28px;display:block;border:0;" />
        </a>` : ''}
        ${ig ? `<a href="${ig}" style="display:inline-block;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/50/9B6F2F/instagram-new--v1.png" alt="Instagram" style="width:28px;height:28px;display:block;border:0;" />
        </a>` : ''}
        ${fb ? `<a href="${fb}" style="display:inline-block;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/50/9B6F2F/facebook-new.png" alt="Facebook" style="width:28px;height:28px;display:block;border:0;" />
        </a>` : ''}
        <a href="${SITE_URL}/tienda" style="display:inline-block;text-decoration:none;">
          <img src="https://img.icons8.com/ios-filled/50/9B6F2F/domain--v1.png" alt="Tienda Online" style="width:28px;height:28px;display:block;border:0;" />
        </a>
      </div>
      <p style="margin:0;font-size:0.75rem;color:#b09070;">
        © ${new Date().getFullYear()} OrLamps — Iluminación &amp; Diseño<br/>
        <a href="${SITE_URL}" style="color:#9B6F2F;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>
      </p>
    </div>
  </div>
`;
}

// ── 1. Aviso a OrLamps: nuevo mensaje de contacto ────────
export async function emailNuevoContacto(data: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}) {
  const footer = await buildFooter();
  const html = `${buildHeader()}
    <h2 style="font-size:1.4rem;font-weight:800;color:#141414;margin:0 0 8px;letter-spacing:-0.02em;">📩 Nuevo mensaje de contacto</h2>
    <p style="color:#6b7280;font-size:0.9rem;margin:0 0 28px;">Alguien completó el formulario de contacto en tu tienda.</p>

    <div style="background:#FBF6EE;border-radius:10px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #9B6F2F;">
      <p style="margin:0 0 8px;font-size:0.85rem;color:#9B6F2F;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Datos del remitente</p>
      <p style="margin:4px 0;font-size:0.95rem;"><strong>Nombre:</strong> ${data.nombre}</p>
      <p style="margin:4px 0;font-size:0.95rem;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color:#9B6F2F;">${data.email}</a></p>
      ${data.telefono ? `<p style="margin:4px 0;font-size:0.95rem;"><strong>Teléfono:</strong> ${data.telefono}</p>` : ''}
    </div>

    <div style="background:#f9fafb;border-radius:10px;padding:20px 24px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 10px;font-size:0.85rem;color:#9B6F2F;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Mensaje</p>
      <p style="margin:0;font-size:0.95rem;line-height:1.7;color:#141414;white-space:pre-line;">${data.mensaje}</p>
    </div>

    <div style="text-align:center;margin-top:28px;">
      <a href="mailto:${data.email}" style="display:inline-block;background:#141414;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.9rem;">
        Responder al cliente →
      </a>
    </div>
  ${footer}`;

  await sendEmail(ADMIN_EMAIL, `📩 Nuevo contacto de ${data.nombre} — OrLamps`, html, data.email);
}

// ── 2. Confirmación al cliente: su mensaje fue recibido ──
export async function emailConfirmacionContacto(data: {
  nombre: string;
  email: string;
}) {
  const footer = await buildFooter();
  const html = `${buildHeader()}
    <h2 style="font-size:1.4rem;font-weight:800;color:#141414;margin:0 0 8px;letter-spacing:-0.02em;">¡Hola, ${data.nombre}!</h2>
    <p style="color:#6b7280;font-size:0.95rem;margin:0 0 24px;line-height:1.7;">Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te responderemos a la brevedad posible.</p>

    <div style="background:#FBF6EE;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:1.1rem;color:#9B6F2F;font-weight:700;">✨ Gracias por escribirnos</p>
      <p style="margin:8px 0 0;font-size:0.9rem;color:#141414;">Generalmente respondemos dentro de las próximas 24 horas hábiles.</p>
    </div>

    <p style="font-size:0.95rem;color:#141414;line-height:1.7;">Mientras tanto, puedes explorar nuestra colección de lámparas y diseños exclusivos en nuestra tienda.</p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${SITE_URL}/tienda" style="display:inline-block;background:#9B6F2F;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.9rem;">
        Ver Tienda →
      </a>
    </div>

    <p style="font-size:0.9rem;color:#141414;">Con cariño,<br/><strong>El equipo de OrLamps</strong></p>
  ${footer}`;

  await sendEmail(data.email, `Recibimos tu mensaje — OrLamps`, html);
}

// ── 3. Aviso a OrLamps: nuevo pedido registrado ──────────
export async function emailNuevoPedido(data: {
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  metodoPago: string;
}) {
  const footer = await buildFooter();
  const metodosLabel: Record<string, string> = {
    transferencia: '🏦 Transferencia bancaria',
    efectivo: '💵 Efectivo',
    payphone: '💳 Tarjeta (PayPhone)',
    whatsapp: '💬 WhatsApp',
  };

  const itemsHtml = data.items.map(it => `
    <tr>
      <td style="padding:10px 4px 10px 0;border-bottom:1px solid #f0e6d0;font-size:0.9rem;color:#141414;word-break:break-word;">${it.nombre}</td>
      <td style="padding:10px 4px;border-bottom:1px solid #f0e6d0;font-size:0.9rem;color:#6b7280;text-align:center;">×${it.cantidad}</td>
      <td style="padding:10px 0 10px 4px;border-bottom:1px solid #f0e6d0;font-size:0.9rem;font-weight:700;color:#141414;text-align:right;">$${(it.precio * it.cantidad).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `${buildHeader()}
    <h2 style="font-size:1.3rem;font-weight:800;color:#141414;margin:0 0 8px;letter-spacing:-0.02em;">🛍️ Nuevo pedido: ${data.numero}</h2>
    <p style="color:#6b7280;font-size:0.9rem;margin:0 0 24px;">Se ha registrado un nuevo pedido en tu tienda.</p>

    <div style="background:#FBF6EE;border-radius:10px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #9B6F2F;word-break:break-word;">
      <p style="margin:0 0 8px;font-size:0.85rem;color:#9B6F2F;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Cliente</p>
      <p style="margin:4px 0;font-size:0.95rem;"><strong>${data.clienteNombre}</strong></p>
      <p style="margin:4px 0;font-size:0.9rem;color:#6b7280;">${data.clienteEmail}</p>
      ${data.clienteTelefono ? `<p style="margin:4px 0;font-size:0.9rem;color:#6b7280;">📞 ${data.clienteTelefono}</p>` : ''}
    </div>

    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;min-width:280px;">
        <thead>
          <tr style="border-bottom:2px solid #F0E6D0;">
            <th style="padding:8px 0;text-align:left;font-size:0.78rem;color:#9B6F2F;text-transform:uppercase;letter-spacing:0.06em;">Producto</th>
            <th style="padding:8px 0;text-align:center;font-size:0.78rem;color:#9B6F2F;text-transform:uppercase;letter-spacing:0.06em;">Cant.</th>
            <th style="padding:8px 0;text-align:right;font-size:0.78rem;color:#9B6F2F;text-transform:uppercase;letter-spacing:0.06em;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #141414;">
      <span style="font-weight:800;font-size:1rem;color:#141414;">Total del pedido</span>
      <span style="font-weight:800;font-size:1.1rem;color:#9B6F2F;">$${data.total.toFixed(2)}</span>
    </div>

    <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-top:16px;">
      <p style="margin:0;font-size:0.9rem;"><strong>Método de pago:</strong> ${metodosLabel[data.metodoPago] || data.metodoPago}</p>
    </div>

    <div style="text-align:center;margin-top:28px;">
      <a href="${SITE_URL}/admin/pedidos" style="display:inline-block;background:#141414;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.9rem;">
        Ver en el panel →
      </a>
    </div>
  ${footer}`;

  await sendEmail(ADMIN_EMAIL, `🛍️ Pedido ${data.numero} — ${data.clienteNombre}`, html, data.clienteEmail);
}

// ── 4. Confirmación al cliente: pedido recibido ──────────
export async function emailConfirmacionPedido(data: {
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  metodoPago: string;
  transferenciaDatos?: string;
  efectivoInstrucciones?: string;
}) {
  const footer = await buildFooter();
  const itemsHtml = data.items.map(it => `
    <tr>
      <td style="padding:10px 4px 10px 0;border-bottom:1px solid #f0e6d0;font-size:0.9rem;color:#141414;word-break:break-word;">${it.nombre}</td>
      <td style="padding:10px 4px;border-bottom:1px solid #f0e6d0;font-size:0.9rem;color:#6b7280;text-align:center;">×${it.cantidad}</td>
      <td style="padding:10px 0 10px 4px;border-bottom:1px solid #f0e6d0;font-size:0.9rem;font-weight:700;color:#141414;text-align:right;">$${(it.precio * it.cantidad).toFixed(2)}</td>
    </tr>
  `).join('');

  let instruccionesHtml = '';
  if (data.metodoPago === 'transferencia') {
    instruccionesHtml = `
    <div style="background:#FBF6EE;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:4px solid #9B6F2F;word-break:break-word;">
      <p style="margin:0 0 8px;font-size:0.85rem;color:#9B6F2F;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">📋 Datos para la transferencia</p>
      <p style="margin:0;font-size:0.9rem;line-height:1.6;white-space:pre-line;color:#141414;">${data.transferenciaDatos || 'Pronto recibirás los datos bancarios por WhatsApp o correo.'}</p>
      <p style="margin:12px 0 0;font-size:0.85rem;color:#6b7280;">Una vez realizada la transferencia, envíanos el comprobante con tu número de pedido <strong>${data.numero}</strong>.</p>
    </div>`;
  } else if (data.metodoPago === 'efectivo') {
    instruccionesHtml = `
    <div style="background:#FBF6EE;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:4px solid #9B6F2F;word-break:break-word;">
      <p style="margin:0 0 8px;font-size:0.85rem;color:#9B6F2F;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">💵 Pago en efectivo</p>
      <p style="margin:0;font-size:0.9rem;line-height:1.6;white-space:pre-line;color:#141414;">${data.efectivoInstrucciones || 'Te contactaremos por WhatsApp para coordinar la entrega y el pago.'}</p>
    </div>`;
  }

  const html = `${buildHeader()}
    <h2 style="font-size:1.3rem;font-weight:800;color:#141414;margin:0 0 8px;letter-spacing:-0.02em;">¡Gracias por tu pedido, ${data.clienteNombre}! 🎉</h2>
    <p style="color:#6b7280;font-size:0.95rem;margin:0 0 24px;line-height:1.6;">Hemos recibido tu pedido correctamente. A continuación tienes el resumen.</p>

    <div style="background:#f9fafb;border-radius:10px;padding:12px 20px;margin-bottom:16px;text-align:center;">
      <p style="font-size:0.85rem;color:#9ca3af;margin:0 0 4px;">Número de pedido</p>
      <p style="font-size:1.2rem;font-weight:900;color:#141414;margin:0;letter-spacing:0.05em;">${data.numero}</p>
    </div>

    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;min-width:280px;">
        <thead>
          <tr style="border-bottom:2px solid #F0E6D0;">
            <th style="padding:8px 0;text-align:left;font-size:0.78rem;color:#9B6F2F;text-transform:uppercase;letter-spacing:0.06em;">Producto</th>
            <th style="padding:8px 0;text-align:center;font-size:0.78rem;color:#9B6F2F;text-transform:uppercase;letter-spacing:0.06em;">Cant.</th>
            <th style="padding:8px 0;text-align:right;font-size:0.78rem;color:#9B6F2F;text-transform:uppercase;letter-spacing:0.06em;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <div style="padding:12px 0;border-top:2px solid #141414;margin-bottom:8px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-weight:800;font-size:1rem;color:#141414;">Total a pagar</td>
          <td style="font-weight:800;font-size:1.2rem;color:#9B6F2F;text-align:right;">$${data.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${instruccionesHtml}

    <p style="font-size:0.9rem;color:#141414;line-height:1.6;margin-top:20px;">Si tienes alguna pregunta, puedes escribirnos directamente a este correo o contactarnos por WhatsApp.</p>

    <p style="font-size:0.9rem;color:#141414;margin-top:20px;">Con cariño,<br/><strong>El equipo de OrLamps</strong></p>
  ${footer}`;

  await sendEmail(data.clienteEmail, `Confirmación de pedido ${data.numero} — OrLamps`, html);
}

// ── 5. Confirmación PayPhone pagado (cliente + admin) ────
export async function emailPagoPayphoneAprobado(data: {
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  referenciaPago?: string;
}) {
  const footer = await buildFooter();
  const itemsHtml = data.items.map(it => `
    <tr>
      <td style="padding:8px 4px 8px 0;border-bottom:1px solid #f0e6d0;font-size:0.88rem;word-break:break-word;">${it.nombre} <span style="color:#9ca3af;">×${it.cantidad}</span></td>
      <td style="padding:8px 0 8px 4px;border-bottom:1px solid #f0e6d0;font-size:0.88rem;text-align:right;font-weight:700;">$${(it.precio * it.cantidad).toFixed(2)}</td>
    </tr>
  `).join('');

  // Email al cliente
  const htmlCliente = `${buildHeader()}
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#ecfdf5;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:2rem;">✅</div>
    </div>
    <h2 style="font-size:1.4rem;font-weight:800;color:#141414;margin:0 0 8px;letter-spacing:-0.02em;text-align:center;">¡Pago confirmado!</h2>
    <p style="color:#6b7280;font-size:0.95rem;margin:0 0 28px;text-align:center;line-height:1.6;">Tu pago fue procesado exitosamente. Pronto comenzaremos a preparar tu pedido.</p>

    <div style="background:#ecfdf5;border-radius:10px;padding:16px 20px;margin-bottom:20px;border:1px solid #a7f3d0;word-break:break-word;">
      <p style="margin:0;font-size:0.9rem;color:#059669;font-weight:700;">💳 Pago aprobado vía PayPhone</p>
      ${data.referenciaPago ? `<p style="margin:4px 0 0;font-size:0.82rem;color:#6b7280;">Ref. transacción: ${data.referenciaPago}</p>` : ''}
    </div>

    <div style="background:#f9fafb;border-radius:10px;padding:12px 20px;margin-bottom:20px;text-align:center;">
      <p style="font-size:0.85rem;color:#9ca3af;margin:0 0 4px;">Número de pedido</p>
      <p style="font-size:1.2rem;font-weight:900;color:#141414;margin:0;letter-spacing:0.05em;">${data.numero}</p>
    </div>

    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;min-width:280px;">
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0 0;font-weight:800;font-size:1rem;color:#141414;border-top:2px solid #141414;">Total pagado</td>
            <td style="padding:12px 0 0;font-weight:800;font-size:1.1rem;color:#9B6F2F;text-align:right;border-top:2px solid #141414;">$${data.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p style="font-size:0.9rem;color:#141414;line-height:1.6;margin-top:20px;">Te notificaremos cuando tu pedido esté en camino. Cualquier consulta, escríbenos.</p>
    <p style="font-size:0.9rem;color:#141414;">Con cariño,<br/><strong>El equipo de OrLamps</strong></p>
  ${footer}`;

  // Email al admin
  const htmlAdmin = `${buildHeader()}
    <h2 style="font-size:1.4rem;font-weight:800;color:#059669;margin:0 0 8px;">✅ Pago PayPhone aprobado: ${data.numero}</h2>
    <p style="color:#6b7280;font-size:0.9rem;margin:0 0 20px;">El pago fue procesado automáticamente. El pedido está listo para preparar.</p>
    <div style="background:#FBF6EE;border-radius:10px;padding:16px 20px;margin-bottom:20px;border-left:4px solid #9B6F2F;word-break:break-word;">
      <p style="margin:0;"><strong>${data.clienteNombre}</strong> — <a href="mailto:${data.clienteEmail}" style="color:#9B6F2F;">${data.clienteEmail}</a></p>
      ${data.referenciaPago ? `<p style="margin:4px 0 0;font-size:0.85rem;color:#6b7280;">Ref. PayPhone: ${data.referenciaPago}</p>` : ''}
    </div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;min-width:280px;">
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0 0;font-weight:800;border-top:2px solid #141414;">Total</td>
            <td style="padding:12px 0 0;font-weight:800;color:#9B6F2F;text-align:right;border-top:2px solid #141414;">$${data.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style="text-align:center;margin-top:20px;">
      <a href="${SITE_URL}/admin/pedidos" style="display:inline-block;background:#141414;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.9rem;">Ver en el panel →</a>
    </div>
  ${footer}`;

  await Promise.all([
    sendEmail(data.clienteEmail, `✅ Pago confirmado — Pedido ${data.numero} | OrLamps`, htmlCliente),
    sendEmail(ADMIN_EMAIL, `✅ Pago PayPhone aprobado: ${data.numero} — ${data.clienteNombre}`, htmlAdmin),
  ]);
}

// ── 6. Confirmación de Pago Recibido (Manual) ────────────
export async function emailPagoRecibido(data: {
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
}) {
  const footer = await buildFooter();
  const itemsHtml = data.items.map(it => `
    <tr>
      <td style="padding:8px 4px 8px 0;border-bottom:1px solid #f0e6d0;font-size:0.88rem;word-break:break-word;">${it.nombre} <span style="color:#9ca3af;">×${it.cantidad}</span></td>
      <td style="padding:8px 0 8px 4px;border-bottom:1px solid #f0e6d0;font-size:0.88rem;text-align:right;font-weight:700;">$${(it.precio * it.cantidad).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `${buildHeader()}
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#ecfdf5;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:2rem;">✅</div>
    </div>
    <h2 style="font-size:1.4rem;font-weight:800;color:#141414;margin:0 0 8px;letter-spacing:-0.02em;text-align:center;">¡Pago recibido!</h2>
    <p style="color:#6b7280;font-size:0.95rem;margin:0 0 28px;text-align:center;line-height:1.6;">Hemos confirmado la recepción de tu pago. Comenzaremos a preparar tu pedido.</p>

    <div style="background:#f9fafb;border-radius:10px;padding:12px 20px;margin-bottom:20px;text-align:center;">
      <p style="font-size:0.85rem;color:#9ca3af;margin:0 0 4px;">Número de pedido</p>
      <p style="font-size:1.2rem;font-weight:900;color:#141414;margin:0;letter-spacing:0.05em;">${data.numero}</p>
    </div>

    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;min-width:280px;">
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 0 0;font-weight:800;font-size:1rem;color:#141414;border-top:2px solid #141414;">Total pagado</td>
            <td style="padding:12px 0 0;font-weight:800;font-size:1.1rem;color:#9B6F2F;text-align:right;border-top:2px solid #141414;">$${data.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p style="font-size:0.9rem;color:#141414;line-height:1.6;margin-top:20px;">Te notificaremos cuando tu pedido esté listo y en camino.</p>
    <p style="font-size:0.9rem;color:#141414;">Con cariño,<br/><strong>El equipo de OrLamps</strong></p>
  ${footer}`;

  await sendEmail(data.clienteEmail, `✅ Pago recibido — Pedido ${data.numero} | OrLamps`, html);
}

