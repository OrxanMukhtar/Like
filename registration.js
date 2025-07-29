// registration.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");

  if (localStorage.getItem("registered")) {
    window.location.href = "index.html"; // asıl siteye yönlendirme
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const nickname = document.getElementById("nickname").value;
    const color = document.getElementById("color").value;
    const avatar = document.getElementById("avatar").value.toUpperCase();

    const userData = {
      email,
      nickname,
      color,
      avatar,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("registered", true);

    // window.location.href = "index.html";
  });
});
