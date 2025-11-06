document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = form.querySelector('input[type="text"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    const requestBody = {
      email: username,
      password: password,
    };

    console.log("🔄 Login sorğusu göndərilir:", requestBody);

    try {
      const response = await fetch(
        "https://api.sarkhanrahimli.dev/api/filmalisa/auth/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      console.log("📥 Serverdən cavab gəldi:", data);

      if (response.ok && data.result === true) {
        console.log("✅ Giriş uğurludur!");
        alert("Login uğurludur!");
        // window.location.href = "/admin/dashboard.html";
      } else {
        console.warn("❌ Giriş uğursuzdur. Server mesajı:", data.message);
        alert("Xəta: " + data.message);
      }
    } catch (error) {
      console.error("🚨 Serverə sorğu zamanı xəta baş verdi:", error);
      alert("Serverə qoşulmaq mümkün olmadı.");
    }
  });
});
