import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getContenido } from '@/app/actions/contenido';
import ProductoDetalle from '@/components/tienda/ProductoDetalle';
import ProductoVisor from '@/components/tienda/ProductoVisor';
import { leerIvaConfig, leerRecargoTarjeta } from '@/lib/iva';

export const revalidate = 60;

async function getProducto(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre, slug)')
    .eq('slug', slug)
    .eq('disponible', true)
    .single();
  return data;
}

async function getRelacionados(categoriaId: string, excluirId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('productos')
    .select('id, nombre, slug, precio, imagen_url')
    .eq('disponible', true)
    .eq('categoria_id', categoriaId)
    .neq('id', excluirId)
    .limit(4);
  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) return { title: 'Producto no encontrado' };
  return {
    title: producto.nombre,
    description: producto.descripcion || `${producto.nombre} — OrLamps Iluminación & Diseño`,
    openGraph: {
      images: producto.imagen_url ? [{ url: producto.imagen_url }] : [],
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [producto, contenido] = await Promise.all([
    getProducto(slug),
    getContenido(),
  ]);

  if (!producto) notFound();

  const iva = leerIvaConfig(contenido);

  const relacionados = producto.categoria_id
    ? await getRelacionados(producto.categoria_id, producto.id)
    : [];

  const categoria = producto.categorias as any;

  return (
    <main className="inner-page">
      <div className="inner-page-body">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '36px', fontSize: '0.82rem', color: '#141414' }}>
          <Link href="/" style={{ color: '#141414', textDecoration: 'none' }}>Inicio</Link>
          <span>›</span>
          <Link href="/tienda" style={{ color: '#141414', textDecoration: 'none' }}>Tienda</Link>
          {categoria && (
            <>
              <span>›</span>
              <Link href={`/tienda?categoria=${categoria.slug}`} style={{ color: '#141414', textDecoration: 'none' }}>{categoria.nombre}</Link>
            </>
          )}
          <span>›</span>
          <span style={{ color: '#141414', fontWeight: 600 }}>{producto.nombre}</span>
        </div>

        {/* Producto principal (Visor dinámico) */}
        <ProductoVisor 
          producto={producto} 
          contenido={contenido} 
          iva={iva} 
          categoria={categoria}
        />

        {/* Contenido rico */}
        {producto.contenido && (
          <div className="bg-white rounded-2xl p-6 md:p-10 border border-[#eaeaea] mb-14 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#141414', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eaeaea' }}>
              Detalles del producto
            </h2>
            <div
              style={{ color: '#141414', fontSize: '1rem', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: producto.contenido }}
            />
          </div>
        )}

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#141414', marginBottom: '28px', letterSpacing: '-0.02em' }}>
              También te puede interesar
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {relacionados.map(r => (
                <Link key={r.id} href={`/tienda/${r.slug}`} className="product-card">
                  {r.imagen_url ? (
                    <img src={r.imagen_url} alt={r.nombre} className="product-card__img" />
                  ) : (
                    <div className="product-card__img-placeholder" style={{ color: '#141414' }}>
                      <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.25 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                  )}
                  <div className="product-card__body">
                    <span className="product-card__name">{r.nombre}</span>
                    <div className="product-card__price">
                      <span className="product-card__price-main">${r.precio}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .product-grid-2col { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </main>
  );
}
