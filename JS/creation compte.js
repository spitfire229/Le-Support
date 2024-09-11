document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire par défaut
    // Récupération des valeurs des champs
    // Affichage du résultat dans la console (simuler l'envoi du mail)
    console.log(JSON.stringify(user, null, 2));
    // Vous pouvez ajouter ici le code pour envoyer les données à votre serveur ou par e-mail
});