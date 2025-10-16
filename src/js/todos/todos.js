import {
  checkAPI,
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  searchTask,
  sortTask,
} from "./api.js";
import { refs } from "./selectors.js";

const tagIcon = `<i class="fa-solid fa-tag" style="margin-right: 4px; font-size: 10px;"></i>`;

let currentEditingTask = null;
let currentTags = [];
let editingTags = [];
let currentSortOrder = "default";

(function setupLogout() {
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/src/pages/login.html";
    });
  }
})();

function renderCurrentTags() {
  refs.currentTagsContainer.innerHTML = "";
  currentTags.forEach((tag) => {
    const tagBadge = document.createElement("span");
    tagBadge.className = "tag-badge";
    tagBadge.innerHTML = `
      ${tag}
      <span class="remove-tag" onclick="removeTag('${tag}')">×</span>
    `;
    refs.currentTagsContainer.appendChild(tagBadge);
  });
}

function addTagLocal(tag) {
  if (tag && !currentTags.includes(tag)) {
    currentTags.push(tag);
    renderCurrentTags();
  }
}

function removeTag(tag) {
  currentTags = currentTags.filter((t) => t !== tag);
  renderCurrentTags();
}

function removeEditingTag(tag) {
  editingTags = editingTags.filter((t) => t !== tag);
  renderEditingTags();
}

window.removeTag = removeTag;
window.removeEditingTag = removeEditingTag;

function renderEditingTags() {
  const tagsContainer = document.getElementById("modal-tags-container");
  if (!tagsContainer) return;
  tagsContainer.innerHTML = "";
  editingTags.forEach((tag) => {
    const tagBadge = document.createElement("span");
    tagBadge.className = "tag-badge";
    tagBadge.innerHTML = `
      ${tag}
      <span class="remove-tag" onclick="removeEditingTag('${tag}')">×</span>
    `;
    tagsContainer.appendChild(tagBadge);
  });
}

async function addTask(
  taskText,
  tags,
  completed = false,
  id = null,
  skipSort = false
) {
  const task =
    typeof taskText === "string" ? taskText.trim() : refs.inputBox.value.trim();
  const taskTags = tags || [...currentTags];

  if (!task) {
    showModal("Please write down a task", "alert");
    return;
  }

  let newTodo;
  if (!id) {
    newTodo = await createTodo(task, taskTags);
    if (!newTodo) return;
  } else {
    newTodo = { id, title: task, tags: taskTags, isCompleted: completed };
  }

  const li = document.createElement("li");
  li.dataset.id = newTodo.id;
  li.innerHTML = `
    <label>
      <div class="task">
        <div class="task-head">
          <input type="checkbox" ${newTodo.isCompleted ? "checked" : ""}>
          <span class="task-text">${newTodo.title}</span>
        </div>
        <div class="task-tags">
          ${taskTags
            .map((tag) => `<span class="task-tag">${tagIcon}${tag}</span>`)
            .join("")}
        </div>
      </div>
    </label>
    <div class="task-buttons">
      <span class="edit-btn">Edit</span>
      <span class="delete-btn">Delete</span>
    </div>
  `;
  refs.listContainer.appendChild(li);

  refs.inputBox.value = "";
  currentTags = [];
  renderCurrentTags();

  const checkbox = li.querySelector("input");
  const editBtn = li.querySelector(".edit-btn");
  const taskSpan = li.querySelector(".task-text");
  const deleteBtn = li.querySelector(".delete-btn");

  checkbox.addEventListener("click", async function () {
    li.classList.toggle("completed", checkbox.checked);
    await updateTodo(li.dataset.id, { isCompleted: checkbox.checked });
    updateCounters();
  });

  editBtn.addEventListener("click", function () {
    currentEditingTask = {
      li,
      taskSpan,
      checkbox,
      taskTags: Array.from(li.querySelectorAll(".task-tag")).map(
        (t) => t.textContent
      ),
    };
    editingTags = [...currentEditingTask.taskTags];
    showModal("Edit Task:", "edit", taskSpan.textContent);
  });

  deleteBtn.addEventListener("click", async function () {
    currentEditingTask = li;
    showModal("Are you sure you want to delete this task?", "delete");
  });

  if (newTodo.isCompleted) {
    li.classList.add("completed");
    checkbox.checked = true;
  }

  updateCounters();

  if (!skipSort && currentSortOrder !== "default") {
    sortTasks();
  }
}

function showModal(message, type, currentValue = "") {
  refs.modalMessage.textContent = message;

  if (type === "edit") {
    refs.modalInput.style.display = "block";
    refs.modalInput.placeholder = "Task title";
    refs.modalInput.value = currentValue;
    refs.cancelButton.style.display = "inline-block";

    const existingTagsSection = document.getElementById("modal-tags-section");
    if (existingTagsSection) {
      existingTagsSection.remove();
    }

    const tagsSection = document.createElement("div");
    tagsSection.id = "modal-tags-section";
    tagsSection.style.marginBottom = "20px";
    tagsSection.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input type="text" id="modal-tag-input" placeholder="Add tag" 
          style="flex: 1; padding: 10px 12px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 14px; outline: none;">
        <button id="modal-add-tag-btn" 
          style="padding: 10px 16px; border: none; border-radius: 8px; background: #6c757d; color: white; cursor: pointer; font-size: 14px; font-weight: 600;">
          Add Tag
        </button>
      </div>
      <div id="modal-tags-container" style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 20px;"></div>
    `;

    refs.modalInput.parentNode.insertBefore(
      tagsSection,
      refs.modalInput.nextSibling
    );

    renderEditingTags();

    setTimeout(() => {
      const modalTagInput = document.getElementById("modal-tag-input");
      const modalAddTagBtn = document.getElementById("modal-add-tag-btn");

      if (modalAddTagBtn) {
        modalAddTagBtn.addEventListener("click", () => {
          const input = document.getElementById("modal-tag-input");
          if (input && input.value.trim()) {
            editingTags.push(input.value.trim());
            renderEditingTags();
            input.value = "";
          }
        });
      }

      if (modalTagInput) {
        modalTagInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            const input = document.getElementById("modal-tag-input");
            if (input && input.value.trim()) {
              editingTags.push(input.value.trim());
              renderEditingTags();
              input.value = "";
            }
          }
        });
      }
    }, 0);

    refs.modalInput.focus();
  } else {
    refs.modalInput.style.display = "none";
    const tagsSection = document.getElementById("modal-tags-section");
    if (tagsSection) {
      tagsSection.remove();
    }
    refs.cancelButton.style.display =
      type === "delete" ? "inline-block" : "none";
  }

  refs.modal.style.display = "block";
  refs.modal.dataset.type = type;
}

function hideModal() {
  refs.modal.style.display = "none";
  currentEditingTask = null;
  refs.modalInput.value = "";
  editingTags = [];
  const tagsSection = document.getElementById("modal-tags-section");
  if (tagsSection) {
    tagsSection.remove();
  }
}

async function handleModalOk() {
  const type = refs.modal.dataset.type;

  if (type === "edit" && currentEditingTask) {
    const newText = refs.modalInput.value.trim();
    if (newText) {
      currentEditingTask.taskSpan.textContent = newText;

      const taskTagsContainer =
        currentEditingTask.li.querySelector(".task-tags");
      taskTagsContainer.innerHTML = editingTags
        .map((tag) => `<span class="task-tag">${tag}</span>`)
        .join("");

      await updateTodo(currentEditingTask.li.dataset.id, {
        title: newText,
        tags: editingTags,
      });

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

function updateCounters() {
  const completedTasks = document.querySelectorAll("li.completed").length;
  const totalTasks = document.querySelectorAll("li").length;
  const uncompletedTasks = totalTasks - completedTasks;

  refs.completedCounter.textContent = completedTasks;
  refs.uncompletedCounter.textContent = uncompletedTasks;
}

async function performSearch() {
  const query = refs.searchBar.value.trim();
  const searchFilter =
    refs.sortDropdown.value === "completed" ||
    refs.sortDropdown.value === "uncompleted"
      ? refs.sortDropdown.value
      : "";

  try {
    const tasks = await searchTask(query, searchFilter);
    refs.listContainer.innerHTML = "";
    (tasks || []).forEach((task) =>
      addTask(task.title, task.tags || [], task.isCompleted, task.id, true)
    );
  } catch (e) {
    console.error("performSearch error:", e);
  }
}

async function sortTasks() {
  const sortOrder = refs.sortDropdown.value;
  currentSortOrder = sortOrder;

  try {
    const tasks = await sortTask(sortOrder);
    refs.listContainer.innerHTML = "";
    (tasks || []).forEach((task) =>
      addTask(task.title, task.tags || [], task.isCompleted, task.id, true)
    );
    return;
  } catch (e) {
    console.error("Server sort failed:", e);
  }

  const tasksArray = Array.from(refs.listContainer.children);

  tasksArray.sort((a, b) => {
    const aText = a.querySelector(".task-text").textContent.toLowerCase();
    const bText = b.querySelector(".task-text").textContent.toLowerCase();
    const aCompleted = a.classList.contains("completed");
    const bCompleted = b.classList.contains("completed");
    const aId = parseInt(a.dataset.id);
    const bId = parseInt(b.dataset.id);

    switch (sortOrder) {
      case "alphabetical":
        return aText.localeCompare(bText);
      case "completed":
        return Number(bCompleted) - Number(aCompleted);
      case "uncompleted":
        return Number(aCompleted) - Number(bCompleted);
      case "newest":
        return bId - aId;
      case "oldest":
        return aId - bId;
      default:
        return 0;
    }
  });

  refs.listContainer.innerHTML = "";
  tasksArray.forEach((task) => refs.listContainer.appendChild(task));
}

document.getElementById("input-button").addEventListener("click", function () {
  addTask();
});

refs.inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

refs.tagsInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTagLocal(refs.tagsInput.value.trim());
    refs.tagsInput.value = "";
  }
});

refs.addTagButton.addEventListener("click", () => {
  addTagLocal(refs.tagsInput.value.trim());
  refs.tagsInput.value = "";
});

refs.modalInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleModalOk();
  }
});

let searchTimeout;
refs.searchBar.addEventListener("input", function () {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 250);
});

refs.sortDropdown.addEventListener("change", sortTasks);
refs.closeButton.addEventListener("click", hideModal);
refs.cancelButton.addEventListener("click", hideModal);
refs.okButton.addEventListener("click", handleModalOk);

window.addEventListener("click", function (event) {
  if (event.target === refs.modal) {
    hideModal();
  }
});

(async function init() {
  await checkAPI();
  const tasks = await fetchTodos();
  refs.listContainer.innerHTML = "";
  tasks.forEach((task) => {
    addTask(task.title, task.tags || [], task.isCompleted, task.id, true);
  });
})();
