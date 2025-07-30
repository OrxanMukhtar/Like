import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  push,
  set
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");

  if (localStorage.getItem("registered")) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const color = document.getElementById("color").value;
    const avatar = document.getElementById("avatar").value.trim().toUpperCase();

    if (!email || !nickname || !avatar) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};

      const isUsed = Object.values(users).some(
        (u) => u.email === email || u.nickname.toLowerCase() === nickname.toLowerCase()
      );

      if (isUsed) {
        alert("Bu e-posta veya rumuz zaten kullanılıyor. Lütfen farklı bir tane seç.");
        return;
      }

      const newUserRef = push(usersRef);
      await set(newUserRef, {
        email,
        nickname,
        color,
        avatar
      });

      const userData = { email, nickname, color, avatar };
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("registered", "true");

      window.location.href = "chat.html";
    } catch (err) {
      console.error("Kayıt sırasında hata:", err);
      alert("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  });
});
