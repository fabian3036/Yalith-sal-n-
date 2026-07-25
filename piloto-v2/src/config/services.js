// src/config/services.js
// NOTA: esto es específico de Yalith Salón por ahora. En la Etapa 4
// (multi-negocio) esto se lee de Firestore (`/negocios/{id}`) en vez
// de estar aquí. Lo dejamos aislado en su propio archivo para que ese
// cambio futuro sea de una sola línea de import, no una reescritura.

export const PROMOS = [
  { name: "Mirada Completa (pestañas + cejas)", price: 599 },
  { name: "4x1 Cejas y Pestañas", price: 550 },
  { name: "Laminado de Cejas Gratis (con extensiones)", price: 399 },
  { name: "Retoque de pestañas", price: null },
];

export const SERVICES = PROMOS.map((p) => p.name);

export function priceForService(name) {
  const p = PROMOS.find((x) => x.name === name);
  return p && p.price != null ? String(p.price) : "";
}

// Servicios que generan recordatorio de retoque a 15 días
export const RETOUCH_SERVICES = PROMOS.map((p) => p.name);
export const RETOUCH_DAYS = 15;

// Horario de atención (10am–7:30pm), cada cita dura ~2 a 2.5 horas
export const WORK_START_MIN = 10 * 60;
export const WORK_END_MIN = 19 * 60 + 30;
export const APPT_DURATION_MIN = 150;
