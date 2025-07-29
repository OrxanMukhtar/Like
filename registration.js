document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");

  // Eğer kayıtlıysa ana sayfaya yönlendir (index.html)
  if (localStorage.getItem("registered")) {
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const color = document.getElementById("color").value;
    const avatar = document.getElementById("avatar").value.trim().toUpperCase();

    if (!email || !nickname || !avatar) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    const userData = {
      email,
      nickname,
      color,
      avatar,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("registered", "true");

    window.location.href = "index.html";
  });
});
