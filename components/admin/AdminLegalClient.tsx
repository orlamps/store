'use client';

import { useState, useTransition } from 'react';
import { actualizarMultipleContenido } from '@/app/actions/contenido';
import { useRouter } from 'next/navigation';

const G = '#9B6F2F';
const svgP = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: G, strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const SECCIONES_LEGALES = [
  {
    id: 'aviso-legal',
    titulo: 'Aviso Legal y Términos y Condiciones',
    icon: <svg {...svgP}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    ruta: '/aviso-legal',
    campos: [
      { clave: 'legal_aviso_intro', label: 'Introducción (Aviso Legal)', placeholder: 'Texto introductorio del aviso legal...', rows: 4 },
      { clave: 'legal_aviso_finalidad', label: 'Finalidad del sitio', placeholder: 'Descripción de la finalidad...', rows: 3 },
      { clave: 'legal_aviso_imagenes', label: 'Aclaración sobre imágenes y contenido', placeholder: 'Texto sobre variaciones de imágenes...', rows: 3 },
      { clave: 'legal_aviso_responsabilidad', label: 'Limitación de responsabilidad', placeholder: 'Descripción de responsabilidades...', rows: 3 },
      { clave: 'legal_terminos_produccion', label: 'Producción y no reembolsos (T&C)', placeholder: 'Política de no reembolsos en productos personalizados...', rows: 5 },
      { clave: 'legal_terminos_garantia', label: 'Garantía de productos (T&C)', placeholder: 'Descripción de la garantía...', rows: 4 },
    ],
  },
  {
    id: 'privacidad',
    titulo: 'Política de Privacidad',
    icon: <svg {...svgP}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    ruta: '/privacidad',
    campos: [
      { clave: 'legal_privacidad_intro', label: 'Introducción', placeholder: 'Texto introductorio de la política de privacidad...', rows: 4 },
      { clave: 'legal_privacidad_datos', label: '¿Qué información recopilamos?', placeholder: 'Descripción de los datos que se recopilan...', rows: 4 },
      { clave: 'legal_privacidad_uso', label: 'Uso de la información', placeholder: 'Para qué se usa la información...', rows: 3 },
      { clave: 'legal_privacidad_entregas', label: 'Entregas y envíos', placeholder: 'Política de datos en entregas...', rows: 3 },
      { clave: 'legal_privacidad_confidencialidad', label: 'Confidencialidad y protección', placeholder: 'Medidas de protección de datos...', rows: 3 },
    ],
  },
  {
    id: 'cookies',
    titulo: 'Política de Cookies',
    icon: <svg {...svgP}><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="9.5" r="1.5" fill={G} stroke="none"/><circle cx="14" cy="8" r="1" fill={G} stroke="none"/><circle cx="15" cy="14" r="1.5" fill={G} stroke="none"/><circle cx="9" cy="15.5" r="1" fill={G} stroke="none"/></svg>,
    ruta: '/cookies',
    campos: [
      { clave: 'legal_cookies_intro', label: 'Introducción', placeholder: 'Texto introductorio de la política de cookies...', rows: 3 },
      { clave: 'legal_cookies_que_son', label: '¿Qué son las cookies?', placeholder: 'Explicación sobre qué son las cookies...', rows: 3 },
      { clave: 'legal_cookies_tipos', label: 'Tipos de cookies utilizadas', placeholder: 'Descripción de los tipos de cookies...', rows: 4 },
      { clave: 'legal_cookies_gestion', label: 'Gestión y desactivación', placeholder: 'Cómo desactivar las cookies...', rows: 3 },
    ],
  },
];

export default function AdminLegalClient({ contenido }: { contenido: Record<string, string> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Valores predeterminados (fallbacks) para que el admin no se vea vacío
  const defaults = {
    legal_aviso_intro: 'El presente Aviso Legal regula el acceso y uso del sitio web www.orlamps.site, así como de los canales digitales oficiales y redes sociales de OrLamps, actuales o futuros. El acceso a cualquiera de estos medios implica la aceptación plena y sin reservas de las disposiciones aquí contenidas. OrLamps se reserva el derecho de modificar, actualizar o eliminar, en cualquier momento y sin previo aviso, el contenido, diseño o condiciones de uso de sus plataformas digitales.',
    legal_aviso_finalidad: 'El sitio web y redes sociales de OrLamps tienen carácter informativo, comercial y de contacto, con el objetivo de mostrar productos propios, trabajos realizados y permitir la solicitud de cotizaciones personalizadas. La información publicada no constituye una oferta contractual automática, ni obliga a OrLamps a aceptar pedidos, precios o plazos que no hayan sido confirmados expresamente.',
    legal_aviso_imagenes: 'Las imágenes publicadas en el sitio web y redes sociales corresponden a productos propios y trabajos reales realizados por OrLamps. Pueden existir variaciones mínimas propias del trabajo artesanal, los colores pueden presentar ligeras diferencias según la pantalla del usuario, y los acabados pueden variar levemente según el material disponible. Dichas variaciones no constituyen defectos ni incumplimiento.',
    legal_aviso_responsabilidad: 'OrLamps no se hace responsable por interpretaciones subjetivas del usuario sobre diseños, estilos o acabados; decisiones tomadas por el usuario sin una cotización confirmada; fallas técnicas de la web o redes sociales; ni contenidos o enlaces de terceros. El usuario utiliza el sitio y canales digitales bajo su propia responsabilidad.',
    legal_terminos_produccion: 'Una vez que el cliente aprueba el diseño y/o especificaciones y realiza el abono para el inicio de la producción, se entiende que acepta continuar y concluir el proceso de fabricación hasta la entrega final del producto. No se realizan reembolsos en productos personalizados una vez iniciada la producción, incluso si el cliente cambia de opinión, desea modificar el pedido o decide no continuar. Esta condición es irrevocable debido a la naturaleza personalizada del producto.',
    legal_terminos_garantia: 'OrLamps garantiza sus productos exclusivamente contra defectos de fabricación, entendidos como fallas estructurales o de ensamblaje atribuibles directamente al proceso de producción. Esta garantía aplica únicamente al producto entregado, no cubre daños por uso indebido, golpes, humedad, exposición al sol, manipulación incorrecta, desgaste natural o falta de mantenimiento, ni cubre variaciones propias de los materiales naturales o modificaciones realizadas por terceros. La garantía se limita, a criterio de OrLamps, a la reparación o corrección del defecto, sin que ello genere derecho a reembolsos, devoluciones o compensaciones adicionales.',
    legal_privacidad_intro: 'En OrLamps, respetamos la privacidad de nuestros usuarios y clientes. Esta política regula el tratamiento de la información personal obtenida a través de www.orlamps.site y de todos nuestros canales digitales oficiales.',
    legal_privacidad_datos: 'OrLamps no recopila información personal mediante formularios web de forma automática.\n\nLa información personal se obtiene únicamente cuando el usuario decide contactarnos de forma voluntaria, principalmente a través de enlaces directos a WhatsApp u otros canales digitales.\n\nLa información puede incluir:\n- Nombre\n- Número de teléfono\n- Dirección de entrega\n- Información necesaria para cotizaciones, pedidos o productos personalizados (materiales, tonos, colores, acabados u otras especificaciones)',
    legal_privacidad_uso: 'La información proporcionada por el usuario se utiliza exclusivamente para:\n- Atender consultas\n- Elaborar cotizaciones personalizadas\n- Gestionar pedidos y procesos de producción\n- Coordinar entregas y envíos\n- Mantener comunicación relacionada con los productos o servicios solicitados\n\nOrLamps no utiliza la información para fines distintos a los aquí descritos.',
    legal_privacidad_entregas: 'La información relacionada con direcciones, referencias, horarios y datos de contacto será utilizada únicamente para coordinar la entrega o envío de los productos.\n\nOrLamps no se responsabiliza por:\n- Retrasos ocasionados por información incorrecta o incompleta proporcionada por el cliente\n- Ausencia del cliente en el lugar y horario acordado\n- Cambios de dirección no comunicados oportunamente\n\nLos costos, tiempos y condiciones de entrega o envío serán informados y acordados previamente con el cliente.',
    legal_privacidad_confidencialidad: 'OrLamps adopta medidas razonables para proteger la información personal recibida. No obstante, el usuario reconoce que las plataformas de mensajería y redes sociales cuentan con políticas de privacidad propias, ajenas al control de OrLamps.\n\nOrLamps no vende ni comparte datos personales con terceros, salvo cuando sea requerido por ley o autoridad competente, o sea estrictamente necesario para cumplir con la entrega o servicio solicitado.',
    legal_cookies_intro: 'En OrLamps utilizamos cookies y tecnologías similares para garantizar el correcto funcionamiento del sitio web, mejorar la experiencia del usuario y obtener información estadística sobre la navegación.',
    legal_cookies_que_son: 'Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario al visitar un sitio web. Estas permiten reconocer el navegador, recordar preferencias y recopilar información sobre el uso del sitio.',
    legal_cookies_tipos: 'Cookies técnicas o necesarias\nPermiten el funcionamiento básico del sitio web y no requieren consentimiento previo, ya que son esenciales para su uso correcto.\n\nCookies de análisis\nPermiten recopilar información anónima sobre el comportamiento de los usuarios en el sitio (páginas visitadas, tiempo de navegación), con el fin de mejorar contenidos y servicios.\n\nCookies de terceros\nEste sitio puede utilizar cookies de servicios externos, como herramientas de medición o plataformas integradas, que se rigen por sus propias políticas de privacidad y cookies.',
    legal_cookies_gestion: 'El usuario puede configurar su navegador para aceptar, rechazar o eliminar cookies en cualquier momento. La desactivación de algunas cookies puede afectar el correcto funcionamiento del sitio web.',
  };

  const inicial = { ...defaults };
  Object.keys(defaults).forEach(key => {
    if (contenido[key]) inicial[key as keyof typeof defaults] = contenido[key];
  });

  const [valores, setValores] = useState<Record<string, string>>(inicial);
  const [activeTab, setActiveTab] = useState('aviso-legal');
  const [saved, setSaved] = useState(false);

  function handleChange(clave: string, valor: string) {
    setValores(prev => ({ ...prev, [clave]: valor }));
    setSaved(false);
  }

  function handleGuardar() {
    startTransition(async () => {
      await actualizarMultipleContenido(valores);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const seccionActiva = SECCIONES_LEGALES.find(s => s.id === activeTab)!;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#141414', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Textos Legales
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Edita los textos de las páginas legales del sitio web.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saved && (
            <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Guardado
            </span>
          )}
          <button
            onClick={handleGuardar}
            disabled={isPending}
            style={{ padding: '11px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#9B6F2F', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
        {SECCIONES_LEGALES.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              backgroundColor: activeTab === s.id ? '#fff' : 'transparent',
              color: activeTab === s.id ? '#141414' : '#6b7280',
              boxShadow: activeTab === s.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
          <span>{s.icon}</span>
            {s.titulo.split(' ')[0]} {s.titulo.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Preview link */}
      <div style={{ marginBottom: '20px' }}>
        <a
          href={seccionActiva.ruta}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.82rem', color: '#9B6F2F', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          Ver página en el sitio →
        </a>
      </div>

      {/* Campos */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fafafa' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '7px', backgroundColor: 'rgba(155,111,47,0.1)', border: '1px solid rgba(155,111,47,0.2)', flexShrink: 0 }}>{seccionActiva.icon}</span>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#141414', margin: 0 }}>{seccionActiva.titulo}</h2>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {seccionActiva.campos.map(campo => (
            <div key={campo.clave}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#141414', marginBottom: '8px' }}>
                {campo.label}
              </label>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
                clave: {campo.clave}
              </div>
              <textarea
                value={valores[campo.clave] || ''}
                onChange={e => handleChange(campo.clave, e.target.value)}
                rows={campo.rows}
                placeholder={campo.placeholder}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                  lineHeight: 1.6,
                  color: '#374151',
                  backgroundColor: valores[campo.clave] ? '#fff' : '#fafafa',
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                {(valores[campo.clave] || '').length} caracteres
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: '#FBF6EE', border: '1px solid #F0E6D0', borderRadius: '10px', fontSize: '0.84rem', color: '#9B6F2F', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <strong>Nota:</strong> Los textos editados aquí reemplazan los textos que aparecen en las páginas legales del sitio. Si dejas un campo vacío, se mostrará el texto predeterminado. Los cambios se publican inmediatamente.
        </div>
      </div>
    </div>
  );
}
