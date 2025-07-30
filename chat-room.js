import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDMIDu-66dy5Aono5kPU75LYw9C9ckvpQ",
  authDomain: "likeme-607cd.firebaseapp.com",
  databaseURL: "https://likeme-607cd-default-rtdb.firebaseio.com",
  projectId: "likeme-607cd",
  storageBucket: "likeme-607cd.appspot.com",
  messagingSenderId: "947409928774",
  appId: "1:947409928774:web:ba39a0c00891a512e60047"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Kullanıcı bilgilerini al
const userDataStr = localStorage.getItem("userData");
if (!userDataStr) {
  window.location.href = "registration.html";
}
const currentUser = JSON.parse(userDataStr);

// URL'den hedef kullanıcının email'ini al
const urlParams = new URLSearchParams(window.location.search);
const targetEmail = urlParams.get("to");

if (!targetEmail) {
  alert("Hedef kullanıcı belirtilmedi.");
  window.location.href = "chat.html";
}

// Eşsiz chat ID oluştur (email'leri alfabetik sırayla birleştir)
const chatId = [currentUser.email, targetEmail].sort().join("_").replace(/\./g, "_");

const chatTitle = document.getElementById("chatTitle");
chatTitle.textContent = `💬 ${targetEmail} ile sohbet`;

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

// Mesaj gönderme
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  const msgRef = push(ref(db, `chats/${chatId}/messages`));
  set(msgRef, {
    sender: currentUser.email,
    avatar: currentUser.avatar,
    color: currentUser.color,
    text,
    timestamp: Date.now()
  });

  messageInput.value = "";
});

// Mesajları dinle
onValue(ref(db, `chats/${chatId}/messages`), (snapshot) => {
  chatBox.innerHTML = "";
  const messages = snapshot.val();
  if (!messages) return;

  Object.values(messages).forEach((msg) => {
    const msgEl = document.createElement("div");
    msgEl.className = "msg " + (msg.sender === currentUser.email ? "me" : "you");
    msgEl.style.backgroundColor = msg.color || "#eee";
    msgEl.innerHTML = `<strong>${msg.avatar || "?"}</strong>: ${msg.text}`;
    chatBox.appendChild(msgEl);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "chat.html";
});
