const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const API_BASE_URL = "http://localhost:3000";

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginMessage.className = "form-message";

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    // if (!email || !password) {
      
    //   return;
    // }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      data = await res.json();

      if (res.status === 403 && data.message?.includes("not verified")) {
        loginMessage.textContent = data.message;
        loginMessage.classList.add("error");

        setTimeout(() => {
          window.location.href = `/src/pages/verify-email.html?email=${encodeURIComponent(
            email
          )}`;
        }, 1800);

        return;
      }

      if (res.ok && data.accessToken) {
        loginMessage.textContent = "Login successful! Redirecting...";
        loginMessage.classList.add("success");
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        setTimeout(() => {
          location.href = "/src/pages/todos.html";
        }, 1200);
      } else {
        loginMessage.textContent = data.message || data.error;
        loginMessage.classList.add("error");
      }
    } catch (err) {
      console.error("Login network/unexpected error:", err);
    }
  });
}
