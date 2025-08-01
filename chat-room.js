import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase config
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
const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const me = urlParams.get("me");
const other = urlParams.get("other");

const chatInfo = document.getElementById("chatInfo");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageInput = document.getElementById("imageInput");

if (!me || !other) {
  alert("Eksik sohbet bilgisi. Sohbet sayfasına yönlendiriliyorsunuz.");
  window.location.href = "chat.html";
}

function sanitizeEmail(email) {
  return email.replace(/[.#$/[\]@]/g, "_");
}

const chatId = [sanitizeEmail(me), sanitizeEmail(other)].sort().join("_");
const messagesRef = ref(db, `chats/${chatId}`);

chatInfo.textContent = `🗨️ ${me} ile ${other} arasında sohbet`;

// Mesaj gönderme fonksiyonu
sendBtn.addEventListener("click", async () => {
  const msg = input.value.trim();
  const file = imageInput.files[0];

  if (!msg && !file) return;

  const newMsg = {
    sender: me,
    timestamp: Date.now()
  };

  if (file) {
    const imageRef = storageRef(storage, `chatImages/${chatId}/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    newMsg.imageUrl = downloadURL;
  }

  if (msg) {
    newMsg.message = msg;
  }

  try {
    await push(messagesRef, newMsg);
    input.value = "";
    imageInput.value = "";
  } catch (err) {
    console.error("Mesaj gönderilemedi:", err);
    alert("Hata oluştu.");
  }
});

// Enter ile mesaj gönderme
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Mesajları dinle
onChildAdded(messagesRef, (snapshot) => {
  const msgData = snapshot.val();
  const msgEl = document.createElement("div");
  msgEl.className = `message ${msgData.sender === me ? "you" : "them"}`;

  if (msgData.imageUrl) {
    const img = document.createElement("img");
    img.src = msgData.imageUrl;
    img.alt = "gönderilen resim";
    img.className = "chat-img";
    msgEl.appendChild(img);
  }

  if (msgData.message) {
    const text = document.createElement("div");
    text.textContent = msgData.message;
    msgEl.appendChild(text);
  }

  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
});
