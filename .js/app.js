//------------------------------------------------------
//    VARIABLES DOM
//------------------------------------------------------
const jours = document.querySelector(".jours");
const dates = document.querySelector(".date");
const icons = document.querySelectorAll(".icons span");

const ticketList = document.getElementById("ticketList");
const selectedDateTxt = document.getElementById("selectedDate");

const ticketModal = document.getElementById("ticketModal");
const addTicketBtn = document.getElementById("add-Ticket-Btn");
const saveTicketBtn = document.getElementById("saveTicket");
const closeModalBtn = document.getElementById("closeModal");

const ticketTitle = document.getElementById("ticketTitle");
const ticketDate = document.getElementById("ticketDate");

const formNote = document.getElementById("formNote");
const addTaskButton = document.getElementById("add-note-button");
const saveTaskbutton = document.getElementById("savenote");
const closenote = document.getElementById("closenote");

const taskTitle = document.getElementById("noteTitle");

const toggle = document.getElementById("themeToggle");

//------------------------------------------------------
//    DONNÉES
//------------------------------------------------------
let date = new Date();
let currYear = date.getFullYear();
let currMonth = date.getMonth();

const mois = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
];

//------------------------------------------------------
//   LOCAL STORAGE
//------------------------------------------------------
function loadTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}
function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

//------------------------------------------------------
//   UTILITAIRE COULEUR
//------------------------------------------------------
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function interpolateColor(from, to, t) {
  let c1 = hexToRgb(from);
  let c2 = hexToRgb(to);
  let r = Math.round(c1.r + (c2.r - c1.r) * t);
  let g = Math.round(c1.g + (c2.g - c1.g) * t);
  let b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function tempToColor(temp) {
  if (temp <= 10) return interpolateColor("#00aaff", "#0044aa", temp / 10);

  if (temp <= 20)
    return interpolateColor("#ff8800", "#ff0000", (temp - 10) / 10);

  return "#ff0000";
}

//------------------------------------------------------
//   AFFICHAGE CALENDRIER
//------------------------------------------------------
function renderCalendar() {
  let firstDay = new Date(currYear, currMonth, 1).getDay();
  let lastDate = new Date(currYear, currMonth + 1, 0).getDate();
  let lastDay = new Date(currYear, currMonth, lastDate).getDay();
  let prevLastDate = new Date(currYear, currMonth, 0).getDate();

  const tickets = loadTickets();
  let liTag = "";

  for (let i = firstDay; i > 0; i--)
    liTag += `<li class="inactive">${prevLastDate - i + 1}</li>`;

  for (let i = 1; i <= lastDate; i++) {
    const fullDate = `${currYear}-${String(currMonth + 1).padStart(
      2,
      "0"
    )}-${String(i).padStart(2, "0")}`;
    const dayTickets = tickets.filter((t) => t.date === fullDate);

    let colorClass = "";
    if (dayTickets.length > 0) {
      const diff = (new Date(fullDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (diff <= 3) colorClass = "rouge";
      else if (diff <= 5) colorClass = "orange";
      else colorClass = "vert";
    }

    let todayClass = "";
    if (
      i === date.getDate() &&
      currMonth === new Date().getMonth() &&
      currYear === new Date().getFullYear()
    ) {
      todayClass = "active";
    }

    liTag += `<li class="${todayClass} ${colorClass}" data-date="${fullDate}">${i}</li>`;
  }

  for (let i = lastDay; i < 6; i++)
    liTag += `<li class="inactive">${i - lastDay + 1}</li>`;

  // Injection HTML
  dates.innerText = `${mois[currMonth]} ${currYear}`;
  jours.innerHTML = liTag;

  jours.querySelectorAll("li").forEach((li) => {
    if (!li.classList.contains("inactive"))
      li.onclick = () => showTickets(li.dataset.date);
  });
}

//------------------------------------------------------
//   AFFICHAGE DES TICKETS
//------------------------------------------------------
function showTickets(dateStr) {
  selectedDateTxt.textContent = dateStr;
  ticketList.innerHTML = "";
  const tickets = loadTickets().filter((t) => t.date === dateStr);

  if (tickets.length === 0) {
    ticketList.innerHTML = "<li>Aucun évènement</li>";
    return;
  }

  tickets.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `• ${t.title} 
      <button class="editBtn" data-id="${t.id}">✏️</button> 
      <button class="deleteBtn" data-id="${t.id}">🗑️</button>`;
    ticketList.appendChild(li);
  });

  ticketList
    .querySelectorAll(".deleteBtn")
    .forEach((btn) => (btn.onclick = () => deleteTicket(btn.dataset.id)));

  ticketList
    .querySelectorAll(".editBtn")
    .forEach((btn) => (btn.onclick = () => editTicket(btn.dataset.id)));
}

//------------------------------------------------------
//   CRUD TICKETS
//------------------------------------------------------
function deleteTicket(id) {
  let tickets = loadTickets().filter((t) => String(t.id) !== String(id));
  saveTickets(tickets);
  renderCalendar();
  showTickets(selectedDateTxt.textContent);
}

let editMode = false;
let editId = null;

function editTicket(id) {
  const tickets = loadTickets();
  const ticket = tickets.find((t) => String(t.id) === String(id));
  if (!ticket) return;

  editMode = true;
  editId = id;
  ticketTitle.value = ticket.title;
  ticketDate.value = ticket.date;
  ticketModal.style.display = "flex";
}

addTicketBtn.onclick = () => {
  editMode = false;
  editId = null;
  ticketTitle.value = "";
  ticketDate.value = selectedDateTxt.textContent;
  ticketModal.style.display = "flex";
};

saveTicketBtn.onclick = () => {
  const title = ticketTitle.value;
  const dateStr = ticketDate.value;

  if (!title || !dateStr) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const tickets = loadTickets();

  if (editMode) {
    const idx = tickets.findIndex((t) => String(t.id) === String(editId));
    tickets[idx].title = title;
    tickets[idx].date = dateStr;
  } else {
    tickets.push({ id: Date.now().toString(), title, date: dateStr });
  }

  saveTickets(tickets);
  ticketModal.style.display = "none";
  renderCalendar();
  showTickets(dateStr);
};

closeModalBtn.onclick = () => (ticketModal.style.display = "none");

//------------------------------------------------------
//   LOCAL STORAGE TASKS
//------------------------------------------------------
function loadTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//------------------------------------------------------
//   AFFICHAGE DES TÂCHES
//------------------------------------------------------
function renderTasks() {
  const taskList = document.querySelector(".taches");
  taskList.innerHTML = "";

  const tasks = loadTasks();

  if (tasks.length === 0) {
    taskList.innerHTML = "<li>Aucune tâche</li>";
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";
    li.style.marginBottom = "8px";

    li.innerHTML = `
      <label style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" ${task.done ? "checked" : ""}>
        <span style="
          text-decoration:${task.done ? "line-through" : "none"};
          opacity:${task.done ? "0.6" : "1"};
        ">
          ${task.title}
        </span>
      </label>
      <div>
        <button class="editTask">✏️</button>
        <button class="deleteTask">🗑️</button>
      </div>
    `;

    li.querySelector("input").onchange = () => {
      task.done = !task.done;
      saveTasks(tasks);
      renderTasks();
    };

    li.querySelector(".editTask").onclick = () => {
      taskTitle.value = task.title;
      formNote.style.display = "flex";
      saveTaskbutton.onclick = () => {
        task.title = taskTitle.value;
        saveTasks(tasks);
        formNote.style.display = "none";
        renderTasks();
      };
    };

    li.querySelector(".deleteTask").onclick = () => {
      const updated = tasks.filter((t) => t.id !== task.id);
      saveTasks(updated);
      renderTasks();
    };

    taskList.appendChild(li);
  });
}

//------------------------------------------------------
//   AJOUT D'UNE TÂCHE
//------------------------------------------------------
addTaskButton.onclick = () => {
  taskTitle.value = "";
  formNote.style.display = "flex";

  saveTaskbutton.onclick = () => {
    if (!taskTitle.value.trim()) return;

    const tasks = loadTasks();
    tasks.push({
      id: Date.now(),
      title: taskTitle.value,
      done: false,
    });

    saveTasks(tasks);
    formNote.style.display = "none";
    renderTasks();
  };
};

closenote.onclick = () => {
  formNote.style.display = "none";
};

//------------------------------------------------------
//   INITIALISATION
//------------------------------------------------------
renderTasks();

//------------------------------------------------------
//   NAVIGATION MOIS
//------------------------------------------------------
icons.forEach((icon) => {
  icon.onclick = () => {
    currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

    if (currMonth < 0) {
      currMonth = 11;
      currYear--;
    }
    if (currMonth > 11) {
      currMonth = 0;
      currYear++;
    }

    renderCalendar();
  };
});

//------------------------------------------------------
//   MODE SOMBRE
//------------------------------------------------------
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
renderCalendar();
showTickets(new Date().toISOString().slice(0, 10));
