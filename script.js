import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDMIDu-66dy5Aono5kPU75LYw9C9ckvpQ",
  authDomain: "likeme-607cd.firebaseapp.com",
  databaseURL: "https://likeme-607cd-default-rtdb.firebaseio.com",
  projectId: "likeme-607cd",
  storageBucket: "likeme-607cd.firebasestorage.app",
  messagingSenderId: "947409928774",
  appId: "1:947409928774:web:ba39a0c00891a512e60047"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const postForm = document.getElementById("postForm");
const postsSection = document.getElementById("posts");

postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const author = document.getElementById("author").value.trim();
  const content = document.getElementById("content").value.trim();
  if (author && content) {
    const postRef = push(ref(db, "posts"));
    set(postRef, {
      author,
      content,
      timestamp: Date.now(),
      comments: {}
    });
    postForm.reset();
  }
});

function createPostElement(postId, postData) {
  const postEl = document.createElement("div");
  postEl.classList.add("post");

  const header = document.createElement("div");
  header.className = "post-header";
  header.innerHTML = `
    <strong>${postData.author}</strong>
    <button data-id="${postId}" class="delete-btn">Delete</button>
  `;
  postEl.appendChild(header);

  const content = document.createElement("p");
  content.textContent = postData.content;
  postEl.appendChild(content);

  // Comments
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

  // Comment form
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

  // Delete handler
  header.querySelector(".delete-btn").addEventListener("click", () => {
    if (confirm("Silmek istedigine emin misin?")) {
      remove(ref(db, `posts/${postId}`));
    }
  });

  return postEl;
}

// Load posts
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


// Kullanıcının daha önce kayıt olup olmadığını kontrol et
const isRegistered = localStorage.getItem("isRegistered");

if (!isRegistered) {
  // Kullanıcı kayıt olmadıysa registration.html dosyasını yükle
  fetch("registration.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("registration-container").innerHTML = html;
      document.getElementById("registration-container").style.display = "block";
      attachRegistrationListener(); // registration.js fonksiyonunu bağla
    })
    .catch((err) => {
      console.error("Kayıt ekranı yüklenemedi:", err);
    });
} else {
  // Kullanıcı zaten kayıt olduysa ana içeriği göster
  document.getElementById("main-app").style.display = "block";
}

// Registration formunu yakala ve localStorage'a kaydet
function attachRegistrationListener() {
  // Bekle ki registration.js içindeki form gitsin DOM'a yerleşsin
  setTimeout(() => {
    const form = document.getElementById("registration-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Formdan verileri al
        const email = form.querySelector("#email").value;
        const nickname = form.querySelector("#nickname").value;
        // const titleColor = form.querySelector("#titleColor").value;
        // const profileLetter = form.querySelector("#profileLetter").value;

        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem("isRegistered", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userNickname", nickname);
        // localStorage.setItem("userColor", titleColor);
        // localStorage.setItem("userLetter", profileLetter);

        // Registration'ı gizle, app'i göster
        document.getElementById("registration-container").style.display = "none";
        document.getElementById("main-app").style.display = "block";
      });
    }
  }, 300); // Küçük bir bekleme süresi
}

