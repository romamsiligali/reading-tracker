const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEJi8Y9QD_8XVqiip2cujEhV6Ue9GySSpekmr_-wYdP_MbgY0LJGfukencB7HDCji-Ag/exec';

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button') || e.target.querySelector('input[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'שולח...';
    }

    const data = {
        studentName: document.querySelector('#studentName')?.value || document.querySelector('[name="studentName"]')?.value,
        minutes: document.querySelector('#minutes')?.value || document.querySelector('[name="minutes"]')?.value,
        bookName: document.querySelector('#bookName')?.value || document.querySelector('[name="bookName"]')?.value,
        feeling: document.querySelector('#feeling')?.value || document.querySelector('input[name="feeling"]:checked')?.value || 'נחמד'
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        });
        alert('הדיווח נשלח בהצלחה! כל הכבוד 💪');
        location.reload(); 
    } catch (error) {
        alert('אופס, היתה שגיאה קטנה. נסי שוב.');
        if (submitBtn) submitBtn.disabled = false;
    }
});
