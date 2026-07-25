// src/views/DayView.js
import { html, useMemo } from "../vendor.js";
import { fmt } from "../lib/date.js";
import { buildDaySummaryShareUrl } from "../lib/whatsapp.js";
import { ApptCard } from "../components/ApptCard.js";

export function DayView({ colors, selDate, appts, blocks, businessName, onShiftDay, onOpenNew, onOpenAppt, onOpenBlockModal, onRemoveBlock }) {
  const dayAppts = useMemo(() => appts.filter((a) => a.date === selDate).sort((a, b) => a.time.localeCompare(b.time)), [appts, selDate]);
  const dayBlocks = useMemo(() => blocks.filter((b) => b.date === selDate).sort((a, b) => a.time.localeCompare(b.time)), [blocks, selDate]);
  const confirmedCount = dayAppts.filter((a) => a.status === "confirmada").length;

  const navBtn = { background: "none", border: `1px solid ${colors.border}`, color: colors.muted, width: 38, height: 38, borderRadius: 8, cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" };
  const btn = { display: "inline-flex", alignItems: "center", gap: 6, background: colors.accentFade, border: `1px solid ${colors.accent}`, color: colors.accent, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" };

  return html`
    <div style=${{ padding: "16px" }}>
      <div style=${{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button onClick=${() => onShiftDay(-1)} style=${navBtn} class="tap">‹</button>
        <div style=${{ textAlign: "center" }}>
          <div style=${{ fontSize: 20 }}>${fmt(selDate)}</div>
          <div style=${{ fontSize: 12, color: colors.muted, marginTop: 2 }}>${confirmedCount} citas confirmadas</div>
        </div>
        <button onClick=${() => onShiftDay(1)} style=${navBtn} class="tap">›</button>
      </div>

      <div style=${{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick=${onOpenNew} class="tap" style=${{ ...btn, flex: 1, justifyContent: "center" }}>+ Agregar cita</button>
        <a
          href=${buildDaySummaryShareUrl(selDate, dayAppts, businessName)}
          target="_blank"
          rel="noreferrer"
          style=${{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(37,211,102,0.12)", border: "1px solid #25D366", color: "#25D366", borderRadius: 10, padding: "10px 0", fontSize: 13, textDecoration: "none" }}
        >
          📤 Compartir resumen
        </a>
      </div>

      <button
        onClick=${onOpenBlockModal}
        class="tap"
        style=${{ width: "100%", background: "none", border: `1px solid ${colors.border}`, color: colors.muted, borderRadius: 10, padding: "10px 0", fontSize: 13, cursor: "pointer", marginBottom: 16 }}
      >
        🔒 Bloquear horario
      </button>

      ${dayBlocks.map(
        (b) => html`
          <div key=${b.id} style=${{ background: "rgba(122,114,105,0.08)", border: `1px solid ${colors.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style=${{ fontSize: 13, color: colors.muted }}>🔒 ${b.time} — ${b.label}</div>
            <button onClick=${() => onRemoveBlock(b.id)} class="tap" style=${{ background: "none", border: "none", color: colors.danger, fontSize: 12, cursor: "pointer" }}>Quitar</button>
          </div>
        `
      )}

      ${dayAppts.length === 0
        ? html`<div style=${{ color: colors.muted, fontSize: 14, textAlign: "center", padding: "40px 0" }}>Sin citas este día</div>`
        : dayAppts.map((a) => html`<${ApptCard} key=${a.id} colors=${colors} a=${a} onClick=${() => onOpenAppt(a)} />`)}
    </div>
  `;
}
