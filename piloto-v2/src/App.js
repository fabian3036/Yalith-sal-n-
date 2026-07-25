// src/App.js
import { html, useState, useEffect } from "./vendor.js";
import { getPalette } from "./config/theme.js";
import { SERVICES, priceForService, RETOUCH_DAYS } from "./config/services.js";
import { todayStr } from "./lib/date.js";
import { ensureSignedIn, bloqueosCol, horariosCol } from "./config/firebase.js";
import {
  uid,
  loadCachedAppts,
  saveCachedAppts,
  subscribeToCitas,
  migrateIfNeeded,
  syncAllHorarios,
  putAppt,
  patchAppt,
  deleteAppt,
} from "./services/citasService.js";
import { DayView } from "./views/DayView.js";
import { ModalHeader, Field } from "./components/basic.js";

const BUSINESS_NAME = "Yalith Salón"; // Etapa 4: vendrá de /negocios/{id}

const DEMO = [
  { id: uid(), client: "María López", phone: "9981234567", service: "Extensiones volumen", date: todayStr(), time: "10:00", notes: "", status: "confirmada", price: "", deposit: "" },
];

export function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("yalith_theme") || "dark"; } catch { return "dark"; }
  });
  const colors = getPalette(theme);
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem("yalith_theme", next); } catch {}
      return next;
    });
  };
  useEffect(() => { document.body.style.background = colors.bg; }, [theme]);

  const [appts, setAppts] = useState(() => loadCachedAppts(DEMO));
  const [blocks, setBlocks] = useState([]);
  const [cloudStatus, setCloudStatus] = useState("conectando");
  const [selDate, setSelDate] = useState(todayStr());
  const [modal, setModal] = useState(null); // null | "new" | "edit" | "detail" | "block"
  const [activeA, setActiveA] = useState(null);
  const [form, setForm] = useState({ client: "", phone: "", service: SERVICES[0], date: todayStr(), time: "10:00", notes: "", price: "", deposit: "" });
  const [blockForm, setBlockForm] = useState({ time: "10:00", label: "Comida" });

  useEffect(() => {
    let unsubCitas = () => {};
    let unsubBlocks = () => {};
    let cancelled = false;
    ensureSignedIn()
      .then(() => migrateIfNeeded(DEMO))
      .then(() => syncAllHorarios())
      .then(() => {
        if (cancelled) return;
        unsubCitas = subscribeToCitas(
          (list) => { if (list.length > 0) { setAppts(list); saveCachedAppts(list); } setCloudStatus("conectado"); },
          (err) => { console.error(err); setCloudStatus("sin conexión (usando datos locales)"); }
        );
        unsubBlocks = bloqueosCol.onSnapshot((snap) => {
          setBlocks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
      })
      .catch((err) => { console.error("auth error", err); setCloudStatus("sin conexión (usando datos locales)"); });
    return () => { cancelled = true; unsubCitas(); unsubBlocks(); };
  }, []);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const shiftDay = (delta) => {
    const d = new Date(selDate + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setSelDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  };

  const openNew = () => { setForm({ client: "", phone: "", service: SERVICES[0], date: selDate, time: "10:00", notes: "", price: priceForService(SERVICES[0]), deposit: "" }); setModal("new"); };
  const openEdit = (a) => { setForm({ client: a.client, phone: a.phone, service: a.service, date: a.date, time: a.time, notes: a.notes, price: a.price || "", deposit: a.deposit || "" }); setActiveA(a); setModal("edit"); };
  const openDetail = (a) => { setActiveA(a); setModal("detail"); };

  const saveNew = () => {
    if (!form.client.trim()) return;
    const newAppt = { ...form, id: uid(), status: "confirmada", retouchDismissed: false, rescheduleCount: 0 };
    setAppts((prev) => [...prev, newAppt]);
    putAppt(newAppt);
    setModal(null);
  };
  const saveEdit = () => {
    const rescheduled = activeA.date !== form.date || activeA.time !== form.time;
    const updated = { ...activeA, ...form, rescheduleCount: (activeA.rescheduleCount || 0) + (rescheduled ? 1 : 0) };
    setAppts((prev) => prev.map((a) => (a.id === activeA.id ? updated : a)));
    putAppt(updated);
    setModal(null);
  };
  const cancelAppt = (id) => { setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelada" } : a))); patchAppt(id, { status: "cancelada" }); setModal(null); };
  const restore = (id) => { setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "confirmada" } : a))); patchAppt(id, { status: "confirmada" }); setModal(null); };
  const removeAppt = (id) => { if (!confirm("¿Eliminar esta cita permanentemente?")) return; setAppts((prev) => prev.filter((a) => a.id !== id)); deleteAppt(id); setModal(null); };

  const addBlock = () => {
    const id = uid();
    const block = { id, date: selDate, time: blockForm.time, label: blockForm.label };
    setBlocks((prev) => [...prev, block]);
    bloqueosCol.doc(id).set(block);
    horariosCol.doc("block_" + id).set({ date: block.date, time: block.time });
    setModal(null);
  };
  const removeBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    bloqueosCol.doc(id).delete();
    horariosCol.doc("block_" + id).delete();
  };

  const inputStyle = { width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 12, color: colors.text, fontSize: 15, outline: "none" };

  return html`
    <div style=${{ minHeight: "100vh", background: colors.bg, color: colors.text, maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
      <div style=${{ padding: "max(env(safe-area-inset-top),20px) 20px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style=${{ fontSize: 10, letterSpacing: 4, color: colors.accent, textTransform: "uppercase", marginBottom: 4 }}>Agenda (piloto v2)</div>
          <div style=${{ fontSize: 26, fontWeight: 400, letterSpacing: 1 }}>${BUSINESS_NAME}</div>
        </div>
        <div style=${{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <button onClick=${toggleTheme} class="tap" style=${{ background: "none", border: `1px solid ${colors.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: colors.muted, cursor: "pointer" }}>
            ${theme === "dark" ? "☀️ claro" : "🌙 oscuro"}
          </button>
          <div style=${{ fontSize: 9, color: cloudStatus === "conectado" ? colors.success : colors.muted }}>${cloudStatus === "conectado" ? "☁️ sincronizado" : cloudStatus}</div>
        </div>
      </div>

      <${DayView}
        colors=${colors}
        selDate=${selDate}
        appts=${appts}
        blocks=${blocks}
        businessName=${BUSINESS_NAME}
        onShiftDay=${shiftDay}
        onOpenNew=${openNew}
        onOpenAppt=${openDetail}
        onOpenBlockModal=${() => { setBlockForm({ time: "10:00", label: "Comida" }); setModal("block"); }}
        onRemoveBlock=${removeBlock}
      />

      ${modal &&
      html`
        <div onClick=${() => setModal(null)} style=${{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick=${(e) => e.stopPropagation()} style=${{ background: colors.card, borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}>
            ${(modal === "new" || modal === "edit") &&
            html`
              <${ModalHeader} colors=${colors} title=${modal === "new" ? "Nueva cita" : "Editar cita"} onClose=${() => setModal(null)} />
              <${Field} colors=${colors} label="Nombre de clienta"><input style=${inputStyle} value=${form.client} onInput=${(e) => setF("client", e.target.value)} /><//>
              <${Field} colors=${colors} label="Teléfono"><input style=${inputStyle} value=${form.phone} onInput=${(e) => setF("phone", e.target.value)} /><//>
              <${Field} colors=${colors} label="Servicio">
                <select style=${inputStyle} value=${form.service} onChange=${(e) => setF("service", e.target.value)}>
                  ${SERVICES.map((s) => html`<option key=${s}>${s}</option>`)}
                </select>
              <//>
              <div style=${{ display: "flex", gap: 12 }}>
                <${Field} colors=${colors} label="Fecha" style=${{ flex: 1 }}><input type="date" style=${inputStyle} value=${form.date} onInput=${(e) => setF("date", e.target.value)} /><//>
                <${Field} colors=${colors} label="Hora" style=${{ flex: 1 }}><input type="time" style=${inputStyle} value=${form.time} onInput=${(e) => setF("time", e.target.value)} /><//>
              </div>
              <${Field} colors=${colors} label="Precio"><input style=${inputStyle} value=${form.price} onInput=${(e) => setF("price", e.target.value)} /><//>
              <button onClick=${modal === "new" ? saveNew : saveEdit} class="tap" style=${{ width: "100%", padding: 14, borderRadius: 10, background: colors.accentFade, border: `1px solid ${colors.accent}`, color: colors.accent, fontSize: 15, cursor: "pointer" }}>
                ${modal === "new" ? "Guardar cita" : "Actualizar cita"}
              </button>
            `}
            ${modal === "detail" &&
            activeA &&
            html`
              <${ModalHeader} colors=${colors} title="Detalle de cita" onClose=${() => setModal(null)} />
              <${Field} colors=${colors} label="Clienta">${activeA.client}<//>
              <${Field} colors=${colors} label="Servicio">${activeA.service}<//>
              <${Field} colors=${colors} label="Fecha y hora">${activeA.date} · ${activeA.time}<//>
              <div style=${{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick=${() => openEdit(activeA)} class="tap" style=${{ flex: 1, padding: 12, borderRadius: 10, background: colors.accentFade, border: `1px solid ${colors.accent}`, color: colors.accent, cursor: "pointer" }}>Editar</button>
                ${activeA.status === "confirmada"
                  ? html`<button onClick=${() => cancelAppt(activeA.id)} class="tap" style=${{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(201,110,110,0.15)", border: `1px solid ${colors.danger}`, color: colors.danger, cursor: "pointer" }}>Cancelar</button>`
                  : html`<button onClick=${() => restore(activeA.id)} class="tap" style=${{ flex: 1, padding: 12, borderRadius: 10, background: colors.accentFade, border: `1px solid ${colors.accent}`, color: colors.accent, cursor: "pointer" }}>Restaurar</button>`}
              </div>
              <button onClick=${() => removeAppt(activeA.id)} class="tap" style=${{ width: "100%", background: "none", border: "none", color: colors.muted, fontSize: 12, padding: "14px 0 0", cursor: "pointer", textDecoration: "underline" }}>🗑 Eliminar permanentemente</button>
            `}
            ${modal === "block" &&
            html`
              <${ModalHeader} colors=${colors} title="Bloquear horario" onClose=${() => setModal(null)} />
              <${Field} colors=${colors} label="Hora"><input type="time" style=${inputStyle} value=${blockForm.time} onInput=${(e) => setBlockForm((f) => ({ ...f, time: e.target.value }))} /><//>
              <${Field} colors=${colors} label="Motivo"><input style=${inputStyle} value=${blockForm.label} onInput=${(e) => setBlockForm((f) => ({ ...f, label: e.target.value }))} /><//>
              <button onClick=${addBlock} class="tap" style=${{ width: "100%", padding: 14, borderRadius: 10, background: colors.accentFade, border: `1px solid ${colors.accent}`, color: colors.accent, cursor: "pointer" }}>Bloquear este horario</button>
            `}
          </div>
        </div>
      `}
    </div>
  `;
}
