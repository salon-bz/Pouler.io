// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getAuth, signInAnonymously, updateProfile,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, linkWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore, collection, addDoc,
  serverTimestamp, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ---------- CONFIG FIREBASE ----------
const firebaseConfig = {
  apiKey: "AIzaSyC0nZkL5C3CH60ogOh1ekTor9E1uqN1Ibk",
  authDomain: "soportedrip.firebaseapp.com",
  projectId: "soportedrip",
  storageBucket: "soportedrip.firebasestorage.app",
  messagingSenderId: "258679857031",
  appId: "1:258679857031:web:3dba66238f434539097d22"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- ELEMENTOS ----------
const authBox = document.getElementById("auth");
const chatBox = document.getElementById("chat");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passInput = document.getElementById("passwordInput");
const registerBtn = document.getElementById("registerBtn");

const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ---------- INICIO COMO ANÓNIMO ----------
signInAnonymously(auth).catch(e => alert(e.message));

// ---------- ESTADO DEL USUARIO ----------
onAuthStateChanged(auth, user => {
  if (user && !user.isAnonymous) {
    authBox.style.display = "none";
    chatBox.style.display = "block";
    loadMessages();
  }
});

// ---------- REGISTRAR (upgrade anónimo → real) ----------
registerBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const pass = passInput.value;

  if (!name || !email || !pass) return alert("Completa todo");

  const user = auth.currentUser;

  try {
    // Convertir anónimo → cuenta real
    const cred = EmailAuthProvider.credential(email, pass);
    await linkWithCredential(user, cred);

    // Agregar nombre
    await updateProfile(auth.currentUser, { displayName: name });

    alert("Cuenta creada con éxito");
  } catch (e) {
    alert("Error: " + e.message);
  }
};

// ---------- ENVIAR MENSAJE ----------
sendBtn.onclick = async () => {
  const text = msgInput.value.trim();
  const user = auth.currentUser;

  if (!text) return;

  await addDoc(collection(db, "messages"), {
    uid: user.uid,
    name: user.displayName || "Usuario",
    text: text,
    createdAt: serverTimestamp()
  });

  msgInput.value = "";
};

// ---------- RECIBIR MENSAJES ----------
function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt"));

  onSnapshot(q, snap => {
    messagesEl.innerHTML = "";
    snap.forEach(doc => {
      const m = doc.data();
      const div = document.createElement("div");
      div.className = "msg" + (m.uid === auth.currentUser.uid ? " mine" : "");
      div.innerHTML = `<b>${m.name}:</b> ${m.text}`;
      messagesEl.appendChild(div);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// ---------- CERRAR SESIÓN ----------
logoutBtn.onclick = () => signOut(auth);