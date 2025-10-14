const API_BASE_URL = "http://localhost:3000";

export async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };

  console.log("➡️ Fetching:", `${API_BASE_URL}${url}`, options);

  let res = await fetch(`${API_BASE_URL}${url}`, options);

  // If access token expired
  if (res.status === 401 && refreshToken) {
    console.log("Access token expired. Attempting refresh...");

    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      localStorage.setItem("accessToken", refreshData.accessToken);

      console.log(
        "✅ Access token refreshed successfully:",
        refreshData.accessToken
      );

      // Retry original request with new token
      options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
      res = await fetch(`${API_BASE_URL}${url}`, options);

      if (res.ok) {
        console.log("✅ Retried request succeeded after token refresh");
      } else {
        console.error(
          "❌ Retried request failed even after token refresh",
          res.status
        );
      }
    } else {
      console.error("❌ Refresh failed. Logging out...");
      localStorage.clear();
      window.location.href = "./login.html";
    }
  }

  return res;
}
