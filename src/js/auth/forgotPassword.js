const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotPasswordMessage = document.getElementById("forgotPasswordMessage");
const otpSection = document.getElementById("otpSection");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const API_BASE_URL = "http://localhost:3000";
let sentEmail = "";

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    forgotPasswordMessage.textContent = "";
    forgotPasswordMessage.className = "form-message";

    const email = forgotPasswordForm.email.value.trim();
    if (!email) {
      forgotPasswordMessage.textContent = "Email is required.";
      forgotPasswordMessage.classList.add("error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset" }),
      });
      const data = await res.json();
      if (res.ok) {
        forgotPasswordMessage.textContent =
          data.message || "OTP sent to your email.";
        forgotPasswordMessage.classList.add("success");
        otpSection.style.display = "block";
        sentEmail = email;
        forgotPasswordForm.email.readOnly = true;
        sendOtpBtn.disabled = true;
      } else {
        forgotPasswordMessage.textContent =
          data.message || "Failed to send OTP.";
        forgotPasswordMessage.classList.add("error");
      }
    } catch (err) {
      forgotPasswordMessage.textContent = "Network error. Please try again.";
      forgotPasswordMessage.classList.add("error");
    }
  });
}

verifyOtpBtn.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordMessage.textContent = "";
  forgotPasswordMessage.className = "form-message";

  const otp = document.getElementById("otp").value.trim();
  if (!otp || otp.length !== 6) {
    forgotPasswordMessage.textContent = "Please enter the 6-digit OTP.";
    forgotPasswordMessage.classList.add("error");
    return;
  }
  window.location.href = `/src/pages/reset-password.html?email=${encodeURIComponent(
    sentEmail
  )}&otp=${encodeURIComponent(otp)}`;
});
