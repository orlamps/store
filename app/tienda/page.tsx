import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explora toda nuestra colección de lámparas y luminarias de diseño.',
};

async function getProductos(categoriaSlug?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase
    .from('productos')
    .select('id, nombre, slug, descripcion, precio, precio_oferta, imagen_url, destacado, categorias(id, nombre, slug)')
    .eq('disponible', true)
    .order('orden')
    .order('created_at', { ascending: false });

  if (categoriaSlug) {
    // Join por slug de categoría
    const { data: cat } = await supabase.from('categorias').select('id').eq('slug', categoriaSlug).single();
    if (cat) query = query.eq('categoria_id', cat.id);
  }

  const { data } = await query;
  return data || [];
}

async function getCategorias() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from('categorias').select('id, nombre, slug').eq('activa', true).order('orden');
  return data || [];
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [productos, categorias] = await Promise.all([
    getProductos(categoria),
    getCategorias(),
  ]);

  return (
    <main className="inner-page">
      <div className="inner-page-body">


        {/* Filtro por categoría */}
        {categorias.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <Link
              href="/tienda"
              style={{
                padding: '7px 18px', borderRadius: '99px', border: '1px solid',
                fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                borderColor: !categoria ? '#9B6F2F' : '#e5e7eb',
                backgroundColor: !categoria ? '#FBF6EE' : '#fff',
                color: !categoria ? '#9B6F2F' : '#141414',
              }}
            >
              Todos
            </Link>
            {categorias.map(cat => (
              <Link
                key={cat.id}
                href={`/tienda?categoria=${cat.slug}`}
                style={{
                  padding: '7px 18px', borderRadius: '99px', border: '1px solid',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                  borderColor: categoria === cat.slug ? '#9B6F2F' : '#e5e7eb',
                  backgroundColor: categoria === cat.slug ? '#FBF6EE' : '#fff',
                  color: categoria === cat.slug ? '#9B6F2F' : '#141414',
                }}
              >
                {cat.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* Grid de productos */}
        {productos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', backgroundColor: '#fff', borderRadius: '20px', border: '1px dashed #e5e7eb' }}>
            <div style={{ color: '#141414', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#141414', marginBottom: '10px' }}>Sin productos aún</h3>
            <p style={{ color: '#141414', marginBottom: '28px' }}>
              {categoria ? 'No hay productos en esta categoría.' : 'Pronto tendremos nuestra colección disponible.'}
            </p>
            {categoria && (
              <Link href="/tienda" className="btn-outline">Ver todos los productos</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {productos.map(p => (
              <Link key={p.id} href={`/tienda/${p.slug}`} className="product-card">
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.nombre} className="product-card__img" />
                ) : (
                  <div className="product-card__img-placeholder">
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.25 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div className="product-card__body">
                  <span className="product-card__category">
                    {(p.categorias as any)?.nombre || 'OrLamps'}
                  </span>
                  <span className="product-card__name">{p.nombre}</span>
                  {p.descripcion && <p className="product-card__desc">{p.descripcion}</p>}
                  <div className="product-card__price">
                    <span className="product-card__price-main">${p.precio}</span>
                    {p.precio_oferta && (
                      <span className="product-card__price-offer">${p.precio_oferta}</span>
                    )}
                    {p.precio_oferta && (
                      <span className="product-card__badge-offer">
                        -{Math.round((1 - p.precio / p.precio_oferta) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
