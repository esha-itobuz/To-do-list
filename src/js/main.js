const inputBox = document.getElementById("input-box");
    const tagsInput = document.getElementById("tags-input");
    const currentTagsContainer = document.getElementById("current-tags");
    const addTagButton = document.getElementById("add-tag-button");
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
    let currentTags = [];
    const API_URL = "http://localhost:3000/todos";
    let USE_API = true; 
    let todosDatabase = []; 

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
        currentEditingTask = { li, taskSpan, checkbox };
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