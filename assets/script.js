// Переменные для хранения данных
//let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
//let notes = JSON.parse(localStorage.getItem('notes')) || [];
//let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
//let homeworkList = JSON.parse(localStorage.getItem('homeworkList')) || [];
//let fileUploads = JSON.parse(localStorage.getItem('fileUploads')) || [];
// Firebase конфигурация

const firebaseConfig = {
    apiKey: "AIzaSyAdIR_sPi6D6EF01NzboTIOSuZ9AM_A9h0",
    authDomain: "reygarz.firebaseapp.com",
    projectId: "reygarz",
    storageBucket: "reygarz.appspot.com",
    messagingSenderId: "748097112573",
    appId: "1:748097112573:web:2d8b3068dcb31b4dc47194"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Функция для регистрации и входа
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const userRef = db.collection("users").doc(username);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            if (data.password === password) {
                sessionStorage.setItem("username", username);
                window.location.href = "home.html";
            } else {
                alert("Неверный пароль");
            }
        } else {
            await userRef.set({ password });
            sessionStorage.setItem("username", username);
            window.location.href = "home.html";
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        alert("Ошибка при входе.");
    }
});

// Функция для гостевого входа
function guestLogin() {
    sessionStorage.setItem("username", "guest");
    window.location.href = "home.html";
}

// Функция для выхода
function logout() {
    sessionStorage.removeItem("username");
    window.location.href = "login.html";
}

// Показ имени пользователя на главной странице
document.addEventListener("DOMContentLoaded", () => {
    const username = sessionStorage.getItem("username");
    if (username) {
        document.getElementById("user-name").textContent = username === "guest" ? "Гость" : username;
    } else {
        window.location.href = "login.html";
    }
});
// --- Расписание: Загрузка и парсинг файла .ics ---
function loadICSFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const events = comp.getAllSubcomponents("vevent");

            schedule = events.map(event => {
                const summary = event.getFirstPropertyValue("summary");
                const startDate = event.getFirstPropertyValue("dtstart").toJSDate();
                const day = startDate.toLocaleDateString('ru-RU', { weekday: 'long' });
                const date = startDate.toISOString().split('T')[0];

                return {
                    date: date,
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    subject: summary,
                    type: 'Лекция', // Можно изменить тип, если будет известно
                    attended: false
                };
            });

            localStorage.setItem('schedule', JSON.stringify(schedule));
            renderSchedule();
            renderAttendanceReport();
        };
        reader.readAsText(file);
    }
}

// --- Расписание: Отображение и посещаемость ---
function renderSchedule() {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = schedule.map((item, index) => `
        <div class="lesson-item">
            <div>
                <strong>${item.date} (${item.day})</strong>: ${item.subject} — ${item.type}
            </div>
            <div>
                <button class="status-btn ${item.attended ? 'status-attended' : 'status-missed'}" onclick="toggleAttendance(${index})">
                    ${item.attended ? 'Посетил' : 'Не посетил'}
                </button>
            </div>
        </div>
    `).join('');
}

function toggleAttendance(index) {
    schedule[index].attended = !schedule[index].attended;
    localStorage.setItem('schedule', JSON.stringify(schedule));
    renderSchedule();
    renderAttendanceReport();
}

// --- Отчет о посещаемости ---
function renderAttendanceReport() {
    const reportDiv = document.getElementById('attendanceReport');
    const subjects = schedule.reduce((acc, item) => {
        if (!acc[item.subject]) {
            acc[item.subject] = { attended: 0, missed: 0 };
        }
        acc[item.subject][item.attended ? 'attended' : 'missed']++;
        return acc;
    }, {});

    reportDiv.innerHTML = Object.entries(subjects).map(([subject, stats]) => `
        <div class="report-item">
            <span>${subject}</span>
            <span>Посещено: ${stats.attended}</span>
            <span>Пропущено: ${stats.missed}</span>
        </div>
    `).join('');
}

// --- Заметки: Сохранение, отображение и удаление ---
function saveNote() {
    const noteInput = document.getElementById('noteInput').value;
    const dateAdded = new Date().toLocaleDateString('ru-RU');
    notes.push({ content: noteInput, date: dateAdded });
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

function displayNotes() {
    const savedNotesDiv = document.getElementById('savedNotes');
    savedNotesDiv.innerHTML = notes.map((note, index) => `
        <div class="note-item">
            <p>${note.content} <small>(${note.date})</small></p>
            <button class="delete-btn" onclick="deleteNote(${index})">Удалить</button>
        </div>
    `).join('');
}

function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}
// --- Дедлайны: Добавление, отображение и удаление ---
function addDeadline() {
    const task = document.getElementById('taskInput').value;
    const date = document.getElementById('dateInput').value;
    deadlines.push({ task, date });
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
    displayDeadlines();
}

function displayDeadlines() {
    const deadlinesDiv = document.getElementById('deadlines');
    deadlinesDiv.innerHTML = deadlines.map((deadline, index) => `
        <div class="deadline-item">
            <p>${deadline.task} — до ${deadline.date}</p>
            <button class="delete-btn" onclick="deleteDeadline(${index})">Удалить</button>
        </div>
    `).join('');
}

function deleteDeadline(index) {
    deadlines.splice(index, 1);
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
    displayDeadlines();
}

// --- Домашние задания: Добавление и отображение ---
function addHomework(subject, date, description) {
    homeworkList.push({ subject, date, description });
    localStorage.setItem('homeworkList', JSON.stringify(homeworkList));
    displayHomework();
}

function displayHomework() {
    const homeworkDiv = document.getElementById('homeworkList');
    homeworkDiv.innerHTML = homeworkList.map(hw => `
        <div class="homework-item">
            <p><strong>Дата:</strong> ${hw.date}</p>
            <p><strong>Предмет:</strong> ${hw.subject}</p>
            <p><strong>Задание:</strong> ${hw.description}</p>
        </div>
    `).join('');
}

// --- Файлы: Загрузка и отображение ---
function uploadFile(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        fileUploads.push({ name: file.name, url });
        localStorage.setItem('fileUploads', JSON.stringify(fileUploads));
        displayFiles();
    }
}

function displayFiles() {
    const fileListDiv = document.getElementById('fileList');
    fileListDiv.innerHTML = fileUploads.map(file => `
        <div class="file-item">
            <p><a href="${file.url}" target="_blank">${file.name}</a></p>
            <button class="delete-btn" onclick="deleteFile('${file.url}')">Удалить</button>
        </div>
    `).join('');
}

function deleteFile(url) {
    fileUploads = fileUploads.filter(file => file.url !== url);
    localStorage.setItem('fileUploads', JSON.stringify(fileUploads));
    displayFiles();
}

// --- Инициализация данных на страницах ---
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById('schedule')) {
        renderSchedule();
        renderAttendanceReport();
    }
    if (document.getElementById('savedNotes')) displayNotes();
    if (document.getElementById('deadlines')) displayDeadlines();
    if (document.getElementById('homeworkList')) displayHomework();
    if (document.getElementById('fileList')) displayFiles();
});

