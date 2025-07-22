document.addEventListener("DOMContentLoaded", () => {
    const eventsContainer = document.querySelector("#events .cards");
    const newsContainer = document.querySelector("#news .cards");
  
    // Charger les données depuis le fichier JSON
    fetch("../Json/data.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        return response.json();
      })
      .then(data => {
        const today = new Date();
        // Filtrer les événements à venir (date postérieure à aujourd'hui)
        const upcomingEvents = data.events.filter(event => new Date(event.date) > today);
        populateEvents(upcomingEvents);
        populateNews(data.news);
      })
      .catch(error => {
        console.error("Erreur :", error);
      });
  
    // Fonction pour insérer les événements
    function populateEvents(events) {
      eventsContainer.innerHTML = ""; // Vider le conteneur
      if (events.length === 0) {
        eventsContainer.innerHTML = "<p>Aucun événement à venir pour le moment.</p>";
      } else {
        events.forEach(event => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <a href="${event.link}">
            <img src="${event.image}" alt="${event.title}">
            <h3>${event.title}</h3>
            <p><strong>Date :</strong> ${event.date}</p>
            <p><strong>Lieu :</strong> ${event.location}</p>
            <p>${event.description}</p>
            </a>
          `;
          eventsContainer.appendChild(card);
        });
      }
    }
  });
  