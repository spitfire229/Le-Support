document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Empêche le formulaire de se soumettre normalement

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Charger les données JSON et chercher l'utilisateur
  fetch('../Json/debug.json')
    .then(response => response.json())
    .then(data => {
      const userIndex = data.findIndex(user => user.username === username && user.password === password);
      if (userIndex !== -1) {
        // Redirection vers la seconde page avec l'index de l'utilisateur en paramètre
        window.location.href = `index1.html?userIndex=${userIndex}`;
      } else {
        alert('Identifiant ou mot de passe incorrect.');
      }
      
    })
    .catch(error => console.error('Erreur de chargement des données JSON:', error));
});