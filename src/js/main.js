const inputBox = document.getElementById("input-box");
const inputDropdown = document.getElementById("input_dropdown");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const searchBar = document.getElementById("search-input");
const tagsInput = document.getElementById("tags");

const modal = document.getElementById("myModal");
const closeButton = document.querySelector(".close-button");
const okButton = document.getElementById("modalOkButton");
const cancelButton = document.getElementById("modalCancelButton");
const modalMessage = document.getElementById("modalMessage");
const modalInput = document.getElementById("modalInput");

let currentEditingTask = null;
const API_URL = "http://localhost:3000/todos"; 


async function fetchTodos() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function createTodo(task, priority) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: task, tags: [priority] })
  });
  return await res.json();
}

async function updateTodo(id, updates) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
  return await res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return await res.json();
}

async function addTask(taskText, priority, completed = false, id = null) {
  const task =
    typeof taskText === "string" ? taskText.trim() : inputBox.value.trim();
  const taskPriority = priority || inputDropdown.value;

  if (!task) {
    showModal("Please write down a task", "alert");
    return;
  }

  let newTodo;
  if (!id) {
    newTodo = await createTodo(task, taskPriority);
  } else {
    newTodo = { id, title: task, tags: [taskPriority], isCompleted: completed };
  }

  const li = document.createElement("li");
  li.dataset.id = newTodo.id;
  li.innerHTML = `
    <label>
      <input type="checkbox" ${newTodo.isCompleted ? "checked" : ""}>
      <span class="task-text">${newTodo.title}</span>
      <span class="task-priority">${taskPriority}</span>
    </label>
    <div class="task-buttons">
      <span class="edit-btn">Edit</span>
      <span class="delete-btn">Delete</span>
    </div>
  `;
  listContainer.appendChild(li);

  inputBox.value = "";
  inputDropdown.value = "";

  const checkbox = li.querySelector("input");
  const editBtn = li.querySelector(".edit-btn");
  const taskSpan = li.querySelector(".task-text");
  const prioritySpan = li.querySelector(".task-priority");
  const deleteBtn = li.querySelector(".delete-btn");

  checkbox.addEventListener("click", async function () {
    li.classList.toggle("completed", checkbox.checked);
    await updateTodo(li.dataset.id, { isCompleted: checkbox.checked });
    updateCounters();
  });

  editBtn.addEventListener("click", function () {
    currentEditingTask = { li, taskSpan, prioritySpan, checkbox };
    showModal("Edit Task:", "edit", taskSpan.textContent);
  });

  deleteBtn.addEventListener("click", async function () {
    currentEditingTask = li;
    showModal("Are you sure you want to delete this task?", "delete");
  });

  if (completed) {
    li.classList.add("completed");
    checkbox.checked = true;
  }

  updateCounters();
}

function showModal(message, type, currentValue = "") {
  modalMessage.textContent = message;

  if (type === "edit") {
    modalInput.style.display = "block";
    modalInput.value = currentValue;
    cancelButton.style.display = "inline-block";
    modalInput.focus();
  } else {
    modalInput.style.display = "none";
    cancelButton.style.display = type === "delete" ? "inline-block" : "none";
  }

  modal.style.display = "block";
  modal.dataset.type = type;
}

function hideModal() {
  modal.style.display = "none";
  currentEditingTask = null;
  modalInput.value = "";
}

function updateCounters() {
  const completedTasks = document.querySelectorAll("li.completed").length;
  const totalTasks = document.querySelectorAll("li").length;
  const uncompletedTasks = totalTasks - completedTasks;

  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
}

async function handleModalOk() {
  const type = modal.dataset.type;

  if (type === "edit" && currentEditingTask) {
    const newText = modalInput.value.trim();
    if (newText) {
      currentEditingTask.taskSpan.textContent = newText;
      await updateTodo(currentEditingTask.li.dataset.id, { title: newText });
      currentEditingTask.li.classList.remove("completed");
      currentEditingTask.checkbox.checked = false;
      updateCounters();
    }
  } else if (type === "delete" && currentEditingTask) {
    const id = currentEditingTask.dataset.id;
    await deleteTodo(id);
    currentEditingTask.remove();
    updateCounters();
  }

  hideModal();
}

function performSearch() {
  const searchTerm = searchBar.value.toLowerCase().trim();
  const allTaskItems = document.querySelectorAll("#list-container li");
  let visibleCount = 0;

  allTaskItems.forEach((li) => {
    const taskText = li.querySelector(".task-text").textContent.toLowerCase();
    const taskPriority = li
      .querySelector(".task-priority")
      .textContent.toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      taskText.includes(searchTerm) ||
      taskPriority.includes(searchTerm);

    if (matchesSearch) {
      li.style.display = "flex";
      visibleCount++;
    } else {
      li.style.display = "none";
    }
  });

  showNoResultsMessage(visibleCount === 0 && searchTerm !== "");
  updateCounters();
}

function showNoResultsMessage(show) {
  let noResultsDiv = document.querySelector(".no-results");

  if (show) {
    if (!noResultsDiv) {
      noResultsDiv = document.createElement("div");
      noResultsDiv.className = "no-results";
      noResultsDiv.innerHTML = "No tasks found matching your search.";
      listContainer.appendChild(noResultsDiv);
    }
  } else {
    if (noResultsDiv) {
      noResultsDiv.remove();
    }
  }
}

// ============ Event Listeners ============
inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

modalInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleModalOk();
  }
});

searchBar.addEventListener("input", performSearch);
closeButton.addEventListener("click", hideModal);
cancelButton.addEventListener("click", hideModal);
okButton.addEventListener("click", handleModalOk);

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    hideModal();
  }
});

(async function init() {
  const tasks = await fetchTodos();
  listContainer.innerHTML = "";
  tasks.forEach((task) => {
    addTask(task.title, task.tags[0] || "", task.isCompleted, task.id);
  });
})();
