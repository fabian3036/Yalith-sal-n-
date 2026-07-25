// src/components/ApptCard.js
import { html } from "../vendor.js";
import { getReminderStatus } from "../lib/date.js";
import { money } from "../lib/money.js";
import { fmt } from "../lib/date.js";

export function ApptCard({ colors, a, onClick, compact }) {
  const rs = getReminderStatus(a);
  const showWA = !compact && a.phone && (rs === "ahora" || rs === "pronto");
  const notConfirmed = a.status !== "confirmada";
  const borderColor = a.status === "cancelada" ? colors.danger : a.status === "no_llego" ? colors.warning : colors.accent;

  return html`
    <div
      onClick=${onClick}
      class="tap"
      style=${{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 10,
        padding: compact ? "10px 12px" : "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        opacity: notConfirmed ? 0.5 : 1,
      }}
    >
      <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style=${{ fontSize: compact ? 14 : 16, color: colors.text, marginBottom: 3 }}>${a.client}</div>
          <div style=${{ fontSize: 12, color: colors.muted }}>${a.service}</div>
        </div>
        <div style=${{ textAlign: "right" }}>
          ${a.price && html`<div style=${{ fontSize: 12, color: colors.success, marginBottom: 2 }}>${money(a.price)}</div>`}
          <div style=${{ fontSize: 15, color: colors.accent, fontWeight: 600 }}>${a.time}</div>
          ${compact && html`<div style=${{ fontSize: 11, color: colors.muted, marginTop: 2 }}>${fmt(a.date)}</div>`}
          ${showWA && html`<div style=${{ fontSize: 10, color: "#25D366", marginTop: 4 }}>📲 listo</div>`}
        </div>
      </div>
    </div>
  `;
}
