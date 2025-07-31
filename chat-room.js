import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded
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

const urlParams = new URLSearchParams(window.location.search);
const me = urlParams.get("me");
const other = urlParams.get("other");

if (!me || !other) {
  alert("Eksik sohbet bilgisi.");
  window.location.href = "chat.html";
}

document.getElementById("chatInfo").textContent = `🗨️ ${me} ile ${other} arasında sohbet`;

const chatId = [me, other].sort().join("_");
const messagesRef = ref(db, `chats/${chatId}`);

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", async () => {
  const msg = input.value.trim();
  if (!msg) return;

  await push(messagesRef, {
    sender: me,
    message: msg,
    timestamp: Date.now()
  });

  input.value = "";
});

onChildAdded(messagesRef, (snapshot) => {
  const msgData = snapshot.val();
  const msgEl = document.createElement("div");
  msgEl.className = `message ${msgData.sender === me ? "you" : "them"}`;
  msgEl.textContent = msgData.message;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
});
