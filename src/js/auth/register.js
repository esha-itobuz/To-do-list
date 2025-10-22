const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

const API_BASE_URL = "http://localhost:3000";

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerMessage.textContent = "";
    registerMessage.className = "form-message";

    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirmPassword = registerForm.confirmPassword.value;

    // if (!email || !password || !confirmPassword) {
    //   
    //   return;
    // }
    // if (password !== confirmPassword) {
    //  
    //   return;
    // }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      data = await res.json();

      if (res.ok && data.success) {
        registerMessage.textContent =
          data.message || "Registration successful! Please verify your email.";
        registerMessage.classList.add("success");
        registerForm.reset();
        setTimeout(() => {
          location.href = "./verify-email.html";
        }, 1800);
      } else {
        registerMessage.textContent = data.message || "Registration failed.";
        registerMessage.classList.add("error");
      }
    } catch (err) {
      console.error("Registration network/unexpected error:", err);
    }
  });
}
