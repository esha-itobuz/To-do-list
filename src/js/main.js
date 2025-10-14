const signUpButton = document.getElementById("sign-up-button");
const loginButton = document.getElementById("login-button");

signUpButton.addEventListener(
  "click",
  async (e) => (window.location.href = "src/pages/register.html")
);
loginButton.addEventListener("click", async (e) => {
  window.location.href = "src/pages/login.html";
});
