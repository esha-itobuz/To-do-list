import axios from "axios";

export let USE_API = true;
const BASE_PATH = "http://localhost:3000/todos";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");
      try {
        const res = await axios.post(
          "/auth/refresh",
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
            baseURL: "http://localhost:3000",
          }
        );
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        window.location.href = "src/pages/login.html";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export async function checkAPI() {
  try {
    const res = await api.get("/todos");
    USE_API = res.status === 200;
    console.log("API available:", USE_API);
  } catch (error) {
    USE_API = false;
    console.log("API not available");
  }
}

export async function fetchTodo(id) {
  if (!USE_API) return null;
  try {
    const res = await api.get(`/todos/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching todo:", error);
    return null;
  }
}

export async function fetchTodos() {
  if (!USE_API) return [];
  try {
    const res = await api.get("/todos");
    return res.data;
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
}

export async function createTodo(task, tags) {
  if (!USE_API) return null;
  try {
    const res = await api.post("/todos", { title: task, tags });
    return res.data;
  } catch (error) {
    console.error("Error creating todo:", error);
    return null;
  }
}

export async function updateTodo(id, updates) {
  if (!USE_API) return null;
  try {
    const res = await api.patch(`/todos/${id}`, updates);
    return res.data;
  } catch (error) {
    console.error("Error updating todo:", error);
    return null;
  }
}

export async function deleteTodo(id) {
  if (!USE_API) return null;
  try {
    const res = await api.delete(`/todos/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting todo:", error);
    return null;
  }
}

export async function searchTask(searchText, searchFilter) {
  if (!USE_API) return [];
  try {
    const qs = `searchText=${encodeURIComponent(
      searchText || ""
    )}&searchFilter=${encodeURIComponent(searchFilter || "")}`;
    const res = await api.get(`/todos/search?${qs}`);
    return res.data;
  } catch (e) {
    console.error("Error searching todos:", e);
    return [];
  }
}

export async function sortTask(sortFilter) {
  if (!USE_API) return [];
  try {
    const res = await api.get(
      `/todos/sort?sortFilter=${encodeURIComponent(sortFilter)}`
    );
    return res.data;
  } catch (e) {
    console.error("Error sorting todos:", e);
    return [];
  }
}

export default api;
