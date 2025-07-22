
    // Ajouter un gestionnaire d'événements pour les liens d'utilisateur
    document.querySelectorAll('.userLink').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Empêcher le comportement par défaut du lien
            const userIndex = this.getAttribute('data-user-index');
            window.location.href = `./arborescence/contributeur.html?userIndex=${userIndex}`;
        });
    });
