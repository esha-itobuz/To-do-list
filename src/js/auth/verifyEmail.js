const emailInput = document.getElementById("email");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpSection = document.getElementById("otpSection");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpInput = document.getElementById("otp");
const form = document.getElementById("auth-container");

function showMessage(msg, isError = false) {
  let msgDiv = document.getElementById("verify-msg");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "verify-msg";
    form.appendChild(msgDiv);
  }
  msgDiv.textContent = msg;
  msgDiv.style.color = isError ? "red" : "green";
}

sendOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) {
    showMessage("Please enter your email.", true);
    return;
  }
  sendOtpBtn.disabled = true;
  showMessage("Sending OTP...");
  try {
    const res = await fetch("http://localhost:3000/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "verify" }),
    });
    const data = await res.json();
    if (res.ok) {
      showMessage("OTP sent to your email.");
      otpSection.style.display = "block";
    } else {
      showMessage(data.message || "Failed to send OTP.", true);
    }
  } catch (err) {
    showMessage("Error sending OTP.", true);
  }
  sendOtpBtn.disabled = false;
});

verifyOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();
  if (!otp || otp.length !== 6) {
    showMessage("Please enter a valid 6-digit OTP.", true);
    return;
  }
  verifyOtpBtn.disabled = true;
  showMessage("Verifying OTP...");
  try {
    const res = await fetch("http://localhost:3000/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type: "verify" }),
    });
    const data = await res.json();
    if (res.ok) {
      showMessage("Email verified successfully!");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      showMessage(data.message || "Invalid or expired OTP.", true);
    }
  } catch (err) {
    showMessage("Error verifying OTP.", true);
  }
  verifyOtpBtn.disabled = false;
});
