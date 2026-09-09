const editTaskForm = document.getElementById("edit-task-form");

const editTitle = document.getElementById("edit-title");

const editDescription = document.getElementById("edit-description");

const editDueDate = document.getElementById("edit-due-date");

const editLength = document.getElementById("edit-length");

const editError = document.getElementById("edit-error");

let tasks = loadTasks();

function getTaskIdFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return params.get("id");
}

function showError(message) {
  editError.hidden = false;
  editError.textContent = message;

  editTaskForm.hidden = true;
}

function loadTaskIntoForm() {
  const taskId = getTaskIdFromUrl();

  if (!taskId) {
    showError("編集するタスクが指定されていません。");

    return null;
  }

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    showError("編集するタスクが見つかりませんでした。");

    return null;
  }

  editTitle.value = task.title;

  editDescription.value = task.description ?? "";

  editDueDate.value = task.dueDate;

  editLength.value = String(task.length);

  return task;
}

const editingTask = loadTaskIntoForm();

editTaskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!editingTask) {
    return;
  }

  const title = editTitle.value.trim();

  if (!title) {
    return;
  }

  editingTask.title = title;

  editingTask.description = editDescription.value.trim();

  editingTask.dueDate = editDueDate.value;

  editingTask.length = Number(editLength.value);

  saveTasks(tasks);

  window.location.href = "index.html";
});
