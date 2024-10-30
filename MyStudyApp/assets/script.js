// Пример данных для расписания
const schedule = [
    { lesson: "Математика", time: "09:00", attended: false, homework: "" },
    { lesson: "Физика", time: "11:00", attended: false, homework: "" },
    // добавьте другие занятия
];

// Функция отображения расписания
function renderSchedule() {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = schedule.map((item, index) => `
        <div class="lesson">
            <span>${item.time} - ${item.lesson}</span>
            <button onclick="toggleAttendance(${index})">
                ${item.attended ? "Посетил" : "Пропустил"}
            </button>
            <input type="text" placeholder="Домашнее задание"
            onchange="addHomework(${index}, this.value)" value="${item.homework}">
            </div>
        `).join('');
    }
    
    // Обработка посещаемости
    function toggleAttendance(index) {
        schedule[index].attended = !schedule[index].attended;
        localStorage.setItem('schedule', JSON.stringify(schedule));
        renderSchedule();
    }
    
    // Добавление домашнего задания
    function addHomework(index, homework) {
        schedule[index].homework = homework;
        localStorage.setItem('schedule', JSON.stringify(schedule));
    }
    
    // Загрузка данных из localStorage
    function loadSchedule() {
        const saved = localStorage.getItem('schedule');
        if (saved) {
            schedule.splice(0, schedule.length, ...JSON.parse(saved));
        }
    }
    
    loadSchedule();
    renderSchedule();
    // Сохранение заметки
function saveNote() {
    const noteInput = document.getElementById('noteInput').value;
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteInput);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

// Отображение сохраненных заметок
function displayNotes() {
    const savedNotesDiv = document.getElementById('savedNotes');
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    savedNotesDiv.innerHTML = notes.map(note => `<p>${note}</p>`).join('');
}

// Загрузка заметок при загрузке страницы
if (document.getElementById('savedNotes')) {
    displayNotes();
}
// Добавление дедлайна
function addDeadline() {
    const task = document.getElementById('taskInput').value;
    const date = document.getElementById('dateInput').value;
    let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
    deadlines.push({ task, date });
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
    displayDeadlines();
}

// Отображение дедлайнов
function displayDeadlines() {
    const deadlinesDiv = document.getElementById('deadlines');
    const deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
    deadlinesDiv.innerHTML = deadlines.map(item => `
        <p>${item.task} — до ${item.date}</p>
    `).join('');
}

// Загрузка дедлайнов при загрузке страницы
if (document.getElementById('deadlines')) {
    displayDeadlines();
}