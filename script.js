(() => {
  "use strict";

  const STORAGE_KEY = "todo-app.tasks";
  const THEME_KEY = "todo-app.theme";

  /** @type {{ id: string, text: string, description: string, priority: string, completed: boolean }[]} */
  let tasks = [];
  let currentFilter = "all";

  const PRIORITIES = {
    high: { label: "Alta", order: 0 },
    medium: { label: "Moderada", order: 1 },
    low: { label: "Baixa", order: 2 },
  };

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const descInput = document.getElementById("todo-desc");
  const priorityInput = document.getElementById("todo-priority");
  const list = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const progress = document.getElementById("progress");
  const itemsLeft = document.getElementById("items-left");
  const clearBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter");
  const themeToggle = document.getElementById("theme-toggle");
  const dateLabel = document.getElementById("date-label");

  const modalOverlay = document.getElementById("modal-overlay");
  const modalView = document.getElementById("modal-view");
  const modalBadge = document.getElementById("modal-badge");
  const modalTitle = document.getElementById("modal-title");
  const modalStatus = document.getElementById("modal-status");
  const modalPriority = document.getElementById("modal-priority");
  const modalDesc = document.getElementById("modal-desc");
  const modalToggle = document.getElementById("modal-toggle");
  const modalEditBtn = document.getElementById("modal-edit");
  const modalDeleteBtn = document.getElementById("modal-delete");
  const modalClose = document.getElementById("modal-close");
  const modalEditForm = document.getElementById("modal-edit-form");
  const modalEditTitle = document.getElementById("modal-edit-title");
  const modalEditDesc = document.getElementById("modal-edit-desc");
  const modalEditPriority = document.getElementById("modal-edit-priority");
  const modalCancel = document.getElementById("modal-cancel");

  let activeTaskId = null;
  let lastFocusedEl = null;

  /* ===== Persistência ===== */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      tasks = parsed.map((t) => ({
        id: t.id,
        text: t.text,
        description: t.description || "",
        priority: PRIORITIES[t.priority] ? t.priority : "medium",
        completed: Boolean(t.completed),
      }));
    } catch {
      tasks = [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /* ===== Operações ===== */
  function addTask(text, description, priority) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: trimmed,
      description: description.trim(),
      priority: PRIORITIES[priority] ? priority : "medium",
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

  function editTask(id, { text, description, priority }) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const trimmed = text.trim();
    if (!trimmed) {
      tasks = tasks.filter((t) => t.id !== id);
    } else {
      task.text = trimmed;
      task.description = description.trim();
      task.priority = PRIORITIES[priority] ? priority : task.priority;
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
    let result = tasks;
    if (currentFilter === "active") result = tasks.filter((t) => !t.completed);
    else if (currentFilter === "completed")
      result = tasks.filter((t) => t.completed);

    return [...result].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return PRIORITIES[a.priority].order - PRIORITIES[b.priority].order;
    });
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
    li.className =
      "todo-item is-" +
      task.priority +
      (task.completed ? " is-completed" : "");
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

    const body = document.createElement("div");
    body.className = "todo-item__body";

    const header = document.createElement("div");
    header.className = "todo-item__header";

    const text = document.createElement("span");
    text.className = "todo-item__text";
    text.textContent = task.text;

    const badge = document.createElement("span");
    badge.className = "priority-badge priority-badge--" + task.priority;
    badge.textContent = PRIORITIES[task.priority].label;
    badge.title = "Prioridade " + PRIORITIES[task.priority].label.toLowerCase();

    header.append(text, badge);
    body.append(header);

    if (task.description) {
      const desc = document.createElement("p");
      desc.className = "todo-item__desc";
      desc.textContent = task.description;
      body.append(desc);
    }

    body.title = "Clique duas vezes para editar · clique no olho para ver detalhes";
    body.addEventListener("dblclick", () => startEditing(li, task));

    const actions = document.createElement("div");
    actions.className = "todo-item__actions";

    const view = document.createElement("button");
    view.type = "button";
    view.className = "todo-item__icon-btn";
    view.innerHTML = "&#128065;";
    view.setAttribute("aria-label", `Ver detalhes: ${task.text}`);
    view.addEventListener("click", () => openModal(task.id));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-item__icon-btn todo-item__delete";
    del.innerHTML = "&times;";
    del.setAttribute("aria-label", `Excluir tarefa: ${task.text}`);
    del.addEventListener("click", () => deleteTask(task.id));

    actions.append(view, del);
    li.append(label, body, actions);
    return li;
  }

  function startEditing(li, task) {
    if (li.classList.contains("is-editing")) return;
    li.classList.add("is-editing");

    const body = li.querySelector(".todo-item__body");

    const editor = document.createElement("div");
    editor.className = "todo-item__editor";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "todo-item__edit";
    titleInput.value = task.text;
    titleInput.maxLength = 120;
    titleInput.setAttribute("aria-label", "Título da tarefa");

    const descArea = document.createElement("textarea");
    descArea.className = "todo-item__edit todo-item__edit--desc";
    descArea.value = task.description;
    descArea.maxLength = 500;
    descArea.rows = 2;
    descArea.placeholder = "Descrição (opcional)";
    descArea.setAttribute("aria-label", "Descrição da tarefa");

    const prioritySelect = document.createElement("select");
    prioritySelect.className = "todo-item__edit todo-item__edit--priority";
    prioritySelect.setAttribute("aria-label", "Prioridade da tarefa");
    Object.entries(PRIORITIES).forEach(([value, { label }]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      if (value === task.priority) option.selected = true;
      prioritySelect.append(option);
    });

    const hint = document.createElement("span");
    hint.className = "todo-item__edit-hint";
    hint.textContent = "Enter salva · Esc cancela";

    editor.append(titleInput, descArea, prioritySelect, hint);
    body.replaceWith(editor);
    titleInput.focus();
    titleInput.setSelectionRange(
      titleInput.value.length,
      titleInput.value.length
    );

    let done = false;
    const commit = () => {
      if (done) return;
      done = true;
      editTask(task.id, {
        text: titleInput.value,
        description: descArea.value,
        priority: prioritySelect.value,
      });
    };

    editor.addEventListener("focusout", (e) => {
      if (!editor.contains(e.relatedTarget)) commit();
    });

    editor.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target !== descArea) {
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
    addTask(input.value, descInput.value, priorityInput.value);
    input.value = "";
    descInput.value = "";
    priorityInput.value = "medium";
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
