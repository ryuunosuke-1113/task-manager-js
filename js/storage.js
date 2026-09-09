const STORAGE_KEY = "tasks";

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    const tasks = JSON.parse(savedTasks);

    if (!Array.isArray(tasks)) {
      return [];
    }

    return tasks;
  } catch (error) {
    console.error("タスクの読み込みに失敗しました。", error);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
