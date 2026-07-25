// src/config/firebase.js
// Inicialización única de Firebase para toda la app.
// Import compat SDK vía CDN (mismo que usábamos antes, sin cambios de costo).
import "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0QNLpDUQkvCrlZDOJXLHhhE4hDRtSjKs",
  authDomain: "yalith-salon.firebaseapp.com",
  projectId: "yalith-salon",
  storageBucket: "yalith-salon.firebasestorage.app",
  messagingSenderId: "606996435992",
  appId: "1:606996435992:web:14a04a56fbbabbe6289f6d",
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
export const db = firebase.firestore();
// eslint-disable-next-line no-undef
export const auth = firebase.auth();

// Persistencia offline: los cambios se guardan localmente sin internet
// y se sincronizan solos en cuanto vuelve la señal.
db.enablePersistence({ synchronizeTabs: true }).catch((e) =>
  console.warn("persistencia offline no disponible:", e.code)
);

// --- Colecciones (por ahora, negocio único "yalith" -- se generaliza en Etapa 4) ---
export const citasCol = db.collection("yalith_citas");
export const clientesCol = db.collection("yalith_clientes");
export const horariosCol = db.collection("yalith_horarios_ocupados");
export const solicitudesCol = db.collection("yalith_solicitudes");
export const bloqueosCol = db.collection("yalith_bloqueos");
export const agendaDocRef = db.collection("yalith").doc("agenda"); // legado, solo migración

// --- Autenticación compartida (una sola cuenta por negocio, sin login manual) ---
const SHARED_LOGIN = { email: "fabianbarboza@yahoo.com", password: "303036" };
export const ensureSignedIn = () =>
  auth.currentUser
    ? Promise.resolve(auth.currentUser)
    : auth.signInWithEmailAndPassword(SHARED_LOGIN.email, SHARED_LOGIN.password);
