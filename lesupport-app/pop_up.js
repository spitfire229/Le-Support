document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.pop-up-btn');

    buttons.forEach(button => {
        const popupId = button.getAttribute('data-popup-id');
        const popup = document.getElementById(popupId);
        let isMouseOverPopup = false;

        if (!popup) return; // Évite les erreurs si aucune popup n'est trouvée

        button.addEventListener('mouseenter', (event) => {
            popup.style.display = 'flex';
            popup.style.left = `${event.target.getBoundingClientRect().right + 5}px`;
            popup.style.top = `${event.target.getBoundingClientRect().top}px`;
        });

        button.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!isMouseOverPopup) {
                    popup.style.display = 'none';
                }
            }, 300);
        });

        popup.addEventListener('mouseenter', () => {
            isMouseOverPopup = true;
            popup.style.display = 'flex';
        });

        popup.addEventListener('mouseleave', () => {
            isMouseOverPopup = false;
            popup.style.display = 'none';
        });
    });
});
