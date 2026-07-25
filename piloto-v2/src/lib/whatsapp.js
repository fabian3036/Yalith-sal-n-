// src/lib/whatsapp.js
import { fmt } from "./date.js";
import { money } from "./money.js";

export const cleanPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("52") && digits.length >= 12) return digits;
  return "52" + digits.replace(/^0+/, "");
};

export const buildWAMsg = (a, businessName) => {
  const msg = `¡Hola ${a.client}! 👋\n\nTe recordamos que tienes tu cita en *${businessName}* hoy a las *${a.time}* para *${a.service}*.\n\nTe esperamos 💛\n\n_Por favor confirma tu asistencia respondiendo este mensaje._`;
  return `https://wa.me/${cleanPhone(a.phone)}?text=${encodeURIComponent(msg)}`;
};

export const buildRetouchWAMsg = (a, businessName, retouchDays) => {
  const msg = `¡Hola ${a.client}! 👋\n\nYa han pasado *${retouchDays} días* desde tu último servicio de *${a.service}* en *${businessName}*.\n\n¡Es momento de tu retoque! ¿Te gustaría agendar? 💛`;
  return `https://wa.me/${cleanPhone(a.phone)}?text=${encodeURIComponent(msg)}`;
};

export const buildReactivationWAMsg = (a, businessName) => {
  const msg = `¡Hola ${a.client}! 👋\n\nTe extrañamos en *${businessName}* 💛 Ya ha pasado un tiempo desde tu última visita. ¿Te gustaría agendar tu próxima cita?`;
  return `https://wa.me/${cleanPhone(a.phone)}?text=${encodeURIComponent(msg)}`;
};

export const buildDaySummaryMsg = (dateStr, dayList, businessName) => {
  const activeAppts = dayList.filter((a) => a.status !== "cancelada").sort((a, b) => a.time.localeCompare(b.time));
  if (activeAppts.length === 0) return `📅 *${businessName}* — ${fmt(dateStr)}\n\nSin citas agendadas este día.`;
  const total = activeAppts.filter((a) => a.status === "confirmada").reduce((s, a) => s + (parseFloat(a.price) || 0), 0);
  const lines = activeAppts.map((a) => {
    const tag = a.status === "no_llego" ? " (no llegó)" : "";
    return `• ${a.time} — ${a.client} · ${a.service}${a.price ? ` · ${money(a.price)}` : ""}${tag}`;
  });
  return `📅 *Resumen del día — ${businessName}*\n${fmt(dateStr)}\n\n${lines.join("\n")}\n\nTotal esperado: *${money(total)}*`;
};

export const buildDaySummaryShareUrl = (dateStr, dayList, businessName) =>
  `https://api.whatsapp.com/send?text=${encodeURIComponent(buildDaySummaryMsg(dateStr, dayList, businessName))}`;

export const buildWeekSummaryMsg = (weekDates, appts, businessName) => {
  const weekAppts = appts.filter((a) => weekDates.includes(a.date));
  const confirmed = weekAppts.filter((a) => a.status === "confirmada");
  const cancelled = weekAppts.filter((a) => a.status === "cancelada");
  const noShow = weekAppts.filter((a) => a.status === "no_llego");
  const total = confirmed.reduce((s, a) => s + (parseFloat(a.price) || 0), 0);
  const deposits = confirmed.reduce((s, a) => s + (parseFloat(a.deposit) || 0), 0);
  if (weekAppts.length === 0)
    return `📊 *Resumen semanal — ${businessName}*\n${fmt(weekDates[0])} — ${fmt(weekDates[6])}\n\nSin citas registradas esta semana.`;
  return `📊 *Resumen semanal — ${businessName}*\n${fmt(weekDates[0])} — ${fmt(weekDates[6])}\n\n✅ Citas confirmadas: ${confirmed.length}\n❌ Canceladas: ${cancelled.length}\n👻 No llegó: ${noShow.length}\n\n💰 Ingresos: *${money(total)}*\n💵 Anticipos apartados: ${money(deposits)}`;
};

export const buildWeekSummaryShareUrl = (weekDates, appts, businessName) =>
  `https://api.whatsapp.com/send?text=${encodeURIComponent(buildWeekSummaryMsg(weekDates, appts, businessName))}`;
