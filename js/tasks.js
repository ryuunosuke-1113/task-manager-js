const toggleTaskFormButton = document.getElementById("toggle-task-form");

const closeTaskFormButton = document.getElementById("close-task-form");

const taskFormSection = document.getElementById("task-form-section");

const taskForm = document.getElementById("task-form");

const overdueTaskList = document.getElementById("overdue-task-list");

const activeTaskList = document.getElementById("active-task-list");

const completedTaskList = document.getElementById("completed-task-list");
const overdueCount = document.getElementById("overdue-count");

const activeCount = document.getElementById("active-count");

const completedCount = document.getElementById("completed-count");

let tasks = loadTasks();

function openTaskForm() {
  taskFormSection.hidden = false;

  toggleTaskFormButton.textContent = "－ タスク追加を閉じる";
}

function closeTaskForm() {
  taskFormSection.hidden = true;

  toggleTaskFormButton.textContent = "＋ タスク追加";
}

function createTask(taskData) {
  return {
    id: crypto.randomUUID(),

    title: taskData.title,
    description: taskData.description,
    dueDate: taskData.dueDate,
    length: Number(taskData.length),

    completedAt: null,

    createdAt: new Date().toISOString(),
  };
}

function getLengthLabel(length) {
  switch (Number(length)) {
    case 1:
      return "短い";

    case 2:
      return "普通";

    case 3:
      return "長時間";

    default:
      return "不明";
  }
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}
function getTodayStart() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function getDueDateStart(dueDate) {
  return new Date(`${dueDate}T00:00:00`);
}

function getDaysUntilDue(dueDate) {
  const today = getTodayStart();

  const due = getDueDateStart(dueDate);

  const diffMilliseconds = due.getTime() - today.getTime();

  const diffDays = Math.round(diffMilliseconds / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

function isOverdue(task) {
  const today = getTodayStart();

  const due = getDueDateStart(task.dueDate);

  return due < today;
}

function getPriorityScore(task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  return daysUntilDue / Number(task.length);
}

function createTaskCard(task) {
  const card = document.createElement("article");

  card.classList.add("task-card");

  if (isOverdue(task) && !task.completedAt) {
    card.classList.add("overdue");
  }

  card.innerHTML = `
        <h3 class="task-title"></h3>

        ${task.description ? '<p class="task-description"></p>' : ""}

        <div class="task-info">
            <p>
                期限：
                <span class="task-due-date"></span>
            </p>

            <p>
                長さ：
                <span class="task-length"></span>
            </p>

            ${
              !task.completedAt && !isOverdue(task)
                ? `
                        <p>
                            優先度：
                            <span class="task-priority"></span>
                        </p>
                    `
                : ""
            }

            ${
              task.completedAt
                ? `
                        <p>
                            完了：
                            <span class="task-completed-at"></span>
                        </p>
                    `
                : ""
            }
        </div>

        <div class="task-actions"></div>
    `;

  card.querySelector(".task-title").textContent = task.title;

  if (task.description) {
    card.querySelector(".task-description").textContent = task.description;
  }

  card.querySelector(".task-due-date").textContent = formatDate(task.dueDate);

  card.querySelector(".task-length").textContent = getLengthLabel(task.length);

  const priorityElement = card.querySelector(".task-priority");

  if (priorityElement) {
    priorityElement.textContent = getPriorityScore(task).toFixed(2);
  }

  const completedAtElement = card.querySelector(".task-completed-at");

  if (completedAtElement) {
    completedAtElement.textContent = formatDateTime(task.completedAt);
  }

  const actions = card.querySelector(".task-actions");

  if (!task.completedAt) {
    const completeButton = document.createElement("button");

    completeButton.type = "button";
    completeButton.className = "button button-complete";

    completeButton.textContent = "完了";

    completeButton.addEventListener("click", () => completeTask(task.id));

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "button button-edit";

    editButton.textContent = "編集";

    editButton.addEventListener("click", () => {
      window.location.href = `edit.html?id=${encodeURIComponent(task.id)}`;
    });

    actions.append(completeButton, editButton);
  } else {
    const restoreButton = document.createElement("button");

    restoreButton.type = "button";
    restoreButton.className = "button button-restore";

    restoreButton.textContent = "未完了に戻す";

    restoreButton.addEventListener("click", () => restoreTask(task.id));

    actions.appendChild(restoreButton);
  }

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.className = "button button-delete";

  deleteButton.textContent = "削除";

  deleteButton.addEventListener("click", () => deleteTask(task.id));

  actions.appendChild(deleteButton);

  return card;
}
function formatDateTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function completeTask(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return;
  }

  task.completedAt = new Date().toISOString();

  saveTasks(tasks);
  renderTasks();
}
function restoreTask(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return;
  }

  task.completedAt = null;

  saveTasks(tasks);
  renderTasks();
}
function deleteTask(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return;
  }

  const confirmed = window.confirm(`「${task.title}」を削除しますか？`);

  if (!confirmed) {
    return;
  }

  tasks = tasks.filter((task) => task.id !== taskId);

  saveTasks(tasks);
  renderTasks();
}
function sortCompletedTasks(tasks) {
  return [...tasks].sort((a, b) => {
    return new Date(b.completedAt) - new Date(a.completedAt);
  });
}
function renderTasks() {
  overdueTaskList.innerHTML = "";
  activeTaskList.innerHTML = "";
  completedTaskList.innerHTML = "";

  const incompleteTasks = tasks.filter((task) => !task.completedAt);

  const overdueTasks = sortOverdueTasks(
    incompleteTasks.filter((task) => isOverdue(task)),
  );

  const activeTasks = sortActiveTasks(
    incompleteTasks.filter((task) => !isOverdue(task)),
  );
  overdueCount.textContent = overdueTasks.length;

  activeCount.textContent = activeTasks.length;

  if (overdueTasks.length === 0) {
    overdueTaskList.innerHTML = "<p>期限切れのタスクはありません。</p>";
  } else {
    overdueTasks.forEach((task) => {
      const card = createTaskCard(task);

      overdueTaskList.appendChild(card);
    });
  }

  if (activeTasks.length === 0) {
    activeTaskList.innerHTML = "<p>タスクはありません。</p>";
  } else {
    activeTasks.forEach((task) => {
      const card = createTaskCard(task);

      activeTaskList.appendChild(card);
    });
  }

  const completedTasks = sortCompletedTasks(
    tasks.filter((task) => task.completedAt),
  );
  completedCount.textContent = completedTasks.length;

  if (completedTasks.length === 0) {
    completedTaskList.innerHTML = "<p>完了済みのタスクはありません。</p>";
  } else {
    completedTasks.forEach((task) => {
      const card = createTaskCard(task);

      card.classList.add("completed");

      completedTaskList.appendChild(card);
    });
  }
}
function sortActiveTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const scoreA = getPriorityScore(a);

    const scoreB = getPriorityScore(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }

    const dueA = getDueDateStart(a.dueDate);

    const dueB = getDueDateStart(b.dueDate);

    if (dueA.getTime() !== dueB.getTime()) {
      return dueA - dueB;
    }

    if (a.length !== b.length) {
      return b.length - a.length;
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}
function sortOverdueTasks(tasks) {
  return [...tasks].sort((a, b) => {
    return getDueDateStart(a.dueDate) - getDueDateStart(b.dueDate);
  });
}

toggleTaskFormButton.addEventListener("click", () => {
  if (taskFormSection.hidden) {
    openTaskForm();
  } else {
    closeTaskForm();
  }
});

closeTaskFormButton.addEventListener("click", closeTaskForm);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(taskForm);

  const taskData = {
    title: formData.get("title").trim(),

    description: formData.get("description").trim(),

    dueDate: formData.get("dueDate"),

    length: formData.get("length"),
  };

  if (!taskData.title) {
    return;
  }

  const newTask = createTask(taskData);

  tasks.push(newTask);

  saveTasks(tasks);

  renderTasks();

  taskForm.reset();

  document.getElementById("length").value = "2";

  closeTaskForm();
});

renderTasks();
