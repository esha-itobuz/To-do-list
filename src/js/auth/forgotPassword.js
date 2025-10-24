const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const otpSection = document.getElementById("otpSection");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const API_BASE_URL = "http://localhost:3000";
let sentEmail = "";

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
      bgColor = "linear-gradient(to right, #dc4c3e, #f87171)";
  }

  Toastify({
    text: message,
    duration: 3500,
    gravity: "top",
    position: "right",
    close: true,
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

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = forgotPasswordForm.email.value.trim();

    if (!email) {
      showToast("Please enter your email address.", "error");
      return;
    }

    sendOtpBtn.disabled = true;
    showToast("Sending OTP...", "info");

    try {
      const res = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset" }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, "success");
        otpSection.style.display = "block";
        sentEmail = email;
        forgotPasswordForm.email.readOnly = true;
        sendOtpBtn.disabled = true;
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      console.error("Network or unexpected error sending OTP:", err);
      showToast("Network error while sending OTP.", "error");
    }

    sendOtpBtn.disabled = false;
  });

  verifyOtpBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("otp").value.trim();

    if (!otp || otp.length !== 6) {
      showToast("Please enter a valid 6-digit OTP.", "error");
      return;
    }

    verifyOtpBtn.disabled = true;
    showToast("Verifying OTP...", "info");

    try {
      const res = await fetch(`${API_BASE_URL}/otp/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentEmail, otp, type: "reset" }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { message: text || "Invalid OTP response" };
      }

      if (res.ok && /valid/i.test(data.message)) {
        showToast(data.message, "success");
        setTimeout(() => {
          window.location.href = `/src/pages/reset-password.html?email=${encodeURIComponent(
            sentEmail
          )}&otp=${encodeURIComponent(otp)}`;
        }, 1000);
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      showToast("Network error during OTP verification.", "error");
    }

    verifyOtpBtn.disabled = false;
  });
}
