const API_BASE = "http://localhost:3000";

const emailInput = document.getElementById("email-input");
const profileEmailDisplay = document.getElementById("profile-email-display");
const nameInput = document.getElementById("name-input");
const photoInput = document.getElementById("photo-input");
const profilePhoto = document.getElementById("profile-photo");
const profilePhotoFallback = document.getElementById("profile-photo-fallback");
const saveBtn = document.getElementById("save-profile");
const cancelBtn = document.getElementById("cancel-profile");
const backBtn = document.getElementById("back-to-todos");

async function loadProfile() {
  const savedEmail = localStorage.getItem("profile_email");
  const savedName = localStorage.getItem("profile_name");
  const savedPhoto = localStorage.getItem("profile_photo");

  if (savedEmail) emailInput.value = savedEmail;
  if (savedName) nameInput.value = savedName;
  if (savedPhoto) {
    profilePhoto.src = savedPhoto;
    profilePhoto.style.display = "block";
    profilePhotoFallback.style.display = "none";
  }

  if (!savedEmail) {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.email) emailInput.value = data.email;
          if (data.name && !savedName) nameInput.value = data.name;
          if (profileEmailDisplay)
            profileEmailDisplay.textContent = data.email || "";
        }
      } catch (err) {
        
      }
    }
  }
  if (profileEmailDisplay) {
    profileEmailDisplay.textContent = emailInput.value || "";
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

photoInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const dataUrl = await fileToDataUrl(file);
    profilePhoto.src = dataUrl;
    profilePhoto.style.display = "block";
    profilePhotoFallback.style.display = "none";
  } catch (err) {
    console.error("Failed to read file", err);
  }
});

saveBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const name = nameInput.value.trim();

  if (email) localStorage.setItem("profile_email", email);
  else localStorage.removeItem("profile_email");

  if (name) localStorage.setItem("profile_name", name);
  else localStorage.removeItem("profile_name");

  if (profileEmailDisplay) profileEmailDisplay.textContent = email || "";

  const file = photoInput.files && photoInput.files[0];
  const token = localStorage.getItem("access_token");

  const API_BASE = "http://localhost:3000";

  if (file && token) {
    try {
      const form = new FormData();
      form.append("avatar", file);

      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        console.error("Upload failed", await res.text());
      } else {
        const body = await res.json();

        const avatarUrl = body.avatar ? `${API_BASE}${body.avatar}` : null;
        if (avatarUrl) {
          localStorage.setItem("profile_photo", avatarUrl);
          profilePhoto.src = avatarUrl;
          profilePhoto.style.display = "block";
          profilePhotoFallback.style.display = "none";
        }
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  } else if (profilePhoto && profilePhoto.src) {
    localStorage.setItem("profile_photo", profilePhoto.src);
  }

  window.location.href = "/src/pages/todos.html";
});

cancelBtn.addEventListener("click", () => {
  window.location.href = "/src/pages/todos.html";
});

backBtn.addEventListener("click", () => {
  window.location.href = "/src/pages/todos.html";
});

loadProfile();
