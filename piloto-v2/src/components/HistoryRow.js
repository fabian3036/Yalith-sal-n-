// src/components/HistoryRow.js
import { html } from "../vendor.js";
import { fmt } from "../lib/date.js";
import { money } from "../lib/money.js";
import { Pill } from "./basic.js";

const STATUS_LABELS = { confirmada: "Confirmada", cancelada: "Canceló", no_llego: "No llegó" };

export function HistoryRow({ colors, a, onClick }) {
  const isRetouch = a.service === "Retoque de pestañas";
  const notConfirmed = a.status !== "confirmada";
  const borderColor = a.status === "cancelada" ? colors.danger : a.status === "no_llego" ? colors.warning : colors.accent;
  const statusColor = a.status === "cancelada" ? colors.danger : a.status === "no_llego" ? colors.warning : colors.success;

  return html`
    <div
      onClick=${onClick}
      class="tap"
      style=${{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: "pointer",
        opacity: notConfirmed ? 0.7 : 1,
      }}
    >
      <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style=${{ fontSize: 13, color: colors.text }}>${fmt(a.date)} · ${a.time}</div>
        <div style=${{ fontSize: 12, color: colors.muted }}>${a.service}</div>
      </div>
      <div style=${{ display: "flex", flexWrap: "wrap", marginBottom: a.price || a.deposit ? 6 : 0 }}>
        <${Pill} colors=${colors} label=${STATUS_LABELS[a.status] || a.status} active color=${statusColor} />
        <${Pill} colors=${colors} label=${a.isNew ? "Clienta nueva" : "Ya era clienta"} active color=${a.isNew ? colors.success : colors.muted} />
        <${Pill} colors=${colors} label="Retoque" active=${isRetouch} color=${colors.accent} />
        ${a.deposit && html`<${Pill} colors=${colors} label=${`Apartó ${money(a.deposit)}`} active color=${colors.accent} />`}
        ${a.rescheduleCount > 0 && html`<${Pill} colors=${colors} label=${`Reprogramada x${a.rescheduleCount}`} active color=${colors.warning} />`}
      </div>
      ${a.price && html`<div style=${{ fontSize: 12, color: colors.success }}>Precio: ${money(a.price)}</div>`}
    </div>
  `;
}
