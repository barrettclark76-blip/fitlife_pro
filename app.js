const START = new Date("2026-03-16");
const TOTAL = 75;

// Calculate current day
function getDayNumber() {
    let today = new Date();
    // Normalize times so daylight savings doesn't throw off day calculations
    today.setHours(0,0,0,0);
    let startDate = new Date(START);
    startDate.setHours(0,0,0,0);
    
    let day = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(day, TOTAL));
}

const currentDay = getDayNumber();
document.getElementById("dayLabel").innerText = "Day " + currentDay;

// ----------------------------------------------------
// IndexedDB Setup (Replaces localStorage for large images)
// ----------------------------------------------------
let db;
const request = indexedDB.open("ChallengeDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    // Create a storage object holding data for each day
    db.createObjectStore("days", { keyPath: "day" });
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadData(); // Load data once the database is ready
};

// ----------------------------------------------------
// Core Functions
// ----------------------------------------------------
function loadData() {
    const tx = db.transaction("days", "readonly");
    const store = tx.objectStore("days");
    const req = store.getAll();

    req.onsuccess = () => {
        const allData = req.result || [];
        const dataMap = {};
        allData.forEach(d => dataMap[d.day] = d);

        // Populate today's checkboxes on initial load
        const todayData = dataMap[currentDay] || {};
        ['diet', 'water', 'exercise', 'word', 'photoCheck'].forEach(id => {
            document.getElementById(id).checked = !!todayData[id];
        });

        renderCalendar(dataMap);
        updateStats(dataMap);
    };
}

function saveTodayData(extraData = {}) {
    const tx = db.transaction("days", "readwrite");
    const store = tx.objectStore("days");

    store.get(currentDay).onsuccess = (e) => {
        let data = e.target.result || { day: currentDay };

        // Grab current checkbox values
        ['diet', 'water', 'exercise', 'word', 'photoCheck'].forEach(id => {
            data[id] = document.getElementById(id).checked;
        });

        // Merge any extra data (like photos)
        Object.assign(data, extraData);
        store.put(data);

        // Reload UI to reflect changes
        loadData();
    };
}

// ----------------------------------------------------
// Event Listeners
// ----------------------------------------------------
document.querySelectorAll(".checklist input[type=checkbox]").forEach(c => {
    c.addEventListener("change", () => saveTodayData());
});

document.getElementById("photoUpload").addEventListener("change", function() {
    let file = this.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function() {
        document.getElementById("photoCheck").checked = true;
        saveTodayData({ photo: reader.result, photoCheck: true });
    };
    reader.readAsDataURL(file);
});

// Modal closing
document.getElementById("modal").onclick = function() {
    this.style.display = "none";
};

// ----------------------------------------------------
// UI Updating
// ----------------------------------------------------
function renderCalendar(dataMap) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    for (let i = 1; i <= TOTAL; i++) {
        let d = dataMap[i] || {};
        let div = document.createElement("div");
        div.className = "day";

        let date = new Date(START);
        date.setDate(START.getDate() + i - 1);
        div.innerHTML = date.getDate();

        let complete = d.diet && d.water && d.exercise && d.word && d.photoCheck;
        if (complete) div.classList.add("complete");

        if (d.photo) {
            let img = document.createElement("img");
            img.src = d.photo;
            div.appendChild(img);

            div.onclick = () => {
                document.getElementById("modalImg").src = d.photo;
                document.getElementById("modal").style.display = "flex";
            };
        }

        calendar.appendChild(div);
    }
}

function updateStats(dataMap) {
    let completed = 0;
    let streak = 0;

    for (let i = 1; i <= TOTAL; i++) {
        let d = dataMap[i] || {};
        let done = !!(d.diet && d.water && d.exercise && d.word && d.photoCheck);

        if (done) completed++;

        // Streak calculation up to current day
        if (i <= currentDay) {
            if (done) {
                streak++;
            } else if (i < currentDay) {
                streak = 0; // If a past day wasn't finished, the streak breaks
            }
        }
    }

    document.getElementById("completedDays").innerText = completed;
    document.getElementById("streak").innerText = streak;

    // Update Progress Ring
    let percent = completed / TOTAL;
    let circumference = 314; 
    document.getElementById("ring").style.strokeDashoffset = circumference - (percent * circumference);
}
