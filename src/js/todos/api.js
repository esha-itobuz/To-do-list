export const API_URL = "http://localhost:3000/todos";
export let USE_API = true;

export async function checkAPI() {
  try {
    const res = await fetch(API_URL);
    USE_API = res.ok;
    console.log("API available:", USE_API);
  } catch (error) {
    USE_API = false;
    console.log("API not available");
  }
}

export async function fetchTodo(id) {
  if (!USE_API) return null;
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Fetch todo failed");
    return await res.json();
  } catch (error) {
    console.error("Error fetching todo:", error);
    return null;
  }
}

export async function fetchTodos() {
  if (!USE_API) return [];
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Fetch todos failed");
    return await res.json();
  } catch (error) {
    console.error("Error fetching todo: ", error);
    return [];
  }
}

export async function createTodo(task, tags) {
  if (!USE_API) return null;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task, tags: tags }),
    });
    if (!res.ok) throw new Error("Create todo failed");
    return await res.json();
  } catch (error) {
    console.error("Error creating todo:", error);
    return null;
  }
}

export async function updateTodo(id, updates) {
  if (!USE_API) return null;
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Update todo failed");
    return await res.json();
  } catch (error) {
    console.error("Error updating todo:", error);
    return null;
  }
}

export async function deleteTodo(id) {
  if (!USE_API) return null;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete todo failed");
    return await res.json();
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
    const res = await fetch(`${API_URL}/search?${qs}`);
    if (!res.ok) throw new Error("Search request failed");
    return await res.json();
  } catch (e) {
    console.error("Error searching todos:", e);
    return [];
  }
}

export async function sortTask(sortFilter) {
  if (!USE_API) return [];
  try {
    const res = await fetch(
      `${API_URL}/sort?sortFilter=${encodeURIComponent(sortFilter)}`
    );
    if (!res.ok) throw new Error("Sort request failed");
    return await res.json();
  } catch (e) {
    console.error("Error sorting todos:", e);
    return [];
  }
}
