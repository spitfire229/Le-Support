document.addEventListener("DOMContentLoaded", () => {
  const carouselTrack = document.querySelector(".carousel-track");
  const btnLeft = document.querySelector(".carousel-btn-left");
  const btnRight = document.querySelector(".carousel-btn-right");

  let slideWidth;
  let currentSlide = 0;

  // Charger les actualités depuis le JSON
  fetch("../Json/data.json")
    .then(response => {
      if (!response.ok) throw new Error("Erreur lors du chargement des données");
      return response.json();
    })
    .then(data => {
      populateCarousel(data.news);
      setupCarousel();
    })
    .catch(error => console.error("Erreur :", error));

  // Ajouter les actualités au carousel
  function populateCarousel(news) {
    const today = new Date();
    carouselTrack.innerHTML = ""; // Vider la piste

    // Filtrer les actualités futures
    const futureNews = news.filter(item => new Date(item.date) >= today);

    // Ajouter chaque actualité
    futureNews.forEach(article => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h3>${article.title}</h3>
        
        <img src="../img/comming soon.svg" alt="">
        <p>${article.description}</p>
        <p><strong>Date :</strong> ${article.date}</p>
        <a href="${article.link}" class="btn">
        <div class="button-container">
        <button class="animated-button">en savoir plus</button>
    </div>
    </a>
      `;
      carouselTrack.appendChild(card);
    });

    // Ajouter les duplications pour la boucle infinie
    const slides = Array.from(carouselTrack.children);
    if (slides.length > 1) {
      const firstSlide = slides[0].cloneNode(true);
      const lastSlide = slides[slides.length - 1].cloneNode(true);

      carouselTrack.appendChild(firstSlide);
      carouselTrack.insertBefore(lastSlide, slides[0]);
    }
  }

  // Configurer la position initiale et largeur des slides
  function setupCarousel() {
    const slides = Array.from(carouselTrack.children);
    slideWidth = slides[0].getBoundingClientRect().width;

    // Positionner chaque slide horizontalement
    slides.forEach((slide, index) => {
      slide.style.left = `${slideWidth * index}px`;
    });

    // Positionner le carousel sur le premier élément réel
    carouselTrack.style.transform = `translateX(${-slideWidth}px)`;
    currentSlide = 1;

    // Ajouter les écouteurs pour les boutons
    btnLeft.addEventListener("click", moveLeft);
    btnRight.addEventListener("click", moveRight);

    // Ajuster la largeur en cas de redimensionnement
    window.addEventListener("resize", () => {
      slideWidth = slides[0].getBoundingClientRect().width;
      carouselTrack.style.transform = `translateX(${-slideWidth * currentSlide}px)`;
    });
  }

  // Déplacer le carousel à gauche
  function moveLeft() {
    const slides = Array.from(carouselTrack.children);

    if (currentSlide <= 0) {
      currentSlide = slides.length - 2; // Dernier élément réel
      carouselTrack.style.transition = "none";
      carouselTrack.style.transform = `translateX(${-slideWidth * currentSlide}px)`;
    }

    setTimeout(() => {
      currentSlide--;
      carouselTrack.style.transition = "transform 0.5s ease-in-out";
      carouselTrack.style.transform = `translateX(${-slideWidth * currentSlide}px)`;
    }, 50);
  }

  // Déplacer le carousel à droite
  function moveRight() {
    const slides = Array.from(carouselTrack.children);

    if (currentSlide >= slides.length - 1) {
      currentSlide = 1; // Premier élément réel
      carouselTrack.style.transition = "none";
      carouselTrack.style.transform = `translateX(${-slideWidth * currentSlide}px)`;
    }

    setTimeout(() => {
      currentSlide++;
      carouselTrack.style.transition = "transform 0.5s ease-in-out";
      carouselTrack.style.transform = `translateX(${-slideWidth * currentSlide}px)`;
    }, 50);
  }
});
