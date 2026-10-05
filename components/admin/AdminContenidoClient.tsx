'use client';

import { useState, useTransition } from 'react';
import { actualizarMultipleContenido } from '@/app/actions/contenido';
import { useRouter } from 'next/navigation';

type ContenidoMap = Record<string, string>;

interface Campo {
  clave: string;
  label: string;
  tipo: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  ayuda?: string;
  opciones?: Array<{ valor: string; texto: string }>;
}

interface SeccionTab {
  id: string;
  titulo: string;
  icono: React.ReactNode;
  grupos: Array<{
    subtitulo: string;
    descripcion?: string;
    campos: Campo[];
  }>;
}

const SECCIONES: SeccionTab[] = [
  {
    id: 'inicio',
    titulo: 'Página de Inicio',
    icono: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    grupos: [{
        subtitulo: 'Sección Colecciones',
        descripcion: 'Títulos que encabezan la cuadrícula de categorías en la portada.',
        campos: [
          { clave: 'home_colecciones_titulo', label: 'Título de Colecciones', tipo: 'text', placeholder: 'Nuestras Colecciones' },
          { clave: 'home_colecciones_subtitulo', label: 'Subtítulo de Colecciones', tipo: 'text', placeholder: 'Encuentra la iluminación perfecta para cada espacio' },
        ],
      },
      {
        subtitulo: 'Sección Productos Destacados',
        descripcion: 'Encabezado de los productos seleccionados en la portada.',
        campos: [
          { clave: 'home_destacados_titulo', label: 'Título de Destacados', tipo: 'text', placeholder: 'Productos Destacados' },
          { clave: 'home_destacados_subtitulo', label: 'Subtítulo de Destacados', tipo: 'text', placeholder: 'Piezas seleccionadas de nuestra colección' },
        ],
      },
      {
        subtitulo: 'Llamado a la acción final (CTA)',
        descripcion: 'Bloque inferior para invitar a contactar o ver la tienda.',
        campos: [
          { clave: 'home_cta_titulo', label: 'Título del CTA', tipo: 'text', placeholder: '¿Buscas algo especial?' },
          { clave: 'home_cta_subtitulo', label: 'Texto descriptivo del CTA', tipo: 'textarea', placeholder: 'Contáctanos y te ayudamos a encontrar la iluminación perfecta para tu espacio.' },
        ],
      },
      {
        subtitulo: 'Pie de página (Footer)',
        descripcion: 'Textos que aparecen al final de todo el sitio web.',
        campos: [
          { clave: 'footer_texto', label: 'Texto bajo el logo', tipo: 'text', placeholder: 'Iluminación & Diseño' },
          { clave: 'footer_ciudad', label: 'Ciudad / Ubicación', tipo: 'text', placeholder: 'Quito, Ecuador' },
        ],
      },
    ],
  },
  {
    id: 'nosotros',
    titulo: 'Sobre Nosotros',
    icono: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    grupos: [{
        subtitulo: 'Historia y Presentación',
        descripcion: 'Texto principal que narra el origen y la esencia de la marca.',
        campos: [
          { clave: 'quienes_somos_titulo', label: 'Título de la página', tipo: 'text', placeholder: 'NUESTRA HISTORIA' },
          { clave: 'quienes_somos_texto', label: 'Párrafo de Historia', tipo: 'textarea', placeholder: 'OrLamps es una iniciativa de BH Mobiliarios...' },
        ],
      },
      {
        subtitulo: 'Misión y Visión',
        descripcion: 'Propósito y proyección de la empresa.',
        campos: [
          { clave: 'quienes_somos_mision', label: 'Misión', tipo: 'textarea', placeholder: 'Diseñar y elaborar iluminación exclusiva...' },
          { clave: 'quienes_somos_vision', label: 'Visión', tipo: 'textarea', placeholder: 'Consolidarnos como referente en iluminación...' },
        ],
      },
      {
        subtitulo: 'Valores Corporativos',
        descripcion: 'Palabras clave que definen la cultura (separadas por comas).',
        campos: [
          { clave: 'quienes_somos_valores', label: 'Valores', tipo: 'text', placeholder: 'Oficio, Excelencia, Exclusividad, Servicio, Integridad', ayuda: 'Escribe los valores separados por comas para que aparezcan como etiquetas.' },
        ],
      },
    ],
  },
  {
    id: 'contacto',
    titulo: 'Contacto & Redes',
    icono: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    grupos: [{
        subtitulo: 'Encabezado de Contacto',
        descripcion: 'Textos de la parte superior de la página de contacto.',
        campos: [
          { clave: 'contacto_titulo', label: 'Título de Contacto', tipo: 'text', placeholder: 'ESTAMOS PARA AYUDARTE' },
          { clave: 'contacto_subtitulo', label: 'Subtítulo', tipo: 'text', placeholder: 'Escríbenos con tu consulta y te responderemos a la brevedad.' },
        ],
      },
      {
        subtitulo: 'Datos de Contacto Directo',
        descripcion: 'Canales oficiales para atención a clientes.',
        campos: [
          { clave: 'contacto_email', label: 'Correo Electrónico', tipo: 'text', placeholder: 'info@orlamps.site' },
          { clave: 'contacto_telefono', label: 'Teléfono', tipo: 'text', placeholder: '098 757 5412' },
          { clave: 'contacto_whatsapp', label: 'WhatsApp (Visible en la tienda)', tipo: 'text', placeholder: '098 757 5412', ayuda: 'El sistema enlazará automáticamente a wa.me con el prefijo internacional de Ecuador.' },
          { clave: 'contacto_direccion', label: 'Ubicación / Ciudad', tipo: 'text', placeholder: 'Quito, Ecuador' },
        ],
      },
      {
        subtitulo: 'Redes Sociales Oficiales',
        descripcion: 'Enlaces a los perfiles de la marca (se abren al hacer clic en sus iconos).',
        campos: [
          { clave: 'contacto_instagram', label: 'Instagram', tipo: 'text', placeholder: 'https://www.instagram.com/orlamps' },
          { clave: 'contacto_facebook', label: 'Facebook', tipo: 'text', placeholder: 'https://www.facebook.com/orlamps' },
          { clave: 'contacto_tiktok', label: 'TikTok', tipo: 'text', placeholder: 'https://www.tiktok.com/@orlamps' },
          { clave: 'contacto_pinterest', label: 'Pinterest', tipo: 'text', placeholder: 'https://pin.it/17eZyiVrs' },
        ],
      },
    ],
  },
  {
    id: 'tienda',
    titulo: 'Tienda & Pagos',
    icono: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    grupos: [{
        subtitulo: 'Impuestos (IVA)',
        descripcion: 'Configuración tributaria para el cálculo de los precios.',
        campos: [
          { clave: 'iva_porcentaje', label: 'Porcentaje de IVA (%)', tipo: 'number', placeholder: '15' },
          {
            clave: 'precios_incluyen_iva',
            label: 'Modalidad de precios',
            tipo: 'select',
            opciones: [
              { valor: 'si', texto: 'Los precios YA incluyen IVA (el cliente paga el precio publicado)' },
              { valor: 'no', texto: 'Los precios NO incluyen IVA (el IVA se calcula y suma al total)' },
              { valor: 'sin_iva', texto: 'Sin IVA (No aplica IVA en la tienda)' },
            ],
          },
        ],
      },
      {
        subtitulo: 'Pasarela PayPhone (Tarjeta de Crédito / Débito)',
        descripcion: 'Ajuste de comisiones y recargos opcionales.',
        campos: [
          {
            clave: 'payphone_recargo_porcentaje',
            label: 'Recargo al pagar con tarjeta (%)',
            tipo: 'number',
            placeholder: '6.1',
            ayuda: 'Porcentaje adicional que asume el cliente si elige tarjeta. Si no deseas cobrar recargo, pon 0.',
          },
        ],
      },
      {
        subtitulo: 'Instrucciones para Transferencia y Efectivo',
        descripcion: 'Mensajes que ve el cliente al finalizar un pedido.',
        campos: [
          {
            clave: 'transferencia_datos',
            label: 'Datos bancarios para transferencia',
            tipo: 'textarea',
            placeholder: 'Banco: ...\nTipo de cuenta: ...\nN° de cuenta: ...\nTitular: ...\nCédula/RUC: ...',
            ayuda: 'Se muestran en la pantalla de confirmación para que el cliente transfiera el valor.',
          },
          {
            clave: 'efectivo_instrucciones',
            label: 'Instrucciones de pago en efectivo',
            tipo: 'textarea',
            placeholder: 'Pagas en efectivo al recibir o retirar tu pedido.',
          },
        ],
      },
    ],
  },
];

export default function AdminContenidoClient({ contenido }: { contenido: ContenidoMap }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ContenidoMap>({
    hero_titulo: 'Iluminación & Diseño', hero_subtitulo: 'Descubre nuestra colección de lámparas únicas', home_colecciones_titulo: 'Nuestras Colecciones',
    home_colecciones_subtitulo: 'Encuentra la iluminación perfecta para cada espacio',
    home_destacados_titulo: 'Productos Destacados',
    home_destacados_subtitulo: 'Piezas seleccionadas de nuestra colección',
    home_cta_titulo: '¿Buscas algo especial?',
    home_cta_subtitulo: 'Contáctanos y te ayudamos a encontrar la iluminación perfecta para tu espacio.',
    footer_texto: 'Iluminación & Diseño',
    footer_ciudad: 'Quito, Ecuador',
    quienes_somos_titulo: 'NUESTRA HISTORIA',
    quienes_somos_texto: 'OrLamps es una iniciativa de BH Mobiliarios (www.bhmobiliarios.site), concebida a partir de una convicción: la iluminación define la atmósfera de un espacio y la manera en que se vive. Elaboramos piezas de iluminación trabajadas a mano, donde el diseño y el oficio artesanal se encuentran. Cada lámpara pasa por un proceso de fabricación en donde se cuidan la forma, el material y el acabado.',
    quienes_somos_mision: 'Diseñar y elaborar iluminación exclusiva que eleve la experiencia de los espacios, con calidad garantizada, acabados excepcionales y un servicio personalizado en cada etapa.',
    quienes_somos_vision: 'Consolidarnos como referente en iluminación de diseño, reconocidos por unir la excelencia artesanal con una estética contemporánea.',
    quienes_somos_valores: 'Oficio, Excelencia, Exclusividad, Servicio, Integridad',
    contacto_titulo: 'ESTAMOS PARA AYUDARTE',
    contacto_subtitulo: 'Escríbenos con tu consulta y te responderemos a la brevedad.',
    contacto_email: 'info@orlamps.site',
    contacto_telefono: '098 757 5412',
    contacto_whatsapp: '098 757 5412',
    contacto_direccion: 'Quito, Ecuador',
    contacto_facebook: 'https://www.facebook.com/orlamps',
    contacto_instagram: 'https://www.instagram.com/orlamps',
    contacto_tiktok: 'https://www.tiktok.com/@orlamps',
    contacto_pinterest: 'https://pin.it/17eZyiVrs',
    iva_porcentaje: '15',
    precios_incluyen_iva: 'si',
    payphone_recargo_porcentaje: '6.1',
    ...contenido,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function handleChange(clave: string, valor: string) {
    setValues(prev => ({ ...prev, [clave]: valor }));
    setSaved(false);
  }

  function handleSave() {
    setError('');
    startTransition(async () => {
      const res = await actualizarMultipleContenido(values);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s',
  };

  const seccionActual = SECCIONES.find(s => s.id === activeTab) || SECCIONES[0];

  return (
    <div>
      {/* Header del módulo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Editar Contenido del Sitio
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Personaliza los textos informativos de cada página de tu tienda. Los cambios se reflejan de inmediato.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#9B6F2F',
            color: '#fff',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.92rem',
            opacity: isPending ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(155,111,47,0.25)',
            transition: 'all 0.2s',
          }}
        >
          {isPending ? (
            'Guardando...'
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', color: '#15803d', fontSize: '0.875rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          Los cambios se guardaron y publicaron exitosamente en la tienda.
        </div>
      )}

      {/* Pestañas (Tabs) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        backgroundColor: '#fff',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '28px',
        overflowX: 'auto',
      }}>
        {SECCIONES.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSaved(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : '#141414',
                backgroundColor: isActive ? '#9B6F2F' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icono}
              {tab.titulo}
            </button>
          );
        })}
      </div>

      {/* Contenedor de la pestaña activa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {seccionActual.grupos.map((grupo, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
              <h2 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9B6F2F', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                {grupo.subtitulo}
              </h2>
              {grupo.descripcion && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                  {grupo.descripcion}
                </p>
              )}
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {grupo.campos.map(campo => (
                <div key={campo.clave}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141414', display: 'block', marginBottom: '6px' }}>
                    {campo.label}
                  </label>

                  {campo.tipo === 'textarea' ? (
                    <textarea
                      value={values[campo.clave] || ''}
                      onChange={e => handleChange(campo.clave, e.target.value)}
                      placeholder={campo.placeholder}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '84px', lineHeight: 1.6 }}
                    />
                  ) : campo.tipo === 'select' ? (
                    <select
                      value={values[campo.clave] || ''}
                      onChange={e => handleChange(campo.clave, e.target.value)}
                      style={inputStyle}
                    >
                      {campo.opciones?.map(op => (
                        <option key={op.valor} value={op.valor}>{op.texto}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={campo.tipo === 'number' ? 'number' : 'text'}
                      {...(campo.tipo === 'number' ? { min: 0, max: 100, step: '0.01' } : {})}
                      value={values[campo.clave] || ''}
                      onChange={e => handleChange(campo.clave, e.target.value)}
                      placeholder={campo.placeholder}
                      disabled={campo.clave === 'iva_porcentaje' && values['precios_incluyen_iva'] === 'sin_iva'}
                      style={{
                        ...inputStyle,
                        opacity: (campo.clave === 'iva_porcentaje' && values['precios_incluyen_iva'] === 'sin_iva') ? 0.5 : 1,
                        cursor: (campo.clave === 'iva_porcentaje' && values['precios_incluyen_iva'] === 'sin_iva') ? 'not-allowed' : 'text',
                        backgroundColor: (campo.clave === 'iva_porcentaje' && values['precios_incluyen_iva'] === 'sin_iva') ? '#f3f4f6' : '#fff'
                      }}
                    />
                  )}

                  {campo.ayuda && (
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '6px 0 0' }}>{campo.ayuda}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
