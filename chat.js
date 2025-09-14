import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get
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

const userDataStr = localStorage.getItem("userData");
if (!userDataStr) {
  window.location.href = "registration.html";
}
const currentUser = JSON.parse(userDataStr);

document.querySelector(".user-info").textContent = `🟢 Nickname: ${currentUser.nickname}, email: (${currentUser.email})`;

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultBox = document.getElementById("resultBox");
const goForumBtn = document.getElementById("goForumBtn");

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim().toLowerCase();
  resultBox.innerHTML = "";

  if (!query) {
    resultBox.textContent = "Please enter a nickname or email to search.";
    return;
  }

  try {
    const usersSnapshot = await get(ref(db, "users"));
    const users = usersSnapshot.val();

    if (!users) {
      resultBox.textContent = "No users found.";
      return;
    }

    const foundUser = Object.values(users).find(
      (u) =>
        (u.email && u.email.toLowerCase() === query) ||
        (u.nickname && u.nickname.toLowerCase() === query)
    );

    if (!foundUser) {
      resultBox.textContent = "Heç bir istifadəçi tapılmadı.";
      return;
    }

    if (foundUser.email === currentUser.email) {
      resultBox.textContent = "Özünüzlə çatlaşa bilməzsiniz.";
      return;
    }

    resultBox.innerHTML = `
      <p><strong>${foundUser.nickname}</strong> (${foundUser.email}) bulundu!</p>
      <button id="startChatBtn">💬 Başlat</button>
    `;

    document.getElementById("startChatBtn").addEventListener("click", () => {
      const url = new URL("chat-room.html", window.location.href);
      url.searchParams.set("me", currentUser.email);
      url.searchParams.set("other", foundUser.email);
      window.location.href = url.toString();
    });
  } catch (err) {
    console.error("Error:", err);
    resultBox.textContent = "Error occurred while searching. Please try again.";
  }
});

goForumBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
