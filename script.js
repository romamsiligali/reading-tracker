// נבחרת הקריאה - כיתה ה' | JavaScript

// ===== CONFIGURATION =====
// Replace this URL with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWKOqo3EyYeNJEd4v_74xy-SZSf6gxBshpXn9NTza7fMkC5SUL71Vm4iKlpXONhos4gg/exec';

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    setupFormHandler();
});

// ===== FORM HANDLING =====
function setupFormHandler() {
    const form = document.getElementById('readingForm');
    const submitBtn = document.getElementById('submitBtn');
    
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
            feeling: document.querySelector('input[name="feeling"]:checked').value,
            ahaMoment: document.getElementById('ahaMoment').value,
            date: new Date().toLocaleDateString('he-IL'),
            time: new Date().toLocaleTimeString('he-IL')
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
    // If no script URL configured, simulate success (for testing)
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        console.log('Demo mode - data would be sent:', data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        return;
    }
    
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
    successMessage.classList.add('show');
}

function closeSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('show');
}

// ===== STATS MANAGEMENT =====
function loadStats() {
    // Load stats from localStorage (temporary solution)
    const stats = getLocalStats();
    updateStatsDisplay(stats);
}

function getLocalStats() {
    const today = new Date().toDateString();
    const weekStart = getWeekStart();
    
    let stats = JSON.parse(localStorage.getItem('readingStats') || '{}');
    
    // Reset weekly stats if new week
    if (!stats.weekStart || new Date(stats.weekStart) < weekStart) {
        stats = {
            weekStart: weekStart.toISOString(),
            weeklyMinutes: 0,
            todayReaders: 0,
            lastUpdate: today
        };
        localStorage.setItem('readingStats', JSON.stringify(stats));
    }
    
    // Reset daily count if new day
    if (stats.lastUpdate !== today) {
        stats.todayReaders = 0;
        stats.lastUpdate = today;
        localStorage.setItem('readingStats', JSON.stringify(stats));
    }
    
    return stats;
}

function updateLocalStats() {
    let stats = getLocalStats();
    stats.weeklyMinutes += 10;
    stats.todayReaders += 1;
    stats.lastUpdate = new Date().toDateString();
    localStorage.setItem('readingStats', JSON.stringify(stats));
    updateStatsDisplay(stats);
}

function updateStatsDisplay(stats) {
    document.getElementById('totalMinutes').textContent = stats.weeklyMinutes || 0;
    document.getElementById('todayReaders').textContent = stats.todayReaders || 0;
    
    const weeklyGoal = parseInt(document.getElementById('weeklyGoal').textContent);
    const progress = Math.min((stats.weeklyMinutes / weeklyGoal) * 100, 100);
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '%';
}

function getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start week on Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

// ===== UTILITY FUNCTIONS =====
// Check if student already reported today
function hasReportedToday(studentName) {
    const today = new Date().toDateString();
    const reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
    return reports[today] && reports[today].includes(studentName);
}

// Mark student as reported today
function markAsReported(studentName) {
    const today = new Date().toDateString();
    let reports = JSON.parse(localStorage.getItem('dailyReports') || '{}');
    if (!reports[today]) reports[today] = [];
    reports[today].push(studentName);
    localStorage.setItem('dailyReports', JSON.stringify(reports));
}

// Optional: Prevent duplicate submissions per day
document.getElementById('readingForm').addEventListener('submit', function(e) {
    const studentName = document.getElementById('studentName').value;
    if (hasReportedToday(studentName)) {
        if (!confirm('נראה שכבר דיווחת היום. האם להמשיך בכל זאת?')) {
            e.preventDefault();
            return false;
        }
    }
});
