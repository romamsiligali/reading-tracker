// הקישור ל-Web App שיצרת ב-Google Apps Script עבור ג'1
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_K697f-xT3Y9f6l-fQ8P_u5y9G8n6wG8w_G8w/exec'; 

document.getElementById('reading-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'שולח...';

    const data = {
        studentName: document.getElementById('studentName').value,
        minutes: document.getElementById('minutes').value,
        bookName: document.getElementById('bookName').value,
        feeling: document.getElementById('feeling').value
    };

    try {
        // שליחת הנתונים לאקסל
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        });

        alert('כל הכבוד! האימון נרשם בהצלחה 🌟');
        e.target.reset();
    } catch (error) {
        console.error('Error!', error.message);
        alert('אופס, היתה שגיאה. נסי שוב מאוחר יותר.');
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
});
