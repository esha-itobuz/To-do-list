const inputBox = document.getElementById("input-box");
const tagsInput = document.getElementById("tags-input");
const currentTagsContainer = document.getElementById("current-tags");
const addTagButton = document.getElementById("add-tag-button");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const searchBar = document.getElementById("search-input");
const sortDropdown = document.getElementById("sort-dropdown");

const modal = document.getElementById("myModal");
const closeButton = document.querySelector(".close-button");
const okButton = document.getElementById("modalOkButton");
const cancelButton = document.getElementById("modalCancelButton");
const modalMessage = document.getElementById("modalMessage");
const modalInput = document.getElementById("modalInput");

let currentEditingTask = null;
let currentTags = [];
let editingTags = []; 
const API_URL = "http://localhost:3000/todos";
let USE_API = true;
let todosDatabase = [];
let currentSortOrder = "default";

async function checkAPI() {
  try {
    const res = await fetch(API_URL);
    USE_API = res.ok;
    console.log("API available:", USE_API);
  } catch (error) {
    USE_API = false;
    console.log("API not available, using in-memory storage");
  }
}

async function fetchTodos() {
  if (USE_API) {
    try {
      const res = await fetch(API_URL);
      return await res.json();
    } catch (error) {
      console.error("Error fetching todos:", error);
      return [];
    }
  } else {
    return todosDatabase;
  }
}

async function createTodo(task, tags) {
  if (USE_API) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task, tags: tags })
      });
      return await res.json();
    } catch (error) {
      console.error("Error creating todo:", error);
      return null;
    }
  } else {
    const newTodo = {
      id: Date.now(),
      title: task,
      tags: tags,
      isCompleted: false
    };
    todosDatabase.push(newTodo);
    return newTodo;
  }
}

async function updateTodo(id, updates) {
  if (USE_API) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (error) {
      console.error("Error updating todo:", error);
      return null;
    }
  } else {
    const todo = todosDatabase.find(t => t.id == id);
    if (todo) {
      Object.assign(todo, updates);
      return todo;
    }
    return null;
  }
}

async function deleteTodo(id) {
  if (USE_API) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      return await res.json();
    } catch (error) {
      console.error("Error deleting todo:", error);
      return null;
    }
  } else {
    todosDatabase = todosDatabase.filter(t => t.id != id);
    return { success: true };
  }
}

function addTag() {
  const tag = tagsInput.value.trim();
  if (tag && !currentTags.includes(tag)) {
    currentTags.push(tag);
    renderCurrentTags();
    tagsInput.value = "";
  }
}

function removeTag(tag) {
  currentTags = currentTags.filter(t => t !== tag);
  renderCurrentTags();
}

function renderCurrentTags() {
  currentTagsContainer.innerHTML = "";
  currentTags.forEach(tag => {
    const tagBadge = document.createElement("span");
    tagBadge.className = "tag-badge";
    tagBadge.innerHTML = `
      ${tag}
      <span class="remove-tag" onclick="removeTag('${tag}')">×</span>
    `;
    currentTagsContainer.appendChild(tagBadge);
  });
}

function addEditingTag() {
  const modalTagInput = document.getElementById("modal-tag-input");
  const tag = modalTagInput.value.trim();
  if (tag && !editingTags.includes(tag)) {
    editingTags.push(tag);
    renderEditingTags();
    modalTagInput.value = "";
  }
}

function removeEditingTag(tag) {
  editingTags = editingTags.filter(t => t !== tag);
  renderEditingTags();
}

function renderEditingTags() {
  const tagsContainer = document.getElementById("modal-tags-container");
  if (!tagsContainer) return;
  
  tagsContainer.innerHTML = "";
  editingTags.forEach(tag => {
    const tagBadge = document.createElement("span");
    tagBadge.className = "tag-badge";
    tagBadge.innerHTML = `
      ${tag}
      <span class="remove-tag" onclick="removeEditingTag('${tag}')">×</span>
    `;
    tagsContainer.appendChild(tagBadge);
  });
}

async function addTask(taskText, tags, completed = false, id = null) {
  const task = typeof taskText === "string" ? taskText.trim() : inputBox.value.trim();
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
      <input type="checkbox" ${newTodo.isCompleted ? "checked" : ""}>
      <span class="task-text">${newTodo.title}</span>
      <div class="task-tags">
        ${taskTags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
      </div>
    </label>
    <div class="task-buttons">
      <span class="edit-btn">Edit</span>
      <span class="delete-btn">Delete</span>
    </div>
  `;
  listContainer.appendChild(li);

  inputBox.value = "";
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
      taskTags: Array.from(li.querySelectorAll('.task-tag')).map(t => t.textContent) 
    };
    editingTags = [...currentEditingTask.taskTags];
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
  
  if (currentSortOrder !== "default") {
    sortTasks();
  }
}

function showModal(message, type, currentValue = "") {
  modalMessage.textContent = message;

  if (type === "edit") {
    modalInput.style.display = "block";
    modalInput.placeholder = "Task title";
    modalInput.value = currentValue;
    cancelButton.style.display = "inline-block";
    
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
    
    modalInput.parentNode.insertBefore(tagsSection, modalInput.nextSibling);
    
    renderEditingTags();
    
    setTimeout(() => {
      const modalTagInput = document.getElementById("modal-tag-input");
      const modalAddTagBtn = document.getElementById("modal-add-tag-btn");
      
      if (modalAddTagBtn) {
        modalAddTagBtn.addEventListener("click", addEditingTag);
      }
      
      if (modalTagInput) {
        modalTagInput.addEventListener("keypress", function(e) {
          if (e.key === "Enter") {
            e.preventDefault();
            addEditingTag();
          }
        });
      }
    }, 0);
    
    modalInput.focus();
  } else {
    modalInput.style.display = "none";
    const tagsSection = document.getElementById("modal-tags-section");
    if (tagsSection) {
      tagsSection.remove();
    }
    cancelButton.style.display = type === "delete" ? "inline-block" : "none";
  }

  modal.style.display = "block";
  modal.dataset.type = type;
}

function hideModal() {
  modal.style.display = "none";
  currentEditingTask = null;
  modalInput.value = "";
  editingTags = [];
  const tagsSection = document.getElementById("modal-tags-section");
  if (tagsSection) {
    tagsSection.remove();
  }
}

async function handleModalOk() {
  const type = modal.dataset.type;

  if (type === "edit" && currentEditingTask) {
    const newText = modalInput.value.trim();
    if (newText) {
      currentEditingTask.taskSpan.textContent = newText;
      
      const taskTagsContainer = currentEditingTask.li.querySelector('.task-tags');
      taskTagsContainer.innerHTML = editingTags.map(tag => `<span class="task-tag">${tag}</span>`).join('');
      
      await updateTodo(currentEditingTask.li.dataset.id, { 
        title: newText,
        tags: editingTags
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

  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
}

function performSearch() {
  const searchTerm = searchBar.value.toLowerCase().trim();
  const allTaskItems = document.querySelectorAll("#list-container li");

  allTaskItems.forEach((li) => {
    const taskText = li.querySelector(".task-text").textContent.toLowerCase();
    const taskTags = Array.from(li.querySelectorAll(".task-tag"))
      .map(tag => tag.textContent.toLowerCase());

    const matchesSearch =
      searchTerm === "" ||
      taskText.includes(searchTerm) ||
      taskTags.some(tag => tag.includes(searchTerm));

    li.style.display = matchesSearch ? "flex" : "none";
  });
}

function sortTasks() {
  const sortOrder = sortDropdown.value;
  currentSortOrder = sortOrder;
  const tasksArray = Array.from(listContainer.children);
  
  tasksArray.sort((a, b) => {
    const aText = a.querySelector('.task-text').textContent.toLowerCase();
    const bText = b.querySelector('.task-text').textContent.toLowerCase();
    const aCompleted = a.classList.contains('completed');
    const bCompleted = b.classList.contains('completed');
    const aId = parseInt(a.dataset.id);
    const bId = parseInt(b.dataset.id);

    switch(sortOrder) {
      case 'alphabetical':
        return aText.localeCompare(bText);
      case 'completed':
        return bCompleted - aCompleted;
      case 'uncompleted':
        return aCompleted - bCompleted;
      case 'newest':
        return bId - aId;
      case 'oldest':
        return aId - bId;
      default:
        return 0;
    }
  });

  listContainer.innerHTML = '';
  tasksArray.forEach(task => listContainer.appendChild(task));
}

document.getElementById("input-button").addEventListener("click", function() {
  addTask();
});

inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

tagsInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTag();
  }
});

addTagButton.addEventListener("click", addTag);

modalInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleModalOk();
  }
});

searchBar.addEventListener("input", performSearch);
sortDropdown.addEventListener("change", sortTasks);
closeButton.addEventListener("click", hideModal);
cancelButton.addEventListener("click", hideModal);
okButton.addEventListener("click", handleModalOk);

window.addEventListener("click", function (event) {
  if (event.target === modal) {
    hideModal();
  }
});

(async function init() {
  await checkAPI();
  const tasks = await fetchTodos();
  listContainer.innerHTML = "";
  tasks.forEach((task) => {
    addTask(task.title, task.tags || [], task.isCompleted, task.id);
  });
})();