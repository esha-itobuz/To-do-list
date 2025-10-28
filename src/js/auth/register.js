const registerForm = document.getElementById("registerForm");
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

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    if (!email || !password) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    showToast("Registering your account...", "info");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message, "success");
        registerForm.reset();
        setTimeout(() => {
          location.href = "./verify-email.html";
        }, 1800);
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      console.error("Registration network/unexpected error:", err);
      showToast(
        "Network error during registration. Please try again.",
        "error"
      );
    }
  });
}
