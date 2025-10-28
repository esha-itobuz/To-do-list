const loginForm = document.getElementById("loginForm");
const API_BASE_URL = "http://localhost:3000";

function showToast(message, type = "info") {
  let bgColor;
  switch (type) {
    case "success":
      bgColor = "linear-gradient(to right, #16a34a, #22c55e)";
      break;
    case "error":
      bgColor = "linear-gradient(to right, #dc2626, #ef4444)";
      break;
    default:
      bgColor = "linear-gradient(to right, #3b82f6, #2563eb)";
  }

  Toastify({
    text: message,
    duration: 3500,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: bgColor,
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "500",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
    },
  }).showToast();
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    if (!email || !password) {
      showToast("Please fill in both email and password.", "error");
      return;
    }

    showToast("Logging in...", "info");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      const user = data.user;

      if (!res.ok) {
        showToast(data.message, "error");
        setTimeout(() => {
          window.location.href = `/src/pages/verify-email.html?email=${encodeURIComponent(
            email
          )}`;
        }, 1500);
        return;
      }

      if (res.ok && data.accessToken) {
        showToast(data.message, "success");
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        setTimeout(() => {
          location.href = "/src/pages/todos.html";
        }, 1200);
      } else {
        showToast(data.message || data.error, "error");
      }
    } catch (err) {
      console.error("Login network/unexpected error:", err);
      showToast("Network error during login. Please try again.", "error");
    }
  });
}
