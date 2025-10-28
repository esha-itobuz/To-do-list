const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordMessage = document.getElementById("resetPasswordMessage");
const API_BASE_URL = "http://localhost:3000";

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const email = getQueryParam("email");
const otp = getQueryParam("otp");

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

if (!email || !otp) {
  if (resetPasswordForm) resetPasswordForm.style.display = "none";
  showToast("Cannot reset password", "error");
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = resetPasswordForm.newPassword.value.trim();
    const confirmNewPassword =
      resetPasswordForm.confirmNewPassword.value.trim();

    if (!newPassword || !confirmNewPassword) {
      showToast("Please fill out both password fields.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    showToast("Resetting your password...", "info");

    try {
      const res = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          type: "reset",
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, "success");
        resetPasswordForm.reset();
        setTimeout(() => {
          window.location.href = "/src/pages/login.html";
        }, 1200);
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      console.error("Network/unexpected error during password reset:", err);
      showToast("Network error while resetting password.", "error");
    }
  });
}
