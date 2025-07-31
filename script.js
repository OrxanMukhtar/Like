import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

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

const userDataStr = localStorage.getItem("userData");
if (!userDataStr) {
  window.location.href = "registration.html";
}
const userData = JSON.parse(userDataStr);

postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const content = document.getElementById("content").value.trim();

  if (!content) {
    alert("Lütfen bir içerik giriniz.");
    return;
  }

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

function createPostElement(postId, postData) {
  const postEl = document.createElement("div");
  postEl.classList.add("post");

  const header = document.createElement("div");
  header.className = "post-header";

  const avatarBox = document.createElement("div");
  avatarBox.className = "avatar";
  avatarBox.textContent = postData.avatar || postData.author.charAt(0).toUpperCase();

  const time = document.createElement("span");
  time.className = "post-time";
  time.textContent = formatDate(postData.timestamp);
  header.appendChild(time);

  const authorName = document.createElement("strong");
  authorName.textContent = postData.author;

  header.appendChild(avatarBox);
  header.appendChild(authorName);

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

  const contentP = document.createElement("p");
  contentP.textContent = postData.content;
  postEl.appendChild(contentP);

  const commentList = document.createElement("div");
  commentList.className = "comment-list";

  if (postData.comments) {
    Object.entries(postData.comments).forEach(([cid, comment]) => {
      const commentEl = document.createElement("div");
      commentEl.className = "comment";
      commentEl.style.backgroundColor = comment.color || "#007BFF";

      const cTime = document.createElement("span");
      cTime.className = "comment-time";
      cTime.textContent = " (" + formatDate(comment.timestamp) + ") : ";

      const cAvatar = document.createElement("div");
      cAvatar.className = "avatar small-avatar";
      cAvatar.textContent = comment.avatar || comment.author.charAt(0).toUpperCase();

      const cAuthor = document.createElement("strong");
      cAuthor.textContent = comment.author;

      const cText = document.createElement("span");
      cText.textContent = comment.text;

      commentEl.appendChild(cAvatar);
      commentEl.appendChild(cAuthor);
      commentEl.appendChild(cTime);
      commentEl.appendChild(cText);

      commentList.appendChild(commentEl);
    });
  }
  postEl.appendChild(commentList);

  const commentForm = document.createElement("form");
  commentForm.className = "comment-form";

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
      text: commentText,
      timestamp: Date.now()
    });

    commentForm.reset();
  });

  postEl.appendChild(commentForm);

  return postEl;
}

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

const settingsBtn = document.getElementById("settings-btn");
const modal = document.getElementById("settings-modal");
const closeBtn = document.getElementById("close-settings");
const saveBtn = document.getElementById("save-settings");

const emailInput = document.getElementById("settings-email");
const nicknameInput = document.getElementById("settings-nickname");
const colorInput = document.getElementById("settings-color");
const avatarInput = document.getElementById("settings-avatar");

settingsBtn.addEventListener("click", () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  emailInput.value = userData.email;
  nicknameInput.value = userData.nickname;
  colorInput.value = userData.color;
  avatarInput.value = userData.avatar;
  modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveBtn.addEventListener("click", () => {
  const updatedUser = {
    email: emailInput.value,
    nickname: nicknameInput.value,
    color: colorInput.value,
    avatar: avatarInput.value.toUpperCase(),
  };

  localStorage.setItem("userData", JSON.stringify(updatedUser));
  modal.classList.add("hidden");
  location.reload();
});

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("chat-btn")) {
    const email = e.target.getAttribute("data-email");
    const nickname = e.target.getAttribute("data-nickname");

    if (email && nickname) {
      const myData = JSON.parse(localStorage.getItem("userData"));
      const url = new URL("chat-room.html", window.location.href);
      url.searchParams.set("me", myData.email);
      url.searchParams.set("other", email);
      window.location.href = url.toString();
    }
  }
});


const chatStartBtn = document.getElementById("chat-start-btn");
chatStartBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});
