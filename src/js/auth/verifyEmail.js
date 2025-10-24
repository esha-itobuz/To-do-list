const emailInput = document.getElementById("email");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpSection = document.getElementById("otpSection");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpInput = document.getElementById("otp");

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
    close: true,
    style: { background: bgColor, borderRadius: "8px", fontWeight: "500" },
  }).showToast();
}

sendOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!email) {
    showToast("Please enter your email address.", "error");
    return;
  }

  sendOtpBtn.disabled = true;
  showToast("Sending OTP...", "info");

  try {
    const res = await fetch("http://localhost:3000/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "verify" }),
    });
    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      otpSection.style.display = "block";
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    console.error("Error sending OTP:", err);
    showToast("Network error while sending OTP.", "error");
  }

  sendOtpBtn.disabled = false;
});

verifyOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();

  if (!otp || otp.length !== 6) {
    showToast("Please enter a valid 6-digit OTP.", "error");
    return;
  }

  verifyOtpBtn.disabled = true;
  showToast("Verifying OTP...", "info");

  try {
    const res = await fetch("http://localhost:3000/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type: "verify" }),
    });
    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    showToast("Network error while verifying OTP.", "error");
  }

  verifyOtpBtn.disabled = false;
});
