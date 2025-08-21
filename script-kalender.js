const monthYear = document.getElementById("monthYear");
const calendarBody = document.getElementById("calendarBody");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const eventDateInput = document.getElementById("eventDate");
const eventTextInput = document.getElementById("eventText");
const addEventBtn = document.getElementById("addEvent");
const eventListEl = document.getElementById("eventList");

let events = JSON.parse(localStorage.getItem("events")) || [];
let currentDate = new Date();

// === Daftar Hari Libur Nasional 2025 ===
const holidays2025 = {
    "2025-01-01": "Tahun Baru Masehi",
    "2025-01-29": "Isra Mikraj",
    "2025-03-29": "Nyepi",
    "2025-04-18": "Wafat Isa Almasih",
    "2025-05-01": "Hari Buruh",
    "2025-05-12": "Idul Fitri 1446H",
    "2025-05-13": "Idul Fitri 1446H",
    "2025-05-29": "Kenaikan Isa Almasih",
    "2025-06-01": "Hari Lahir Pancasila",
    "2025-06-07": "Idul Adha 1446H",
    "2025-06-27": "Tahun Baru Islam 1447H",
    "2025-08-17": "Hari Kemerdekaan RI",
    "2025-12-25": "Natal"
};

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarBody.innerHTML = "";
    let row = document.createElement("tr");

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("td");
        cell.textContent = day;

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const todayStr = new Date().toISOString().split("T")[0];

        // Hari ini
        if (dateStr === todayStr) {
            cell.classList.add("today");
        }

        // Event indicator
        if (events.some(ev => ev.date === dateStr)) {
            cell.classList.add("has-event");
        }

        // Hari libur
        if (holidays2025[dateStr]) {
            cell.classList.add("holiday");
            cell.setAttribute("data-holiday", holidays2025[dateStr]);
        }

        cell.addEventListener("click", () => {
            eventDateInput.value = dateStr;
        });

        row.appendChild(cell);
        if ((firstDay + day - 1) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement("tr");
        }
    }
    calendarBody.appendChild(row);

    renderEventList();
}


function renderEventList() {
    eventListEl.innerHTML = "";
    if (!events.length) {
        eventListEl.innerHTML = "<li>Tidak ada kegiatan</li>";
        return;
    }
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    events.forEach((ev, index) => {
        const li = document.createElement("li");
        li.className = "event-item";

        // teks event
        const text = document.createElement("span");
        text.textContent = `${ev.date} - ${ev.text}`;

        // tombol menu (3 titik)
        const actions = document.createElement("div");
        actions.className = "actions";
        const menuBtn = document.createElement("button");
        menuBtn.className = "menu-btn";
        menuBtn.textContent = "⋮";

        const menu = document.createElement("div");
        menu.className = "menu";

        // tombol edit
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
            const newText = prompt("Edit catatan kegiatan:", ev.text);
            if (newText !== null && newText.trim() !== "") {
                events[index].text = newText.trim();
                saveEvents();
            }
            menu.style.display = "none";
        });

        // tombol delete
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => {
            if (confirm("Hapus kegiatan ini?")) {
                events.splice(index, 1);
                saveEvents();
            }
            menu.style.display = "none";
        });

        menu.appendChild(editBtn);
        menu.appendChild(delBtn);

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });

        // tutup menu kalau klik di luar
        document.addEventListener("click", () => {
            menu.style.display = "none";
        });

        actions.appendChild(menuBtn);
        actions.appendChild(menu);

        li.appendChild(text);
        li.appendChild(actions);
        eventListEl.appendChild(li);
    });
}


function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
    renderCalendar();
}

addEventBtn.addEventListener("click", () => {
    const date = eventDateInput.value;
    const text = eventTextInput.value.trim();
    if (!date || !text) return;
    events.push({ date, text });
    eventDateInput.value = "";
    eventTextInput.value = "";
    saveEvents();
});

prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();