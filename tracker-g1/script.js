// נבחרת הקריאה - כיתה ג'1 | JavaScript מותאם אישית

// ===== CONFIGURATION =====
// הכתובת המדויקת של הסקריפט עבור ג'1
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEJi8Y9QD_8XVqiip2cujEhV6Ue9GySSpekmr_-wYdP_MbgY0LJGfukencB7HDCji-Ag/exec';

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    setupFormHandler();
});

// ===== FORM HANDLING =====
function setupFormHandler() {
    const form = document.getElementById('readingForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">⏳ שולח...</span>';
        
        // Get form data
        const formData = {
            timestamp: new Date().toISOString(),
            studentName: document.getElementById('studentName').value,
            readingMaterial: document.getElementById('readingMaterial').value,
            feeling: document.querySelector('input[name="feeling"]:checked')?.value || 'נחמד',
            ahaMoment: document.getElementById('ahaMoment')?.value || '',
            date: new Date().toLocaleDateString('he-IL'),
            time: new Date().toLocaleTimeString('he-IL'),
            minutes: 10 // ערך קבוע כפי שמוגדר במערכת שלך
        };
        
        // Send to Google Sheets
        try {
            await sendToGoogleSheets(formData);
            showSuccessMessage();
            form.reset();
            updateLocalStats();
        } catch (error) {
            console.error('Error:', error);
            alert('אופס! משהו השתבש. נסה/י שוב או דווח/י למורה.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">🎯 שלח דיווח ותרום 10 דקות!</span>';
        }
    });
}

// ===== SEND DATA TO GOOGLE SHEETS =====
async function sendToGoogleSheets(data) {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    return response;
}

// ===== SUCCESS MESSAGE =====
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) successMessage.classList.add('show');
}

function closeSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) successMessage.classList.remove('show');
}

// ===== STATS MANAGEMENT =====
function loadStats() {
    const stats = getLocalStats();
    updateStatsDisplay(stats);
}

function getLocalStats() {
    const today = new Date().toDateString();
    const weekStart = getWeekStart();
    
    let stats = JSON.parse(localStorage.getItem('readingStats_g1') || '{}');
    
    if (!stats.weekStart || new Date(stats.weekStart) < weekStart) {
        stats = {
            weekStart: weekStart.toISOString(),
            weeklyMinutes: 0,
            todayReaders: 0,
            lastUpdate: today
        };
    }
    
    if (stats.lastUpdate !== today) {
        stats.todayReaders = 0;
        stats.lastUpdate = today;
    }
    
    return stats;
}

function updateLocalStats() {
    let stats = getLocalStats();
    stats.weeklyMinutes += 10;
    stats.todayReaders += 1;
    stats.lastUpdate = new Date().toDateString();
    localStorage.setItem('readingStats_g1', JSON.stringify(stats));
    updateStatsDisplay(stats);
}

function updateStatsDisplay(stats) {
    const minsElem = document.getElementById('totalMinutes');
    const readersElem = document.getElementById('todayReaders');
    const goalElem = document.getElementById('weeklyGoal');
    const progressElem = document.getElementById('progressBar');

    if (minsElem) minsElem.textContent = stats.weeklyMinutes || 0;
    if (readersElem) readersElem.textContent = stats.todayReaders || 0;
    
    if (goalElem && progressElem) {
        const weeklyGoal = parseInt(goalElem.textContent);
        const progress = Math.min((stats.weeklyMinutes / weeklyGoal) * 100, 100);
        progressElem.style.width = progress + '%';
        const textElem = document.getElementById('progressText');
        if (textElem) textElem.textContent = Math.round(progress) + '%';
    }
}

function getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}
