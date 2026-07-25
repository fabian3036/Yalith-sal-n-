// src/config/theme.js
// Paletas de color. En Etapa 4 esto se moverá a la configuración
// por negocio en Firestore; por ahora vive aquí, ya separado del resto.

export const DARK_PALETTE = {
  bg: "#0d0d0d",
  card: "#161616",
  accent: "#c9a96e",
  accentFade: "rgba(201,169,110,0.12)",
  text: "#f0ece4",
  muted: "#7a7269",
  border: "rgba(201,169,110,0.18)",
  danger: "#c96e6e",
  success: "#6ec98a",
  warning: "#e0a458",
  vip: "#d4af37",
};

export const LIGHT_PALETTE = {
  bg: "#faf7f2",
  card: "#ffffff",
  accent: "#9c7a3c",
  accentFade: "rgba(156,122,60,0.10)",
  text: "#2b2620",
  muted: "#8a8074",
  border: "rgba(156,122,60,0.28)",
  danger: "#b23b3b",
  success: "#3f8f5f",
  warning: "#b3792e",
  vip: "#a8842a",
};

/**
 * Un tema es un objeto simple {theme, colors} — nada de mutar variables
 * globales como hacíamos antes. Cada componente recibe `colors` explícito
 * (por prop o contexto), así el cambio de tema es 100% predecible.
 */
export function getPalette(theme) {
  return theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
}
