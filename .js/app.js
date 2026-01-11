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

  // Jours du mois précédent
  for (let i = firstDay; i > 0; i--)
    liTag += `<li class="inactive">${prevLastDate - i + 1}</li>`;

  // --- jours du mois courant
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

  // Jours du prochain mois
  for (let i = lastDay; i < 6; i++)
    liTag += `<li class="inactive">${i - lastDay + 1}</li>`;

  // Injection HTML
  dates.innerText = `${mois[currMonth]} ${currYear}`;
  jours.innerHTML = liTag;

  // On ajoute l’event pour chaque jour
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
    ticketList.innerHTML = "<li>Aucun ticket</li>";
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

//------------------------------------------------------
//   API METEO → PARIS
//------------------------------------------------------
//fetch("https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&daily=weathercode,temperature_2m_max&timezone=Europe%2FParis")
//.then(res => res.json())
//.then(data => {
//meteoDaily = data.daily;
//renderCalendar(); // On affiche seulement APRES avoir la météo
//showTickets(new Date().toISOString().slice(0,10));
//});
// --- Initialisation SANS météo ---
renderCalendar();
showTickets(new Date().toISOString().slice(0, 10));
