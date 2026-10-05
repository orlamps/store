import { Metadata } from 'next';
import Link from 'next/link';

import { getContenido } from '@/app/actions/contenido';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Política de Privacidad — OrLamps',
  description: 'Política de Privacidad del sitio web y canales digitales de OrLamps.',
};

export default async function PrivacidadPage() {
  const contenido = await getContenido();

  const privacidad_intro = contenido.legal_privacidad_intro || 'En OrLamps, respetamos la privacidad de nuestros usuarios y clientes. Esta política regula el tratamiento de la información personal obtenida a través de www.orlamps.site y de todos nuestros canales digitales oficiales.';
  const privacidad_datos = contenido.legal_privacidad_datos || 'OrLamps no recopila información personal mediante formularios web de forma automática.\n\nLa información personal se obtiene únicamente cuando el usuario decide contactarnos de forma voluntaria, principalmente a través de enlaces directos a WhatsApp u otros canales digitales.\n\nLa información puede incluir:\n- Nombre\n- Número de teléfono\n- Dirección de entrega\n- Información necesaria para cotizaciones, pedidos o productos personalizados (materiales, tonos, colores, acabados u otras especificaciones)';
  const privacidad_uso = contenido.legal_privacidad_uso || 'La información proporcionada por el usuario se utiliza exclusivamente para:\n- Atender consultas\n- Elaborar cotizaciones personalizadas\n- Gestionar pedidos y procesos de producción\n- Coordinar entregas y envíos\n- Mantener comunicación relacionada con los productos o servicios solicitados\n\nOrLamps no utiliza la información para fines distintos a los aquí descritos.';
  const privacidad_entregas = contenido.legal_privacidad_entregas || 'La información relacionada con direcciones, referencias, horarios y datos de contacto será utilizada únicamente para coordinar la entrega o envío de los productos.\n\nOrLamps no se responsabiliza por:\n- Retrasos ocasionados por información incorrecta o incompleta proporcionada por el cliente\n- Ausencia del cliente en el lugar y horario acordado\n- Cambios de dirección no comunicados oportunamente\n\nLos costos, tiempos y condiciones de entrega o envío serán informados y acordados previamente con el cliente.';
  const privacidad_confidencialidad = contenido.legal_privacidad_confidencialidad || 'OrLamps adopta medidas razonables para proteger la información personal recibida. No obstante, el usuario reconoce que las plataformas de mensajería y redes sociales cuentan con políticas de privacidad propias, ajenas al control de OrLamps.\n\nOrLamps no vende ni comparte datos personales con terceros, salvo cuando sea requerido por ley o autoridad competente, o sea estrictamente necesario para cumplir con la entrega o servicio solicitado.';

  const secciones = [
    {
      numero: '1',
      titulo: 'Información que recopilamos',
      contenido: privacidad_datos.split('\n').filter(Boolean).map((p, i) => {
        if (p.startsWith('- ')) return <li key={i}>{p.substring(2)}</li>;
        if (p.endsWith(':')) return <p key={i}>{p}</p>;
        return <p key={i}>{p}</p>;
      })
    },
    {
      numero: '2',
      titulo: 'Uso de la información',
      contenido: privacidad_uso.split('\n').filter(Boolean).map((p, i) => {
        if (p.startsWith('- ')) return <li key={i}>{p.substring(2)}</li>;
        return <p key={i}>{p}</p>;
      })
    },
    {
      numero: '3',
      titulo: 'Entregas y envíos',
      contenido: privacidad_entregas.split('\n').filter(Boolean).map((p, i) => {
        if (p.startsWith('- ')) return <li key={i}>{p.substring(2)}</li>;
        return <p key={i}>{p}</p>;
      })
    },
    {
      numero: '4',
      titulo: 'Confidencialidad y protección de datos',
      contenido: privacidad_confidencialidad.split('\n').filter(Boolean).map((p, i) => {
        if (p.startsWith('- ')) return <li key={i}>{p.substring(2)}</li>;
        return <p key={i}>{p}</p>;
      })
    },
    {
      numero: '5',
      titulo: 'Responsabilidad del usuario',
      contenido: <p>El usuario es responsable de la veracidad y exactitud de la información proporcionada. OrLamps no se responsabiliza por consecuencias derivadas de información incorrecta, incompleta o desactualizada.</p>
    },
    {
      numero: '6',
      titulo: 'Conservación de la información',
      contenido: <p>La información personal será conservada únicamente durante el tiempo necesario para dar seguimiento a la comunicación, cotización, producción, entrega o relación comercial, o según lo exija la legislación ecuatoriana vigente.</p>
    },
    {
      numero: '7',
      titulo: 'Modificaciones a la Política de Privacidad',
      contenido: <p>OrLamps se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación en <a href="https://www.orlamps.site/privacidad" style={{ color: '#9B6F2F', fontWeight: 600 }}>www.orlamps.site</a>.</p>
    }
  ];

  return (
    <main style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9B6F2F', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Información Legal
          </p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#141414', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
            Política de Privacidad
          </h1>
          <div style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            {privacidad_intro.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        {/* Aviso de aceptación */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #F0E6D0', borderLeft: '4px solid #9B6F2F', borderRadius: '10px', padding: '18px 22px', marginBottom: '48px', color: '#374151', fontSize: '0.9rem', lineHeight: 1.7 }}>
          El uso del sitio web o el inicio de una conversación a través de nuestros canales implica la <strong>aceptación de esta Política de Privacidad</strong>.
        </div>

        {/* Secciones numeradas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {secciones.map((s) => (
            <div key={s.numero} style={{ display: 'flex', gap: '24px', marginBottom: '36px', alignItems: 'flex-start' }}>
              {/* Número */}
              <div style={{ flexShrink: 0, width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FBF6EE', border: '2px solid #F0E6D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#9B6F2F', fontSize: '0.9rem', marginTop: '2px' }}>
                {s.numero}
              </div>
              {/* Contenido */}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#141414', marginBottom: '12px', marginTop: '8px' }}>
                  {s.titulo}
                </h2>
                <div style={{
                  color: '#374151',
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                }}>
                  <style dangerouslySetInnerHTML={{ __html: `
                    .privacidad-content p { margin: 0 0 10px; }
                    .privacidad-content ul { margin: 6px 0 12px; padding-left: 20px; color: #6b7280; line-height: 1.9; }
                    .privacidad-content li { margin-bottom: 2px; }
                  ` }} />
                  <div className="privacidad-content">{s.contenido}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divisor */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '16px 0 40px' }} />

        {/* Contacto */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '28px 32px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 16px' }}>
            ¿Tienes preguntas sobre nuestra Política de Privacidad?
          </p>
          <Link href="/contacto" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', backgroundColor: '#9B6F2F', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Contáctanos
          </Link>
        </div>

        {/* Links legales */}
        <div style={{ marginTop: '40px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/aviso-legal" style={{ color: '#9B6F2F', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Aviso Legal y Términos y Condiciones →
          </Link>
        </div>

        {/* Pie */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} OrLamps — Iluminación &amp; Diseño ·{' '}
            <a href="https://www.orlamps.site" style={{ color: '#9B6F2F' }}>www.orlamps.site</a> · Ecuador
          </p>
        </div>

      </div>
    </main>
  );
}
