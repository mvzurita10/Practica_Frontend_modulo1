$(document).ready(() => {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || []

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)
  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    updateStats()
  }

  const createTaskElement = (task) => {
    const $taskItem = $("<li>")
      .addClass(`task-card ${task.completed ? "completed" : ""}`)
      .attr("data-id", task.id)
      .html(`
        <div class="task-body">
          <div class="task-top">
          <p class="task-text">${task.text}</p>
        </div>
        <div class="task-controls">
          <button class="mark-done" title="Marcar como ${task.completed ? "pendiente" : "completada"}">
            <i class="fas ${task.completed ? "fa-undo" : "fa-check"}"></i>
          </button>
          <button class="delete-task" title="Eliminar tarea">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `)
    return $taskItem
  }

  const renderTasks = () => {
    const $activeList = $("#taskList").empty()
    const $doneList = $("#completedTaskList").empty()
    const filterStatus = $("#filterStatus").val()

    const filtered = tasks.filter(task => {
      const statusOK = filterStatus === "all" ||
        (filterStatus === "active" && !task.completed) ||
        (filterStatus === "completed" && task.completed)
      return statusOK // se eliminó el filtro de prioridad
    })

    if (filtered.length === 0) {
      const $empty = $('<div class="empty-state">').html(`
        <i class="fas fa-tasks"></i>
        <p>No hay tareas</p>
      `)
      if (filterStatus !== "completed") $activeList.append($empty.clone())
      if (filterStatus !== "active") $doneList.append($empty.clone())
    } else {
      filtered.forEach(task => {
        const $task = createTaskElement(task)
        task.completed ? $doneList.append($task) : $activeList.append($task)
      })
    }

    $activeList.sortable({
      items: ".task-card",
      handle: ".task-body",
      connectWith: "#completedTaskList",
      update: updateTaskOrder,
    })

    $doneList.sortable({
      items: ".task-card",
      handle: ".task-body",
      connectWith: "#taskList",
      update: updateTaskOrder,
    })
  }

  const updateTaskOrder = () => {
    const newList = []

    $("#taskList .task-card").each(function () {
      const id = $(this).data("id")
      const task = tasks.find(t => t.id === id)
      if (task) {
        task.completed = false
        newList.push(task)
      }
    })

    $("#completedTaskList .task-card").each(function () {
      const id = $(this).data("id")
      const task = tasks.find(t => t.id === id)
      if (task) {
        task.completed = true
        newList.push(task)
      }
    })

    tasks = newList
    saveTasks()
  }

  const updateStats = () => {
    const total = tasks.length
    const done = tasks.filter(t => t.completed).length
    const active = total - done

    $("#totalTasks").text(`Total: ${total}`)
    $("#completedTasks").text(`Completadas: ${done}`)
    $("#activeTasks").text(`Activas: ${active}`)
  }

  $("#addTask").on("click", () => {
    const text = $("#taskInput").val().trim()
    if (text) {
      const newTask = {
        id: generateId(),
        text,
        completed: false,
        priority: "normal",
        createdAt: Date.now(),
      }

      tasks.push(newTask)
      saveTasks()
      renderTasks()
      $("#taskInput").val("").focus()

      const $new = $(`.task-card[data-id="${newTask.id}"]`)
      $new.hide().slideDown(300)
    }
  })

  $("#taskInput").on("keypress", (e) => {
    if (e.which === 13) $("#addTask").click()
  })

  $("#taskInput").on("focus", function () {
    $(this).parent().addClass("focused")
  }).on("blur", function () {
    $(this).parent().removeClass("focused")
  })

  $(document).on("click", ".mark-done", function () {
    const $task = $(this).closest(".task-card")
    const id = $task.data("id")
    const task = tasks.find(t => t.id === id)

    if (task) {
      task.completed = !task.completed
      $task.addClass("complete-fx")
      setTimeout(() => {
        saveTasks()
        renderTasks()
      }, 600)
    }
  })

  $(document).on("click", ".delete-task", function () {
    const $task = $(this).closest(".task-card")
    const id = $task.data("id")

    $task.slideUp(250, () => {
      tasks = tasks.filter(t => t.id !== id)
      saveTasks()
      renderTasks()
    })
  })

  $("#filterStatus, #filterPriority").on("change", renderTasks)
  renderTasks()
})
