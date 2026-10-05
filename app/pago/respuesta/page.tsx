import Link from 'next/link';
import { confirmarPagoPayphone } from '@/app/actions/pedidos';

export const dynamic = 'force-dynamic';

export default async function PagoRespuestaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; clientTransactionId?: string }>;
}) {
  const { id, clientTransactionId } = await searchParams;

  const resultado =
    id && clientTransactionId
      ? await confirmarPagoPayphone(Number(id), clientTransactionId)
      : { aprobado: false, error: 'Faltan datos de la transacción' };

  const aprobado = resultado.aprobado;

  return (
    <main className="inner-page">
      <div className="inner-page-body" style={{ textAlign: 'center', maxWidth: '560px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>{aprobado ? '✅' : '⚠️'}</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '12px' }}>
          {aprobado ? '¡Pago recibido!' : 'No pudimos confirmar tu pago'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '32px' }}>
          {aprobado
            ? `Tu pedido ${clientTransactionId} fue pagado con éxito. Te contactaremos pronto para coordinar la entrega.`
            : 'El pago fue cancelado o no se pudo verificar. Si se te cobró, escríbenos por WhatsApp con tu número de pedido y lo resolvemos.'}
        </p>
        <Link href="/tienda" className="btn-primary">
          Volver a la tienda
        </Link>
      </div>
    </main>
  );
}
