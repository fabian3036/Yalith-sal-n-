// src/components/basic.js
// Componentes de UI pequeños y genéricos. Reciben `colors` explícito
// (el tema actual) en vez de leer una variable global mutable.
import { html } from "../vendor.js";

export function Label({ colors, children }) {
  return html`<div style=${{ fontSize: 10, letterSpacing: 2, color: colors.muted, textTransform: "uppercase", marginBottom: 5 }}>${children}</div>`;
}

export function Val({ colors, children }) {
  return html`<div style=${{ fontSize: 15, color: colors.text }}>${children}</div>`;
}

export function Field({ colors, label, children, style }) {
  return html`
    <div style=${{ marginBottom: 14, ...style }}>
      <${Label} colors=${colors}>${label}<//>
      ${children}
    </div>
  `;
}

export function ModalHeader({ colors, title, onClose }) {
  return html`
    <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div style=${{ fontSize: 18, color: colors.text }}>${title}</div>
      <button onClick=${onClose} style=${{ background: "none", border: "none", color: colors.muted, fontSize: 26, cursor: "pointer", lineHeight: 1 }}>×</button>
    </div>
  `;
}

export function Pill({ colors, label, active, color }) {
  return html`
    <span
      style=${{
        display: "inline-block",
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 20,
        marginRight: 6,
        marginBottom: 4,
        background: active ? `${color}22` : "rgba(255,255,255,0.04)",
        color: active ? color : colors.muted,
        border: `1px solid ${active ? color : colors.border}`,
      }}
    >
      ${label}
    </span>
  `;
}
