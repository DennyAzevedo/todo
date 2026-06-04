(() => {
  "use strict";

  const STORAGE_KEY = "todo-app.tasks";
  const THEME_KEY = "todo-app.theme";

  /** @type {{ id: string, text: string, description: string, priority: string, completed: boolean }[]} */
  let tasks = [];
  let currentFilter = "all";
  let priorityFilter = "all";
  let searchQuery = "";

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
  const priorityFilterSelect = document.getElementById("priority-filter");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
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

  const confirmOverlay = document.getElementById("confirm-overlay");
  const confirmDialog = confirmOverlay.querySelector(".modal--confirm");
  const confirmText = document.getElementById("confirm-text");
  const confirmOk = document.getElementById("confirm-ok");
  const confirmCancel = document.getElementById("confirm-cancel");

  let activeTaskId = null;
  let lastFocusedEl = null;
  let confirmOpen = false;
  let confirmResolver = null;
  let confirmLastFocus = null;

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
    const query = searchQuery.trim().toLowerCase();
    const result = tasks.filter((t) => {
      if (currentFilter === "active" && t.completed) return false;
      if (currentFilter === "completed" && !t.completed) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      if (query && !t.text.toLowerCase().includes(query)) return false;
      return true;
    });

    return result.sort((a, b) => {
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
    const isFiltering =
      currentFilter !== "all" ||
      priorityFilter !== "all" ||
      searchQuery.trim() !== "";
    emptyState.hidden = hasVisible;

    if (hasTasks && !hasVisible && isFiltering) {
      emptyState.querySelector(".empty-state__title").textContent =
        "Nada encontrado";
      emptyState.querySelector(".empty-state__text").textContent =
        "Tente ajustar a busca ou os filtros.";
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
    del.addEventListener("click", () => requestDelete(task.id));

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

  /* ===== Modal de detalhes ===== */
  function showViewMode() {
    modalView.hidden = false;
    modalEditForm.hidden = true;
  }

  function renderModal() {
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task) {
      closeModal();
      return;
    }

    modalBadge.textContent = PRIORITIES[task.priority].label;
    modalBadge.className =
      "priority-badge priority-badge--" + task.priority;

    modalTitle.textContent = task.text;
    modalTitle.classList.toggle("is-completed", task.completed);

    modalStatus.textContent = task.completed ? "Concluída" : "Ativa";
    modalStatus.className =
      "status-pill " + (task.completed ? "status-pill--done" : "status-pill--active");

    modalPriority.textContent = PRIORITIES[task.priority].label;

    if (task.description) {
      modalDesc.textContent = task.description;
      modalDesc.classList.remove("is-empty");
    } else {
      modalDesc.textContent = "Sem descrição.";
      modalDesc.classList.add("is-empty");
    }

    modalToggle.textContent = task.completed
      ? "Marcar como ativa"
      : "Marcar como concluída";
  }

  function openModal(id) {
    activeTaskId = id;
    lastFocusedEl = document.activeElement;
    showViewMode();
    renderModal();
    modalOverlay.hidden = false;
    document.body.classList.add("modal-open");
    modalClose.focus();
    document.addEventListener("keydown", onModalKeydown);
  }

  function closeModal() {
    modalOverlay.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onModalKeydown);
    activeTaskId = null;
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  function enterModalEdit() {
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task) return;
    modalEditTitle.value = task.text;
    modalEditDesc.value = task.description;
    modalEditPriority.value = task.priority;
    modalView.hidden = true;
    modalEditForm.hidden = false;
    modalEditTitle.focus();
  }

  function onModalKeydown(e) {
    if (confirmOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (!modalEditForm.hidden) {
        showViewMode();
        renderModal();
        modalEditBtn.focus();
      } else {
        closeModal();
      }
      return;
    }
    if (e.key === "Tab") {
      const container = modalEditForm.hidden ? modalView : modalEditForm;
      trapFocus(e, [modalClose, ...getFocusable(container)]);
    }
  }

  function getFocusable(container) {
    return [
      ...container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function trapFocus(e, focusable) {
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ===== Confirmação de exclusão ===== */
  function askConfirm(message) {
    return new Promise((resolve) => {
      confirmResolver = resolve;
      confirmOpen = true;
      confirmText.textContent = message;
      confirmLastFocus = document.activeElement;
      confirmOverlay.hidden = false;
      document.body.classList.add("modal-open");
      confirmOk.focus();
      document.addEventListener("keydown", onConfirmKeydown);
    });
  }

  function closeConfirm(result) {
    confirmOverlay.hidden = true;
    document.removeEventListener("keydown", onConfirmKeydown);
    confirmOpen = false;
    if (modalOverlay.hidden) {
      document.body.classList.remove("modal-open");
    }
    const resolve = confirmResolver;
    confirmResolver = null;
    if (confirmLastFocus && typeof confirmLastFocus.focus === "function") {
      confirmLastFocus.focus();
    }
    if (resolve) resolve(result);
  }

  function onConfirmKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeConfirm(false);
    } else if (e.key === "Tab") {
      trapFocus(e, getFocusable(confirmDialog));
    }
  }

  async function requestDelete(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return false;
    const confirmed = await askConfirm(
      `A tarefa "${task.text}" será removida permanentemente.`
    );
    if (confirmed) deleteTask(id);
    return confirmed;
  }

  confirmOk.addEventListener("click", () => closeConfirm(true));
  confirmCancel.addEventListener("click", () => closeConfirm(false));
  confirmOverlay.addEventListener("click", (e) => {
    if (e.target === confirmOverlay) closeConfirm(false);
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalEditBtn.addEventListener("click", enterModalEdit);
  modalCancel.addEventListener("click", () => {
    showViewMode();
    renderModal();
    modalEditBtn.focus();
  });
  modalToggle.addEventListener("click", () => {
    if (activeTaskId) {
      toggleTask(activeTaskId);
      renderModal();
    }
  });
  modalDeleteBtn.addEventListener("click", async () => {
    if (!activeTaskId) return;
    const confirmed = await requestDelete(activeTaskId);
    if (confirmed) closeModal();
  });
  modalEditForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!activeTaskId) return;
    editTask(activeTaskId, {
      text: modalEditTitle.value,
      description: modalEditDesc.value,
      priority: modalEditPriority.value,
    });
    if (tasks.some((t) => t.id === activeTaskId)) {
      showViewMode();
      renderModal();
      modalEditBtn.focus();
    } else {
      closeModal();
    }
  });

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

  priorityFilterSelect.addEventListener("change", () => {
    priorityFilter = priorityFilterSelect.value;
    render();
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    searchClear.hidden = searchQuery === "";
    render();
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    searchClear.hidden = true;
    searchInput.focus();
    render();
  });

  clearBtn.addEventListener("click", async () => {
    const count = tasks.filter((t) => t.completed).length;
    if (count === 0) return;
    const confirmed = await askConfirm(
      `${count} tarefa${count === 1 ? "" : "s"} concluída${
        count === 1 ? "" : "s"
      } ${count === 1 ? "será removida" : "serão removidas"}.`
    );
    if (confirmed) clearCompleted();
  });
  themeToggle.addEventListener("click", toggleTheme);

  /* ===== Inicialização ===== */
  initTheme();
  setDateLabel();
  loadTasks();
  render();
})();
