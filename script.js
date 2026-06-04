(() => {
  "use strict";

  const STORAGE_KEY = "todo-app.tasks";
  const THEME_KEY = "todo-app.theme";

  /** @type {{ id: string, text: string, completed: boolean }[]} */
  let tasks = [];
  let currentFilter = "all";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const progress = document.getElementById("progress");
  const itemsLeft = document.getElementById("items-left");
  const clearBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter");
  const themeToggle = document.getElementById("theme-toggle");
  const dateLabel = document.getElementById("date-label");

  /* ===== Persistência ===== */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch {
      tasks = [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /* ===== Operações ===== */
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: trimmed,
      completed: false,
    });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  function editTask(id, text) {
    const task = tasks.find((t) => t.id === id);
    const trimmed = text.trim();
    if (!task) return;
    if (trimmed) {
      task.text = trimmed;
    } else {
      tasks = tasks.filter((t) => t.id !== id);
    }
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  /* ===== Render ===== */
  function getVisibleTasks() {
    if (currentFilter === "active") return tasks.filter((t) => !t.completed);
    if (currentFilter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }

  function render() {
    const visible = getVisibleTasks();
    list.innerHTML = "";

    visible.forEach((task) => list.appendChild(createTaskElement(task)));

    const hasTasks = tasks.length > 0;
    const hasVisible = visible.length > 0;
    emptyState.hidden = hasVisible;

    if (hasTasks && !hasVisible) {
      emptyState.querySelector(".empty-state__title").textContent =
        "Nada para mostrar";
      emptyState.querySelector(".empty-state__text").textContent =
        "Nenhuma tarefa neste filtro.";
    } else {
      emptyState.querySelector(".empty-state__title").textContent =
        "Tudo limpo por aqui";
      emptyState.querySelector(".empty-state__text").textContent =
        "Adicione sua primeira tarefa para começar.";
    }

    const completed = tasks.filter((t) => t.completed).length;
    const remaining = tasks.length - completed;
    progress.textContent = `${completed} de ${tasks.length} concluída${
      tasks.length === 1 ? "" : "s"
    }`;
    itemsLeft.textContent = `${remaining} ${
      remaining === 1 ? "item restante" : "itens restantes"
    }`;
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "todo-item" + (task.completed ? " is-completed" : "");
    li.dataset.id = task.id;

    const label = document.createElement("label");
    label.className = "todo-item__check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      task.completed ? "Marcar como ativa" : "Marcar como concluída"
    );
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");

    label.append(checkbox, mark);

    const text = document.createElement("span");
    text.className = "todo-item__text";
    text.textContent = task.text;
    text.title = "Clique duas vezes para editar";
    text.addEventListener("dblclick", () => startEditing(li, task));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-item__delete";
    del.innerHTML = "&times;";
    del.setAttribute("aria-label", `Excluir tarefa: ${task.text}`);
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(label, text, del);
    return li;
  }

  function startEditing(li, task) {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-item__edit";
    editInput.value = task.text;
    editInput.maxLength = 120;

    const textEl = li.querySelector(".todo-item__text");
    li.replaceChild(editInput, textEl);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    let done = false;
    const commit = () => {
      if (done) return;
      done = true;
      editTask(task.id, editInput.value);
    };

    editInput.addEventListener("blur", commit);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        done = true;
        render();
      }
    });
  }

  /* ===== Tema ===== */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = themeToggle.querySelector(".theme-toggle__icon");
    icon.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
    );
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }

  /* ===== Data ===== */
  function setDateLabel() {
    const now = new Date();
    dateLabel.textContent = now.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  /* ===== Eventos ===== */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask(input.value);
    input.value = "";
    input.focus();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      render();
    });
  });

  clearBtn.addEventListener("click", clearCompleted);
  themeToggle.addEventListener("click", toggleTheme);

  /* ===== Inicialização ===== */
  initTheme();
  setDateLabel();
  loadTasks();
  render();
})();
