// src/services/citasService.js
// Toda la lógica de lectura/escritura de citas vive aquí, separada de
// los componentes visuales. Los componentes solo llaman estas funciones.
import { db, citasCol, horariosCol, agendaDocRef } from "../config/firebase.js";

const STORAGE_KEY = "yalith_agenda_v3";
const OLD_STORAGE_KEY = "yalith_agenda_v2";
let _id = Date.now();
export const uid = () => String(++_id);

export const normalizeAppt = (a) => ({
  ...a,
  price: a.price ?? "",
  deposit: a.deposit ?? "",
  isNew: a.isNew || false,
  retouchDismissed: a.retouchDismissed || false,
  rescheduleCount: a.rescheduleCount || 0,
});

export const loadCachedAppts = (demo) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.length > 0) return p.map(normalizeAppt);
    }
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      const p = JSON.parse(old);
      if (Array.isArray(p) && p.length > 0) return p.map(normalizeAppt);
    }
  } catch {}
  return demo;
};

export const saveCachedAppts = (appts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appts));
    return true;
  } catch {
    return false;
  }
};

const syncAvailability = async (appt) => {
  try {
    if (appt.status === "confirmada") {
      await horariosCol.doc(String(appt.id)).set({ date: appt.date, time: appt.time });
    } else {
      await horariosCol.doc(String(appt.id)).delete();
    }
  } catch (e) {
    console.error("sync availability error", e);
  }
};

export const putAppt = async (appt) => {
  try {
    await citasCol.doc(String(appt.id)).set(appt, { merge: true });
    syncAvailability(appt);
  } catch (e) {
    console.error("firestore write error", e);
  }
};

export const patchAppt = async (id, fields) => {
  try {
    await citasCol.doc(String(id)).set(fields, { merge: true });
    if ("status" in fields || "date" in fields || "time" in fields) {
      const doc = await citasCol.doc(String(id)).get();
      if (doc.exists) syncAvailability({ id, ...doc.data() });
    }
  } catch (e) {
    console.error("firestore write error", e);
  }
};

export const deleteAppt = async (id) => {
  try {
    await citasCol.doc(String(id)).delete();
    await horariosCol.doc(String(id)).delete();
  } catch (e) {
    console.error("delete error", e);
  }
};

// Migración única: si la colección nueva está vacía, sube lo que haya
// en el documento viejo (o en caché local).
export const migrateIfNeeded = async (demo) => {
  try {
    const existing = await citasCol.limit(1).get();
    if (!existing.empty) return;
    let source = [];
    const oldSnap = await agendaDocRef.get();
    if (oldSnap.exists && Array.isArray(oldSnap.data().appts) && oldSnap.data().appts.length > 0) {
      source = oldSnap.data().appts;
    } else {
      source = loadCachedAppts(demo);
    }
    const clean = source.map(normalizeAppt);
    const batch = db.batch();
    clean.forEach((a) => {
      batch.set(citasCol.doc(String(a.id)), a);
      if (a.status === "confirmada") batch.set(horariosCol.doc(String(a.id)), { date: a.date, time: a.time });
    });
    await batch.commit();
  } catch (e) {
    console.error("migration error", e);
  }
};

// Sincroniza SIEMPRE (idempotente) todas las citas confirmadas a horarios_ocupados,
// por si alguna quedó desincronizada (ej. migrada antes de que existiera esa colección).
export const syncAllHorarios = async () => {
  try {
    const citasSnap = await citasCol.where("status", "==", "confirmada").get();
    if (citasSnap.empty) return;
    const batch = db.batch();
    citasSnap.docs.forEach((d) => {
      const a = d.data();
      batch.set(horariosCol.doc(d.id), { date: a.date, time: a.time });
    });
    await batch.commit();
  } catch (e) {
    console.error("sync horarios error", e);
  }
};

export function subscribeToCitas(onData, onError) {
  return citasCol.onSnapshot((snap) => {
    const list = snap.docs.map((d) => normalizeAppt({ id: d.id, ...d.data() }));
    onData(list);
  }, onError);
}
