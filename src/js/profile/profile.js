const API_BASE = "http://localhost:3000";

const profileEmailDisplay = document.getElementById("profile-email-display");
const nameInput = document.getElementById("name-input");
const photoInput = document.getElementById("photo-input");
const profilePhoto = document.getElementById("profile-photo");
const profilePhotoFallback = document.getElementById("profile-photo-fallback");
const saveBtn = document.getElementById("save-profile");
const cancelBtn = document.getElementById("cancel-profile");
const backBtn = document.getElementById("back-to-todos");

async function loadProfile() {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const body = await res.json();
    const user = body.user;
    if (!user) return;

    if (nameInput){
       nameInput.value = user.name || "";
    }

    if (user.avatar && profilePhoto) {
      profilePhoto.src = user.avatar;
      profilePhoto.style.display = "block";
      if (profilePhotoFallback) profilePhotoFallback.style.display = "none";
    }

    if (profileEmailDisplay){
      profileEmailDisplay.textContent = user.email || "";
    }
  } catch (err) {
    console.error("Failed to load profile from server", err);
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
  const name = nameInput.value.trim();
  const file = photoInput.files && photoInput.files[0];
  const token = localStorage.getItem("access_token");

  if (file && token) {
    try {
      const form = new FormData();
      form.append("avatar", file);

      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        console.error("Upload failed", await res.text());
      } else {
        const body = await res.json();
        const avatarUrl =
          body.avatar && body.avatar.startsWith("http")
            ? body.avatar
            : body.avatar
            ? `${API_BASE}${body.avatar}`
            : null;
        if (avatarUrl) {
          profilePhoto.src = avatarUrl;
          profilePhoto.style.display = "block";
          if (profilePhotoFallback) profilePhotoFallback.style.display = "none";
        }
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  }

  if (token && typeof name !== "undefined") {
    try {
      await fetch(`${API_BASE}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
    } catch (err) {
      console.error("Failed to update profile name on server", err);
    }
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
