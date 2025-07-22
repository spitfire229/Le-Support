document.addEventListener("DOMContentLoaded", function() {
    // Vérifie si la largeur de l'écran est inférieure à 767px
    if (window.innerWidth < 767) {
        var section = document.getElementById("contentSection");
        section.classList.add("hidden");

        document.getElementById("toggleButton").addEventListener("click", function() {
            section.classList.toggle("hidden");
        });
    }
});
