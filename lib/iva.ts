// Cálculo de IVA compartido (navegador + servidor). Trabaja en CENTAVOS enteros
// para evitar errores de redondeo con decimales.

export type IvaConfig = {
  /** Porcentaje de IVA, 0–100 (ej: 15) */
  porcentaje: number;
  /** true = los precios de los productos YA incluyen IVA; false = el IVA se suma al precio */
  incluido: boolean;
};

export type DesgloseIva = {
  /** Base imponible en centavos (sin IVA) */
  base: number;
  /** IVA en centavos */
  iva: number;
  /** Total a cobrar en centavos */
  total: number;
};

export const IVA_POR_DEFECTO: IvaConfig = { porcentaje: 15, incluido: true };

/** Lee la configuración desde el mapa de `contenido_sitio` (editable en /admin/contenido). */
export function leerIvaConfig(contenido: Record<string, string | undefined>): IvaConfig {
  const inc = (contenido.precios_incluyen_iva ?? '').toString().trim().toLowerCase();
  
  if (inc === 'sin_iva') {
    return { porcentaje: 0, incluido: true };
  }

  const raw = (contenido.iva_porcentaje ?? '').toString().replace(',', '.').trim();
  const n = raw === '' ? NaN : Number(raw);
  const porcentaje = Number.isFinite(n) && n >= 0 && n <= 100 ? n : IVA_POR_DEFECTO.porcentaje;

  const incluido = inc === '' ? IVA_POR_DEFECTO.incluido : inc === 'si';

  return { porcentaje, incluido };
}

/** Calcula base / IVA / total a partir del subtotal (en dólares) de los productos. */
export function calcularDesglose(subtotalDolares: number, cfg: IvaConfig): DesgloseIva {
  const subtotalCent = Math.round(subtotalDolares * 100);
  const tasa = cfg.porcentaje / 100;

  if (tasa === 0) {
    return { base: subtotalCent, iva: 0, total: subtotalCent };
  }

  if (cfg.incluido) {
    // El precio ya trae IVA: total = subtotal, se separa la base
    const base = Math.round(subtotalCent / (1 + tasa));
    return { base, iva: subtotalCent - base, total: subtotalCent };
  }

  // El IVA se suma al precio
  const iva = Math.round(subtotalCent * tasa);
  return { base: subtotalCent, iva, total: subtotalCent + iva };
}

/** Recargo por defecto: el cliente asume la comisión de PayPhone (5% + IVA del 5% ≈ 5,75% del total cobrado). */
export const RECARGO_TARJETA_POR_DEFECTO = 6.1;

/** Recargo (%) que se suma al pagar con tarjeta para cubrir la comisión de PayPhone. 0 = sin recargo. */
export function leerRecargoTarjeta(contenido: Record<string, string | undefined>): number {
  const raw = (contenido.payphone_recargo_porcentaje ?? '').toString().replace(',', '.').trim();
  if (raw === '') return RECARGO_TARJETA_POR_DEFECTO;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 30 ? n : RECARGO_TARJETA_POR_DEFECTO;
}

/** Recargo en centavos sobre el total (ya con IVA). */
export function calcularRecargo(totalCentavos: number, porcentaje: number): number {
  if (!porcentaje || porcentaje <= 0) return 0;
  return Math.round(totalCentavos * (porcentaje / 100));
}
