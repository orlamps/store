import { Metadata } from 'next';
import Link from 'next/link';
import { getContenido } from '@/app/actions/contenido';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Aviso Legal y Términos y Condiciones — OrLamps',
  description: 'Aviso Legal, Términos y Condiciones de uso del sitio web y canales digitales de OrLamps.',
};

export default async function AvisoLegalPage() {
  const contenido = await getContenido();

  const aviso_intro = contenido.legal_aviso_intro || 'El presente Aviso Legal regula el acceso y uso del sitio web www.orlamps.site, así como de los canales digitales oficiales y redes sociales de OrLamps, actuales o futuros. El acceso a cualquiera de estos medios implica la aceptación plena y sin reservas de las disposiciones aquí contenidas. OrLamps se reserva el derecho de modificar, actualizar o eliminar, en cualquier momento y sin previo aviso, el contenido, diseño o condiciones de uso de sus plataformas digitales.';
  const aviso_finalidad = contenido.legal_aviso_finalidad || 'El sitio web y redes sociales de OrLamps tienen carácter informativo, comercial y de contacto, con el objetivo de mostrar productos propios, trabajos realizados y permitir la solicitud de cotizaciones personalizadas. La información publicada no constituye una oferta contractual automática, ni obliga a OrLamps a aceptar pedidos, precios o plazos que no hayan sido confirmados expresamente.';
  const aviso_imagenes = contenido.legal_aviso_imagenes || 'Las imágenes publicadas en el sitio web y redes sociales corresponden a productos propios y trabajos reales realizados por OrLamps. Pueden existir variaciones mínimas propias del trabajo artesanal, los colores pueden presentar ligeras diferencias según la pantalla del usuario, y los acabados pueden variar levemente según el material disponible. Dichas variaciones no constituyen defectos ni incumplimiento.';
  const aviso_responsabilidad = contenido.legal_aviso_responsabilidad || 'OrLamps no se hace responsable por interpretaciones subjetivas del usuario sobre diseños, estilos o acabados; decisiones tomadas por el usuario sin una cotización confirmada; fallas técnicas de la web o redes sociales; ni contenidos o enlaces de terceros. El usuario utiliza el sitio y canales digitales bajo su propia responsabilidad.';
  const terminos_produccion = contenido.legal_terminos_produccion || 'Una vez que el cliente aprueba el diseño y/o especificaciones y realiza el abono para el inicio de la producción, se entiende que acepta continuar y concluir el proceso de fabricación hasta la entrega final del producto. No se realizan reembolsos en productos personalizados una vez iniciada la producción, incluso si el cliente cambia de opinión, desea modificar el pedido o decide no continuar. Esta condición es irrevocable debido a la naturaleza personalizada del producto.';
  const terminos_garantia = contenido.legal_terminos_garantia || 'OrLamps garantiza sus productos exclusivamente contra defectos de fabricación, entendidos como fallas estructurales o de ensamblaje atribuibles directamente al proceso de producción. Esta garantía aplica únicamente al producto entregado, no cubre daños por uso indebido, golpes, humedad, exposición al sol, manipulación incorrecta, desgaste natural o falta de mantenimiento, ni cubre variaciones propias de los materiales naturales o modificaciones realizadas por terceros. La garantía se limita, a criterio de OrLamps, a la reparación o corrección del defecto, sin que ello genere derecho a reembolsos, devoluciones o compensaciones adicionales.';

  return (
    <main style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: '56px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9B6F2F', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>Información Legal</p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#141414', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
            Aviso Legal &amp; Términos y Condiciones
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7 }}>
            El acceso y uso de los canales digitales de OrLamps implica la aceptación plena de las disposiciones aquí contenidas.
          </p>
        </div>

        {/* ─── AVISO LEGAL ─── */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
            <div style={{ height: '3px', width: '40px', backgroundColor: '#9B6F2F', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#141414', letterSpacing: '-0.02em', margin: 0 }}>Aviso Legal</h2>
          </div>

          <LegalCard>
            {aviso_intro.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </LegalCard>

          <LegalBlock title="Finalidad del sitio y canales digitales">
            {aviso_finalidad.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </LegalBlock>

          <LegalBlock title="Imágenes y contenido">
            {aviso_imagenes.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </LegalBlock>

          <LegalBlock title="Responsabilidad">
            {aviso_responsabilidad.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </LegalBlock>

          <LegalBlock title="Propiedad intelectual">
            <p>Todos los contenidos (fotografías, diseños, textos, renders, logotipos y marcas) son propiedad de OrLamps. Queda prohibida su reproducción, uso o explotación comercial sin autorización previa y por escrito.</p>
          </LegalBlock>

          <LegalBlock title="Legislación aplicable">
            <p>Este Aviso Legal se rige por la legislación vigente en la República del Ecuador. Cualquier controversia será resuelta ante los tribunales competentes del Ecuador.</p>
          </LegalBlock>
        </section>

        {/* Divisor */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0 0 64px' }} />

        {/* ─── TÉRMINOS Y CONDICIONES ─── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
            <div style={{ height: '3px', width: '40px', backgroundColor: '#9B6F2F', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#141414', letterSpacing: '-0.02em', margin: 0 }}>Términos y Condiciones de Uso</h2>
          </div>

          <LegalCard>
            <p>Los presentes Términos y Condiciones aplican al uso del sitio web <a href="https://www.orlamps.site" target="_blank" rel="noopener noreferrer" style={{ color: '#9B6F2F', fontWeight: 600 }}>www.orlamps.site</a> y a toda comunicación realizada a través de redes sociales de OrLamps, actuales o futuros.</p>
            <p>El uso de cualquiera de estos medios implica la aceptación total de estas condiciones.</p>
          </LegalCard>

          <LegalBlock title="Producción, abonos y no reembolsos">
            {terminos_produccion.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </LegalBlock>

          <LegalBlock title="Limitación de responsabilidad y garantía">
            {terminos_garantia.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </LegalBlock>

          <LegalBlock title="Contacto">
            <p>Para cualquier consulta, el usuario podrá comunicarse a través de los <Link href="/contacto" style={{ color: '#9B6F2F', fontWeight: 600 }}>canales oficiales</Link> publicados en este sitio web.</p>
          </LegalBlock>
        </section>

        {/* Pie */}
        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} OrLamps — Iluminación &amp; Diseño · <a href="https://www.orlamps.site" style={{ color: '#9B6F2F' }}>www.orlamps.site</a> · Ecuador
          </p>
        </div>

      </div>
    </main>
  );
}

// ── Componentes internos ─────────────────────────────────
function LegalCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #F0E6D0', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
      {children}
    </div>
  );
}

function LegalBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#141414', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9B6F2F', flexShrink: 0 }} />
        {title}
      </h3>
      <div style={{ paddingLeft: '16px', borderLeft: '2px solid #F0E6D0', lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
        {children}
      </div>
    </div>
  );
}

function LegalList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '8px 0 12px', paddingLeft: '20px', color: '#6b7280', lineHeight: 1.9 }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
