'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
};

// ── Mapa de íconos por palabras clave en el slug/nombre ──────────────────────
function CategoriaIcono({ slug, nombre }: { slug: string; nombre: string }) {
  const key = (slug + ' ' + nombre).toLowerCase();
  const c = '#9B6F2F'; // dorado OrLamps
  const s = { width: 36, height: 36 };

  // Colgantes — cable desde techo + pantalla cónica abierta hacia abajo
  if (/colgante|pendant|suspendi|colgar/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Riel de techo */}
      <line x1="6" y1="2" x2="18" y2="2" strokeWidth="2.2" />
      {/* Cable */}
      <line x1="12" y1="2" x2="12" y2="7" />
      {/* Pantalla cónica (abierta abajo) */}
      <path d="M7 7 L5 16 Q12 18 19 16 L17 7 Z" fill={c} fillOpacity="0.1" />
      <line x1="7" y1="7" x2="17" y2="7" />
      {/* Borde inferior abierto */}
      <path d="M5 16 Q12 18.5 19 16" />
    </svg>
  );

  // De mesa — pantalla trapezoidal + tallo corto + base oval
  if (/mesa|sobremesa|table|escritorio/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Pantalla trapezoidal: más ancha abajo */}
      <path d="M9 3 L7 12 H17 L15 3 Z" fill={c} fillOpacity="0.1" />
      <line x1="9" y1="3" x2="15" y2="3" />
      <line x1="7" y1="12" x2="17" y2="12" />
      {/* Tallo */}
      <line x1="12" y1="12" x2="12" y2="18" />
      {/* Base oval */}
      <path d="M8 18 Q12 21 16 18" fill={c} fillOpacity="0.15" stroke={c} />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );

  // De pie — pantalla pequeña + poste largo + base ancha
  if (/pie|floor|standing|torche|arco/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Pantalla (cono pequeño en la cima) */}
      <path d="M9 2 L8 8 H16 L15 2 Z" fill={c} fillOpacity="0.1" />
      <line x1="9" y1="2" x2="15" y2="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      {/* Poste largo */}
      <line x1="12" y1="8" x2="12" y2="20" strokeWidth="1.4" />
      {/* Base */}
      <line x1="7" y1="20" x2="17" y2="20" strokeWidth="2" />
      <path d="M8 22 Q12 22.5 16 22" />
    </svg>
  );

  // Apliques — pared vertical + brazo horizontal + pantalla
  if (/aplique|pared|wall|mural/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Pared */}
      <line x1="4" y1="2" x2="4" y2="22" strokeWidth="2.5" />
      {/* Placa de montaje */}
      <rect x="3" y="9" width="2.5" height="6" rx="1" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.2" />
      {/* Brazo */}
      <line x1="5.5" y1="12" x2="10" y2="12" />
      {/* Pantalla (semicono apuntando adelante) */}
      <path d="M10 8 L8 12 L10 16 Q16 15 16 12 Q16 9 10 8 Z" fill={c} fillOpacity="0.1" />
    </svg>
  );

  // Plafones — disco pegado al techo con luz hacia abajo
  if (/plafon|techo|ceiling|empotrad|downlight|flush/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Techo */}
      <line x1="3" y1="2" x2="21" y2="2" strokeWidth="2.2" />
      {/* Cuerpo del plafón (disco/pastilla) */}
      <rect x="6" y="2" width="12" height="5" rx="2.5" fill={c} fillOpacity="0.15" stroke={c} />
      {/* Rayos de luz hacia abajo */}
      <line x1="12" y1="8" x2="12" y2="14" />
      <line x1="8" y1="9" x2="6" y2="15" strokeOpacity="0.5" />
      <line x1="16" y1="9" x2="18" y2="15" strokeOpacity="0.5" />
      {/* Halo de luz */}
      <path d="M7 16 Q12 18 17 16" strokeOpacity="0.4" />
    </svg>
  );

  // Exterior / Jardín / Outdoor
  if (/exterior|jardin|outdoor|jarr[íi]n|jard/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 5 5c0 2-1 3.5-2.5 4.5L14 14h-4l-.5-2.5C8 10.5 7 9 7 7a5 5 0 0 1 5-5z" />
      <path d="M10 14v4" />
      <path d="M14 14v4" />
      <path d="M8 18h8" />
      <line x1="12" y1="2" x2="12" y2="2.5" />
    </svg>
  );

  // Araña / Chandelier / Lámpara de techo con varios brazos
  if (/ara[nñ]|chandelier|brazo|candelabro/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="5" />
      <circle cx="12" cy="6" r="1.5" fill={c} />
      <path d="M6 9c0-3.3 2.7-4 6-4s6 .7 6 4" />
      <path d="M6 9l-2 4" /><path d="M18 9l2 4" /><path d="M9 9l-1 4" /><path d="M15 9l1 4" /><path d="M12 9v4" />
      <circle cx="4" cy="14" r="1.5" stroke={c} fill="none" />
      <circle cx="8" cy="14" r="1.5" stroke={c} fill="none" />
      <circle cx="12" cy="14" r="1.5" stroke={c} fill="none" />
      <circle cx="16" cy="14" r="1.5" stroke={c} fill="none" />
      <circle cx="20" cy="14" r="1.5" stroke={c} fill="none" />
    </svg>
  );

  // LED / Tira / Strip / Neon
  if (/led|tira|strip|neon|flex/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="20" height="6" rx="3" stroke={c} />
      <line x1="6" y1="12" x2="18" y2="12" stroke={c} strokeDasharray="2 2" />
      <path d="M5 7l1 2M9 7l1 2M13 7l1 2M17 7l1 2" />
    </svg>
  );

  // Decorativa / Arte / Design / Artesanal
  if (/decorati|arte|artis|artesanal|design|madera|bambu|rattan/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 5 5 5 8c0 2 1 3.5 2.5 5L12 22l4.5-9C18 11.5 19 10 19 8c0-3-3-6-7-6z" />
      <circle cx="12" cy="8" r="2" fill={c} fillOpacity="0.3" stroke={c} />
    </svg>
  );

  // Infantil / Niños / Kids
  if (/infantil|ni[nñ]o|kids|bebe|nursery/.test(key)) return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="4" />
      <path d="M8 10c0-2.2 1.8-4 4-4" stroke={c} strokeDasharray="1.5 1.5" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <path d="M8 18c0-1.1 1.8-2 4-2s4 .9 4 2" />
      <path d="M7 6l-2-2M17 6l2-2M12 4V2" />
    </svg>
  );

  // ── Fallback: bombilla elegante OrLamps ──────────────────────────────────
  return (
    <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export default function CategoriasSlider({ categorias }: { categorias: Categoria[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categorias]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%',
            width: '40px', height: '40px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#141414',
          }}
          aria-label="Anterior"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollBehavior: 'smooth', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="hide-scrollbar"
      >
        {categorias.map(cat => (
          <Link
            key={cat.id}
            href={`/tienda?categoria=${cat.slug}`}
            className="cat-card"
            style={{
              flex: '0 0 auto', width: '180px',
              backgroundColor: '#FFFFFF', borderRadius: '14px',
              padding: '24px 16px', textAlign: 'center',
              border: '1px solid #e5e7eb',
              textDecoration: 'none', transition: 'all 0.22s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: 'rgba(155,111,47,0.08)', border: '1px solid rgba(155,111,47,0.15)',
            }}>
              <CategoriaIcono slug={cat.slug} nombre={cat.nombre} />
            </div>
            <div style={{ fontWeight: 700, color: '#141414', fontSize: '0.95rem', lineHeight: 1.3 }}>{cat.nombre}</div>
            {cat.descripcion && (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.5, marginTop: '4px' }}>{cat.descripcion}</div>
            )}
          </Link>
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%',
            width: '40px', height: '40px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#141414',
          }}
          aria-label="Siguiente"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
