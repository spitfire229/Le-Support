// Fonction pour vérifier et afficher la pop-up
function checkPopup() {
    const popupShown = localStorage.getItem("popupShown");
    if (!popupShown) {
        showPopup();
        localStorage.setItem("popupShown", "true"); // Enregistrer dans le localStorage
    }
}

// Fonction pour afficher la pop-up
function showPopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "block";
    } else {
        console.error("L'élément avec l'ID 'popup' n'existe pas.");
    }
}


// Fonction pour fermer la pop-up
function closePopup() {
    const popup = document.getElementById("myPopup");
    popup.style.display = "none";
}

        // Fonction pour effacer le localStorage (à des fins de démonstration)
        function clearStorage() {
    localStorage.removeItem("popupShown");
    alert("Le localStorage a été effacé. La pop-up apparaîtra à nouveau au prochain chargement.");
}