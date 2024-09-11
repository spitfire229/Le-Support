function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function getCurrentDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function updateCurrentDatePosition() {
    const now = new Date();
    const daysInYear = getDaysInYear(now.getFullYear());
    const currentDay = getCurrentDayOfYear();
    const percentageOfYear = (currentDay / daysInYear) * 100;

    const currentDateElement = document.getElementById('current-date');
    currentDateElement.style.left = `calc(${percentageOfYear}% - 5px)`;
}

function updateCurrentDateDisplay() {
    const now = new Date();
    const dateDisplay = document.getElementById('current-date-display');
    dateDisplay.textContent = `Date actuelle : ${now.toLocaleDateString()}`;
}

function getNextEventDays() {
    const now = new Date();
    const events = document.querySelectorAll('.key-event');
    let closestEvent = null;
    let minDays = Infinity;

    events.forEach(event => {
        const eventDate = new Date(event.getAttribute('data-date'));
        const diffTime = eventDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays < minDays) {
            closestEvent = event;
            minDays = diffDays;
        }
    });

    const daysToNextEventDisplay = document.getElementById('days-to-next-event');
    if (closestEvent) {
        daysToNextEventDisplay.textContent = `Jours restants avant ${closestEvent.textContent} : ${minDays}`;
    } else {
        daysToNextEventDisplay.textContent = "Aucun événement à venir.";
    }
}

// Initialisation de la frise
updateCurrentDatePosition();
updateCurrentDateDisplay();
getNextEventDays();

// Mettre à jour la position du curseur à minuit chaque jour
setInterval(function() {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        updateCurrentDatePosition();
        updateCurrentDateDisplay();
        getNextEventDays();
    }
}, 60000); // Vérifie toutes les minutes