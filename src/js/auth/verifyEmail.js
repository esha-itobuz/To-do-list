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
  if (isError) {
    msgDiv.style.color = "red";
  } else {
    msgDiv.style.color = "green";
  }
}

sendOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  // if (!email) {
  //   return;
  // }
  sendOtpBtn.disabled = true;
  showMessage("Sending OTP...");
  try {
    const res = await fetch("http://localhost:3000/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "verify" }),
    });
    let data;
    data = await res.json();

    if (res.ok) {
      showMessage(data.message || "OTP sent to your email.");
      otpSection.style.display = "block";
    } else {
      showMessage(data.message || "Failed to send OTP.", true);
    }
  } catch (err) {
    console.error("Network/unexpected error sending OTP:", err);
  }
  sendOtpBtn.disabled = false;
});

verifyOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();

  verifyOtpBtn.disabled = true;
  showMessage("Verifying OTP...");
  try {
    const res = await fetch("http://localhost:3000/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type: "verify" }),
    });
    let data;
    data = await res.json();

    if (res.ok) {
      showMessage(data.message || "Email verified successfully!");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      showMessage(data.message || "Invalid or expired OTP.", true);
    }
  } catch (err) {
    console.error("Network/unexpected error verifying OTP:", err);
  }
  verifyOtpBtn.disabled = false;
});
