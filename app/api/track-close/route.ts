import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ruta separada para el cierre de visita usando sendBeacon (text/plain body)
function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    // sendBeacon envía text/plain, hay que parsear manualmente
    const text = await req.text();
    const { id, activo, ended_at } = JSON.parse(text);

    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

    const supabase = getAdmin();
    await supabase
      .from('visitas')
      .update({
        activo: activo ?? false,
        ended_at: ended_at || new Date().toISOString(),
        ultimo_ping: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
