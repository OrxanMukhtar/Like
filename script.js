import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBDMIDu-66dy5Aono5kPU75LYw9C9ckvpQ",
  authDomain: "likeme-607cd.firebaseapp.com",
  databaseURL: "https://likeme-607cd-default-rtdb.firebaseio.com",
  projectId: "likeme-607cd",
  storageBucket: "likeme-607cd.firebasestorage.app",
  messagingSenderId: "947409928774",
  appId: "1:947409928774:web:ba39a0c00891a512e60047"
};

// Başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// HTML elemanları
const postForm = document.getElementById("postForm");
const postsSection = document.getElementById("posts");

// Kullanıcı bilgilerini al (localStorage'dan)
const userDataStr = localStorage.getItem("userData");
if (!userDataStr) {
  // Eğer kayıt yoksa kayıt sayfasına yönlendir
  window.location.href = "registration.html";
}
const userData = JSON.parse(userDataStr);

// Post gönderme
postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const content = document.getElementById("content").value.trim();

  if (!content) {
    alert("Lütfen bir içerik giriniz.");
    return;
  }

  // Firebase'e yeni post ekle
  const postRef = push(ref(db, "posts"));
  set(postRef, {
    author: userData.nickname,
    email: userData.email,
    color: userData.color,
    avatar: userData.avatar,
    content,
    timestamp: Date.now(),
    comments: {}
  });

  postForm.reset();
});

// Post oluşturma fonksiyonu
function createPostElement(postId, postData) {
  const postEl = document.createElement("div");
  postEl.classList.add("post");

  // Avatar + isim + sil butonu header
  const header = document.createElement("div");
  header.className = "post-header";

  // Avatar kutusu
  const avatarBox = document.createElement("div");
  avatarBox.className = "avatar";
  avatarBox.textContent = postData.avatar || postData.author.charAt(0).toUpperCase();
  avatarBox.style.backgroundColor = postData.color || "#007BFF";

  // Yazar ismi
  const authorName = document.createElement("strong");
  authorName.textContent = postData.author;

  header.appendChild(avatarBox);
  header.appendChild(authorName);

  // Sil butonu sadece kendi postuysa
  if (postData.email === userData.email) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.id = postId;

    deleteBtn.addEventListener("click", () => {
      if (confirm("Silmek istediğine emin misin?")) {
        remove(ref(db, `posts/${postId}`));
      }
    });

    header.appendChild(deleteBtn);
  }

  postEl.appendChild(header);

  // İçerik
  const contentP = document.createElement("p");
  contentP.textContent = postData.content;
  postEl.appendChild(contentP);

  // Yorumlar listesi
  const commentList = document.createElement("div");
  commentList.className = "comment-list";

  if (postData.comments) {
    Object.entries(postData.comments).forEach(([cid, comment]) => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment";
      commentEl.style.backgroundColor = comment.color || "#007BFF";


      // Yorum avatar + yazar + metin
      const cAvatar = document.createElement("div");
      cAvatar.className = "avatar small-avatar";
      cAvatar.textContent = comment.avatar || comment.author.charAt(0).toUpperCase();
      cAvatar.style.backgroundColor = comment.color || "#fff";

      const cAuthor = document.createElement("strong");
      cAuthor.textContent = comment.author;

      const cText = document.createElement("span");
      cText.textContent = ": " + comment.text;

      commentEl.appendChild(cAvatar);
      commentEl.appendChild(cAuthor);
      commentEl.appendChild(cText);

      commentList.appendChild(commentEl);
    });
  }
  postEl.appendChild(commentList);

  // Yorum formu
  const commentForm = document.createElement("form");
  commentForm.className = "comment-form";

  // Yorum formunda kullanıcıdan tekrar bilgi istemiyoruz
  commentForm.innerHTML = `
    <input type="text" placeholder="Fikir bildir..." required />
    <button type="submit">Yolla</button>
  `;

  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const commentText = commentForm.querySelector("input").value.trim();
    if (!commentText) return;

    const commentRef = ref(db, `posts/${postId}/comments`);
    const newComment = push(commentRef);

    set(newComment, {
      author: userData.nickname,
      email: userData.email,
      color: userData.color,
      avatar: userData.avatar,
      text: commentText
    });

    commentForm.reset();
  });

  postEl.appendChild(commentForm);

  return postEl;
}

// Postları dinle ve güncelle
onValue(ref(db, "posts"), (snapshot) => {
  postsSection.innerHTML = "";
  const posts = snapshot.val() || {};
  const sortedPosts = Object.entries(posts).sort(
    (a, b) => b[1].timestamp - a[1].timestamp
  );

  sortedPosts.forEach(([id, post]) => {
    const postEl = createPostElement(id, post);
    postsSection.appendChild(postEl);
  });
});

// Kayıt kontrolleri ve görünüm yönetimi (registration-container ve main-app elementlerini js tarafında yönetiyorsan burayı kontrol et)
