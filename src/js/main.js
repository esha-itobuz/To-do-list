const inputBox = document.getElementById("input-box");
const inputDropdown = document.getElementById("input_dropdown");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");

const modal = document.getElementById("myModal");
const closeButton = document.querySelector(".close-button");
const okButton = document.getElementById("modalOkButton");
const cancelButton = document.getElementById("modalCancelButton");
const modalMessage = document.getElementById("modalMessage");
const modalInput = document.getElementById("modalInput");

let currentEditingTask = null;

function addTask() {
  const task = inputBox.value.trim();
  const priority = inputDropdown.value;
  if (!task) {
    showModal("Please write down a task", "alert");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
                <label>
                    <input type="checkbox">
                    <span>${task}</span>
                    <span class="task-priority">${priority}</span>
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
}

inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

modalInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter" && modal.dataset.type === "edit") {
    handleModalOk();
  }
});

closeButton.addEventListener("click", hideModal);
cancelButton.addEventListener("click", hideModal);
okButton.addEventListener("click", handleModalOk);

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    hideModal();
  }
});

updateCounters();
