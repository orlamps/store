import { getContenido } from '@/app/actions/contenido';
import { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce la historia de OrLamps, especialistas en iluminación y diseño de interiores.',
};

export default async function QuienesSomosPage() {
  const contenido = await getContenido();

  const titulo = contenido.quienes_somos_titulo || 'NUESTRA HISTORIA';
  const historia = contenido.quienes_somos_texto || 'OrLamps es una iniciativa de BH Mobiliarios, concebida a partir de una convicción: la iluminación define la atmósfera de un espacio y la manera en que se vive. Elaboramos piezas de iluminación trabajadas a mano, donde el diseño y el oficio artesanal se encuentran. Cada lámpara pasa por un proceso de fabricación en donde se cuidan la forma, el material y el acabado.';
  const mision = contenido.quienes_somos_mision || 'Diseñar y elaborar iluminación exclusiva que eleve la experiencia de los espacios, con calidad garantizada, acabados excepcionales y un servicio personalizado en cada etapa.';
  const vision = contenido.quienes_somos_vision || 'Consolidarnos como referente en iluminación de diseño, reconocidos por unir la excelencia artesanal con una estética contemporánea.';
  const valores = (contenido.quienes_somos_valores || 'Oficio, Excelencia, Exclusividad, Servicio, Integridad')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

  // Formatear enlaces dentro de la historia si se menciona BH Mobiliarios
  const renderHistoria = () => {
    if (historia.includes('BH Mobiliarios')) {
      const parts = historia.split('BH Mobiliarios');
      return (
        <>
          {parts[0]}
          <a href="http://www.bhmobiliarios.site" target="_blank" rel="noopener noreferrer" style={{ color: '#9B6F2F', textDecoration: 'underline', fontWeight: 600 }}>
            BH Mobiliarios
          </a>
          {parts.slice(1).join('BH Mobiliarios')}
        </>
      );
    }
    return historia;
  };

  return (
    <main className="inner-page">
      <div className="inner-page-body">
        {/* Hero de página / Nuestra Historia */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px 0',
          marginBottom: '48px',
          position: 'relative',
        }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#141414', marginBottom: '16px', letterSpacing: '0.05em', lineHeight: 1.2, textTransform: 'uppercase' }}>
            {titulo}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#141414', lineHeight: 1.7, maxWidth: '700px' }}>
            {renderHistoria()}
          </p>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', backgroundColor: '#FBF6EE', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#141414', marginBottom: '12px' }}>Misión</h2>
            <p style={{ color: '#141414', lineHeight: 1.75, fontSize: '0.95rem' }}>
              {mision}
            </p>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '52px', height: '52px', backgroundColor: '#FBF6EE', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#141414', marginBottom: '12px' }}>Visión</h2>
            <p style={{ color: '#141414', lineHeight: 1.75, fontSize: '0.95rem' }}>
              {vision}
            </p>
          </div>
        </div>

        {/* Valores */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#141414', marginBottom: '20px' }}>Valores</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            {valores.map(valor => (
              <span key={valor} style={{ padding: '8px 24px', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 600, color: '#141414' }}>
                {valor}
              </span>
            ))}
          </div>
        </div>

        {/* Lo que nos define */}
        <div className="bg-[#FBF6EE] rounded-2xl p-8 md:p-12 mb-12 border border-[#F0E6D0]">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#141414', marginBottom: '40px', textAlign: 'center', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            LO QUE NOS DEFINE
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
            {[
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>, titulo: 'Diseño exclusivo', desc: 'Piezas que otorgan a cada espacio una identidad inconfundible.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>, titulo: 'Elaboración artesanal', desc: 'Cada lámpara se trabaja a mano, con atención al detalle.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>, titulo: 'Calidad', desc: 'Materiales selectos y acabados de primer nivel.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>, titulo: 'Asesoría personalizada', desc: 'Te guiamos en la elección de la iluminación ideal para tu proyecto.' },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>, titulo: 'Entrega garantizada', desc: 'Gestionamos cada envío con el máximo cuidado para que tu pieza llegue impecable.' },
            ].map(v => (
              <div key={v.titulo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1 1 200px', maxWidth: '280px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{v.icon}</div>
                <div style={{ fontWeight: 700, color: '#141414', marginBottom: '8px', fontSize: '0.95rem' }}>{v.titulo}</div>
                <div style={{ fontSize: '0.85rem', color: '#141414', lineHeight: 1.6 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <a href="/tienda" className="btn-primary" style={{ marginRight: '16px' }}>
            Catálogo
          </a>
          <a href="/contacto" className="btn-outline">
            Contáctanos
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .qs-grid { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </main>
  );
}
