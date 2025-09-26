const inputBox = document.getElementById("input-box");
const inputDropdown = document.getElementById("input_dropdown");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const searchBar = document.getElementById("search-input");

const modal = document.getElementById("myModal");
const closeButton = document.querySelector(".close-button");
const okButton = document.getElementById("modalOkButton");
const cancelButton = document.getElementById("modalCancelButton");
const modalMessage = document.getElementById("modalMessage");
const modalInput = document.getElementById("modalInput");

let currentEditingTask = null;
let allTasks = [];

function addTask(taskText, priority, completed = false) {
  const task =
    typeof taskText === "string" ? taskText.trim() : inputBox.value.trim();
  const taskPriority = priority || inputDropdown.value;
  if (!task) {
    showModal("Please write down a task", "alert");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
                <label>
                    <input type="checkbox">
                    <span class="task-text">${task}</span>
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
  const taskSpan = li.querySelector("label span");
  const prioritySpan = li.querySelector("label span");
  const deleteBtn = li.querySelector(".delete-btn");

  checkbox.addEventListener("click", function () {
    li.classList.toggle("completed", checkbox.checked);
    updateCounters();
    saveTasksToLocalStorage();
  });

  editBtn.addEventListener("click", function () {
    currentEditingTask = { li, taskSpan, prioritySpan, checkbox };
    showModal(
      "Edit Task:",
      "edit",
      taskSpan.textContent,
      prioritySpan.textContent
    );
  });

  deleteBtn.addEventListener("click", function () {
    currentEditingTask = li;
    showModal("Are you sure you want to delete this task?", "delete");
  });

  if (completed) {
    li.classList.add("completed");
    checkbox.checked = true;
  }

  updateCounters();
  saveTasksToLocalStorage();
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

function handleModalOk() {
  const type = modal.dataset.type;

  if (type === "edit" && currentEditingTask) {
    const newText = modalInput.value.trim();
    if (newText) {
      currentEditingTask.taskSpan.textContent = newText;
      currentEditingTask.li.classList.remove("completed");
      currentEditingTask.checkbox.checked = false;
      updateCounters();
    }
  } else if (type === "delete" && currentEditingTask) {
    currentEditingTask.remove();
    updateCounters();
  }

  hideModal();
  saveTasksToLocalStorage();
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

      if (searchTerm !== "") {
        highlightSearchTerm(li.querySelector(".task-text"), searchTerm);
      } else {
        removeHighlight(li.querySelector(".task-text"));
      }
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

inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

modalInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
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

updateCounters();
loadTasksFromLocalStorage();

function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#list-container li").forEach((li) => {
    const checkbox = li.querySelector("input[type='checkbox']");
    const taskSpan = li.querySelector("label span");
    const prioritySpan = li.querySelector(".task-priority");
    tasks.push({
      text: taskSpan.textContent,
      priority: prioritySpan.textContent,
      completed: li.classList.contains("completed"),
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  listContainer.innerHTML = "";
  tasks.forEach((task) => {
    inputBox.value = task.text;
    inputDropdown.value = task.priority;
    addTask();
    const lastLi = listContainer.lastElementChild;
    if (task.completed) {
      lastLi.classList.add("completed");
      lastLi.querySelector("input[type='checkbox']").checked = true;
    }
  });
  inputBox.value = "";
  inputDropdown.value = "";
}
