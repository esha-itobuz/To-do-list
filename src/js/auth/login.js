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

    if (!email || !password) {
      loginMessage.textContent = "All fields are required.";
      loginMessage.classList.add("error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        loginMessage.textContent = "Login successful! Redirecting...";
        loginMessage.classList.add("success");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setTimeout(() => {
          location.href = "/src/pages/todos.html";
        }, 1200);
      } else if (data.message) {
        loginMessage.textContent = data.message;
        loginMessage.classList.add("error");
      } else {
        loginMessage.textContent = "Login failed.";
        loginMessage.classList.add("error");
      }
    } catch (err) {
      loginMessage.textContent = "Network error. Please try again.";
      loginMessage.classList.add("error");
    }
  });
}
