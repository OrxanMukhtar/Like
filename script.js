import { ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Referanslar
const viewsRef = ref(db, 'stats/views');
const likesRef = ref(db, 'stats/likes');

// Sayfa yüklendiğinde view sayısını artır
runTransaction(viewsRef, (current) => (current || 0) + 1);

// Sayıları canlı dinle
onValue(viewsRef, (snap) => {
  document.getElementById('views').textContent = `👁️ ${snap.val()}`;
});
onValue(likesRef, (snap) => {
  document.getElementById('likes').textContent = snap.val();
});

// Like butonuna basılınca artır
document.getElementById('likeBtn').addEventListener('click', () => {
  runTransaction(likesRef, (current) => (current || 0) + 1);
});
