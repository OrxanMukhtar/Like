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

// Post gönderme
postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const userNickname = localStorage.getItem("userNickname");
  const content = document.getElementById("content").value.trim();

  if (!userNickname) {
    alert("Kayıtlı kullanıcı bulunamadı!");
    return;
  }

  if (content) {
    const postRef = push(ref(db, "posts"));
    set(postRef, {
      author: userNickname,
      content,
      timestamp: Date.now(),
      comments: {}
    });
    postForm.reset();
  }
});

// Post oluşturma fonksiyonu
function createPostElement(postId, postData) {
  const postEl = document.createElement("div");
  postEl.classList.add("post");

  const header = document.createElement("div");
  header.className = "post-header";
  header.innerHTML = `<strong>${postData.author}</strong>`;
  postEl.appendChild(header);

  // Sadece sahibi ise Delete butonu ekle
  const loggedInUser = localStorage.getItem("userNickname");
  if (postData.author === loggedInUser) {
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

  const content = document.createElement("p");
  content.textContent = postData.content;
  postEl.appendChild(content);

  // Yorumları göster
  const commentList = document.createElement("div");
  if (postData.comments) {
    Object.entries(postData.comments).forEach(([cid, comment]) => {
      const c = document.createElement("div");
      c.className = "comment";
      c.textContent = `${comment.author}: ${comment.text}`;
      commentList.appendChild(c);
    });
  }
  postEl.appendChild(commentList);

  // Yorum formu
  const commentForm = document.createElement("form");
  commentForm.className = "comment-form";
  commentForm.innerHTML = `
    <input type="text" placeholder="Name" required />
    <input type="text" placeholder="Your comment" required />
    <button type="submit">Comment</button>
  `;
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = commentForm.children[0].value.trim();
    const text = commentForm.children[1].value.trim();
    if (name && text) {
      const commentRef = ref(db, `posts/${postId}/comments`);
      const newComment = push(commentRef);
      set(newComment, {
        author: name,
        text
      });
      commentForm.reset();
    }
  });
  postEl.appendChild(commentForm);

  return postEl;
}

// Postları dinle ve yükle
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

// Kayıt kontrolü
const isRegistered = localStorage.getItem("isRegistered");

if (!isRegistered) {
  // Kayıtlı değilse registration.html'i yükle
  fetch("registration.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("registration-container").innerHTML = html;
      document.getElementById("registration-container").style.display = "block";
      attachRegistrationListener();
    })
    .catch((err) => {
      console.error("Kayıt ekranı yüklenemedi:", err);
    });
} else {
  document.getElementById("main-app").style.display = "block";
}

// Kayıt formunu bağla
function attachRegistrationListener() {
  setTimeout(() => {
    const form = document.getElementById("registration-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = form.querySelector("#email").value;
        const nickname = form.querySelector("#nickname").value;

        localStorage.setItem("isRegistered", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userNickname", nickname);

        document.getElementById("registration-container").style.display = "none";
        document.getElementById("main-app").style.display = "block";
      });
    }
  }, 300);
}
