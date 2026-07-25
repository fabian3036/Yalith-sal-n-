// src/lib/date.js
export const pad = (n) => String(n).padStart(2, "0");

export const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const fmt = (d) => {
  const [y, m, dd] = d.split("-");
  return `${dd} ${MONTHS[+m - 1]} ${y}`;
};

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const weekDates = (base) => {
  const d = new Date(base + "T00:00:00");
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  });
};

export const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const minutesUntil = (dateStr, timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return (d - new Date()) / 60000;
};

export const daysBetween = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1 + "T00:00:00");
  const d2 = new Date(dateStr2 + "T00:00:00");
  return Math.round((d2 - d1) / 86400000);
};

export const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function getReminderStatus(a) {
  if (a.status === "cancelada") return null;
  const mins = minutesUntil(a.date, a.time);
  if (mins < 0) return "pasada";
  if (mins <= 120) return "ahora";
  if (mins <= 180) return "pronto";
  return "pendiente";
}
