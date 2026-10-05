import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexión server-side con service_role — el browser NUNCA ve estas claves
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function inferLocation(req: NextRequest, timezone?: string, language?: string) {
  const countryHeader = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  const cityHeader = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity');

  let pais = '';
  let ciudad = '';

  if (countryHeader && countryHeader !== 'XX' && countryHeader !== 'T1') {
    const paises: Record<string, string> = {
      EC: 'Ecuador',
      CO: 'Colombia',
      PE: 'Perú',
      US: 'Estados Unidos',
      ES: 'España',
      MX: 'México',
      AR: 'Argentina',
      CL: 'Chile',
      UY: 'Uruguay',
      PA: 'Panamá',
      CR: 'Costa Rica',
      GT: 'Guatemala',
    };
    pais = paises[countryHeader.toUpperCase()] || countryHeader;
    if (cityHeader) {
      try {
        ciudad = decodeURIComponent(cityHeader);
      } catch {
        ciudad = cityHeader;
      }
    }
  }

  if (!pais) {
    if (timezone?.includes('Guayaquil') || timezone?.includes('Galapagos') || language?.includes('EC')) {
      pais = 'Ecuador';
      ciudad = timezone?.includes('Galapagos') ? 'Galápagos' : 'Quito / Guayaquil';
    } else if (timezone?.includes('Bogota')) {
      pais = 'Colombia';
      ciudad = 'Bogotá';
    } else if (timezone?.includes('Lima')) {
      pais = 'Perú';
      ciudad = 'Lima';
    } else if (timezone?.includes('Mexico')) {
      pais = 'México';
      ciudad = 'CDMX';
    } else if (timezone?.includes('Madrid')) {
      pais = 'España';
      ciudad = 'Madrid';
    } else if (timezone?.includes('Santiago')) {
      pais = 'Chile';
      ciudad = 'Santiago';
    } else if (timezone?.includes('Buenos_Aires')) {
      pais = 'Argentina';
      ciudad = 'Buenos Aires';
    } else if (timezone && timezone.includes('/')) {
      const parts = timezone.split('/');
      pais = parts[0]?.replace('_', ' ') || 'Local';
      ciudad = parts[1]?.replace('_', ' ') || 'Local';
    } else {
      pais = 'Ecuador';
      ciudad = 'Quito';
    }
  }

  return { pais, ciudad: ciudad || 'Local' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, user_id, pagina, referrer, user_agent, timezone, language } = body;

    if (!session_id || !pagina) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const { pais, ciudad } = inferLocation(req, timezone, language);

    const supabase = getAdmin();
    const { data, error } = await supabase
      .from('visitas')
      .insert({
        session_id,
        user_id: user_id || null,
        pagina,
        referrer: referrer || '',
        user_agent: user_agent || '',
        pais,
        ciudad,
        activo: true,
        ultimo_ping: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

    const supabase = getAdmin();
    await supabase
      .from('visitas')
      .update({ ultimo_ping: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
