const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotPasswordMessage = document.getElementById("forgotPasswordMessage");
const otpSection = document.getElementById("otpSection");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const API_BASE_URL = "http://localhost:3000";

let sentEmail = "";

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    forgotPasswordMessage.textContent = "";
    forgotPasswordMessage.className = "form-message";

    const email = forgotPasswordForm.email.value.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset" }),
      });
      let data;
      data = await res.json();

      if (res.ok) {
        forgotPasswordMessage.textContent = data.message;
        forgotPasswordMessage.classList.add("success");
        otpSection.style.display = "block";
        sentEmail = email;
        forgotPasswordForm.email.readOnly = true;
        sendOtpBtn.disabled = true;
      } else {
        forgotPasswordMessage.textContent = data.message;
        forgotPasswordMessage.classList.add("error");
      }
    } catch (err) {
      console.error("Network or unexpected error sending OTP:", err);
    }
  });

  verifyOtpBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    forgotPasswordMessage.textContent = "";
    forgotPasswordMessage.className = "form-message";

    const otp = document.getElementById("otp").value.trim();
    // if (!otp || otp.length !== 6) {
    //   return;
    // }

    try {
      const res = await fetch(`${API_BASE_URL}/otp/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentEmail, otp, type: "reset" }),
      });
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        data = { message: text || res.statusText || "OTP verification failed" };
      }
      console.log("OTP check response:", res.status, data);

      if (res.ok && data.message && /valid/i.test(data.message)) {
        forgotPasswordMessage.textContent =
          data.message || "OTP verified. Redirecting to Reset Password Page.";

        setTimeout(() => {
          window.location.href = `/src/pages/reset-password.html?email=${encodeURIComponent(
            sentEmail
          )}&otp=${encodeURIComponent(otp)}`;
        }, 600);
      } else {
        forgotPasswordMessage.textContent =
          data.message || "OTP verification failed.";
        forgotPasswordMessage.classList.add("error");
      }
    } catch (err) {
      console.error("Network or parsing error during OTP check:", err);
    }
  });
}
