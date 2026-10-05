import Link from 'next/link';
import Image from 'next/image';
import { getContenido } from '@/app/actions/contenido';
import { createClient } from '@supabase/supabase-js';
import CategoriasSlider from '@/components/CategoriasSlider';

export const revalidate = 60;

async function getProductosDestacados() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('productos')
    .select('id, nombre, slug, descripcion, precio, precio_oferta, imagen_url, categorias(nombre)')
    .eq('disponible', true)
    .eq('destacado', true)
    .order('orden')
    .limit(6);
  return data || [];
}

async function getCategoriasHome() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('categorias')
    .select('id, nombre, slug, descripcion')
    .eq('activa', true)
    .order('orden')
    .limit(6);
  return data || [];
}

export default async function HomePage() {
  const [contenido, destacados, categorias] = await Promise.all([
    getContenido(),
    getProductosDestacados(),
    getCategoriasHome(),
  ]);

  const whatsapp = contenido.contacto_whatsapp || '';

  return (
    <main style={{ paddingTop: '100px' }}>
      {/* ── HERO ── */}
      <section style={{ width: '100%', position: 'relative', backgroundColor: '#EFEFEF', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/banner.png" 
          alt="OrLamps | Iluminación & Diseño" 
          fetchPriority="high"
          style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
        />
      </section>

      {/* ── CATEGORÍAS ── */}
      {categorias.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ textAlign: 'center', margin: '0 auto 48px', maxWidth: '600px' }}>
              <h2 className="section-heading">{contenido.home_colecciones_titulo || 'Nuestras Colecciones'}</h2>
              <p className="section-subtitle">{contenido.home_colecciones_subtitulo || 'Encuentra la iluminación perfecta para cada espacio'}</p>
            </div>
            <CategoriasSlider categorias={categorias} />
          </div>
        </section>
      )}

      {/* ── PRODUCTOS DESTACADOS ── */}
      {destacados.length > 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="section-heading">{contenido.home_destacados_titulo || 'Productos Destacados'}</h2>
                <p className="section-subtitle" style={{ textAlign: 'left', marginTop: '8px', margin: '8px 0 0 0' }}>{contenido.home_destacados_subtitulo || 'Piezas seleccionadas de nuestra colección'}</p>
              </div>
              <Link href="/tienda" style={{ color: '#9B6F2F', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '0.03em' }}>
                Ver todo el catálogo →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {destacados.map(p => (
                <Link key={p.id} href={`/tienda/${p.slug}`} className="product-card">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} className="product-card__img" />
                  ) : (
                    <div className="product-card__img-placeholder">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.3 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                  <div className="product-card__body">
                    <span className="product-card__category">{(p.categorias as any)?.nombre || 'OrLamps'}</span>
                    <span className="product-card__name">{p.nombre}</span>
                    {p.descripcion && <p className="product-card__desc">{p.descripcion}</p>}
                    <div className="product-card__price">
                      <span className="product-card__price-main">${p.precio}</span>
                      {p.precio_oferta && <span className="product-card__price-offer">${p.precio_oferta}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ── */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '80px 24px', textAlign: 'center', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: '#141414', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {contenido.home_cta_titulo || '¿Buscas algo especial?'}
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '36px' }}>
            {contenido.home_cta_subtitulo || 'Contáctanos y te ayudamos a encontrar la iluminación perfecta para tu espacio.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/tienda" className="btn-primary">
              Catálogo
            </Link>
            <Link href="/contacto" className="btn-outline">
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
