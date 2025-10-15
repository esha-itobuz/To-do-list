const API_BASE_URL = "http://localhost:3000";

export async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };

  console.log("[fetchWithAuth] Fetching:", `${API_BASE_URL}${url}`, options);
  console.log("[fetchWithAuth] accessToken:", accessToken);
  console.log("[fetchWithAuth] refreshToken:", refreshToken);

  let res = await fetch(`${API_BASE_URL}${url}`, options);
  console.log("[fetchWithAuth] Response status:", res.status);

  if (res.status === 401) {
    console.log("[fetchWithAuth] Received 401 Unauthorized");
    if (!refreshToken) {
      console.warn("[fetchWithAuth] No refresh token found in localStorage");
    } else {
      console.log(
        "[fetchWithAuth] Access token expired. Attempting refresh..."
      );

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      console.log(
        "[fetchWithAuth] /auth/refresh response status:",
        refreshRes.status
      );

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        localStorage.setItem("accessToken", refreshData.accessToken);

        console.log(
          "[fetchWithAuth] Access token refreshed successfully:",
          refreshData.accessToken
        );

        options.headers.Authorization = `Bearer ${refreshData.accessToken}`;
        res = await fetch(`${API_BASE_URL}${url}`, options);

        if (res.ok) {
          console.log(
            "[fetchWithAuth] Retried request succeeded after token refresh"
          );
        } else {
          console.error(
            "[fetchWithAuth] Retried request failed even after token refresh",
            res.status
          );
        }
      } else {
        console.error("[fetchWithAuth] Refresh failed. Logging out...");
        localStorage.clear();
        window.location.href = "./login.html";
      }
    }
  }

  return res;
}
