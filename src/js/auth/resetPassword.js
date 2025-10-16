const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordMessage = document.getElementById("resetPasswordMessage");

const API_BASE_URL = "http://localhost:3000";

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const email = getQueryParam("email");
const otp = getQueryParam("otp");

if (!email || !otp) {
  if (resetPasswordMessage) {
    resetPasswordMessage.textContent = "Invalid or expired reset link.";
    resetPasswordMessage.className = "form-message error";
  }
  if (resetPasswordForm) resetPasswordForm.style.display = "none";
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetPasswordMessage.textContent = "";
    resetPasswordMessage.className = "form-message";

    const newPassword = resetPasswordForm.newPassword.value;
    const confirmNewPassword = resetPasswordForm.confirmNewPassword.value;

    if (!newPassword || !confirmNewPassword) {
      resetPasswordMessage.textContent = "All fields are required.";
      resetPasswordMessage.classList.add("error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      resetPasswordMessage.textContent = "Passwords do not match.";
      resetPasswordMessage.classList.add("error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, confirmNewPassword }),
      });
      const data = await res.json();
      if (data.passwordResetSuccessMsg) {
        resetPasswordMessage.textContent = data.passwordResetSuccessMsg;
        resetPasswordMessage.classList.add("success");
        resetPasswordForm.reset();
        setTimeout(() => {
          window.location.href = "/src/pages/login.html";
        }, 1500);
      } else if (data.passwordNotMatchMsg) {
        resetPasswordMessage.textContent = data.passwordNotMatchMsg;
        resetPasswordMessage.classList.add("error");
      } else if (data.otpIncorrectMsg) {
        resetPasswordMessage.textContent = data.otpIncorrectMsg;
        resetPasswordMessage.classList.add("error");
      } else {
        resetPasswordMessage.textContent =
          data.passwordResetErrorMsg || "Password reset failed.";
        resetPasswordMessage.classList.add("error");
      }
    } catch (err) {
      resetPasswordMessage.textContent = "Network error. Please try again.";
      resetPasswordMessage.classList.add("error");
    }
  });
}
