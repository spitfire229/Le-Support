  // Récupérer les éléments du DOM
  const menu = document.getElementById('menu');
  const menuIcon = document.getElementById('menu-icon');

  // Ajouter un écouteur d'événement au clic sur l'icône du menu
  menuIcon.addEventListener('click', function() {
    // Toggle la classe 'open' pour afficher/cacher le menu
    menu.classList.toggle('open');
  });