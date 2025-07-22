
document.addEventListener('DOMContentLoaded', function() {
    fetch('./Json/Big mama.json')  // Remplacez par le chemin vers votre fichier JSON
        .then(response => response.json())
        .then(data => {
            generateContent(data);
        });

    function generateContent(data) {
        // Filter and generate content for 'ouvrages' with matiere 'Droit Pénal'
        if (data.ouvrages.L1) {
            data.ouvrages.L1.filter(item => item.matiere === 'Droit Pénal').forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <a href="${item.url}">
                        <button>
                            <img src="${item.img_src}" alt="${item.title}">
                            <span>${item.title}</span>
                        </button>
                    </a>
                `;
                document.getElementById('ouvrages').appendChild(div);
            });
        }

        // Filter and generate content for 'cours' with matiere 'Droit Pénal'
        if (data.cours.L1) {
            data.cours.L1.filter(item => item.matiere === 'Droit Pénal').forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <a href="${item.url}">
                        <button>
                            <img src="${item.img_src}" alt="${item.title}">
                            <span>${item.title}</span>
                        </button>
                    </a>
                `;
                document.getElementById('cours').appendChild(div);
            });
        }

        // Filter and generate content for 'schemas' with matiere 'Droit Pénal'
        if (data.schemas.L1) {
            data.schemas.L1.filter(item => item.matiere === 'Droit Pénal').forEach(item => {
                const div = document.createElement('div');
                div.className = 'container1';
                div.innerHTML = `
                    <h3>${item.title}</h3>
                    <div class="image-container">
                        <img class="schema" src="${item.img_src}" alt="">
                    </div>
                    <br>
                    <div class="under">
                        <img src="${item.presenter_img}" alt="">
                        <p>présenté par <a href="./arborescence/contributeur.html" class="userLink">${item.presenter}</a></p>
                        <a href="${item.excalidraw_url}"> <img class="schema" src="${item.open_src}" alt=""></a>
                    </div>
                `;
                document.getElementById('schemas').appendChild(div);

                // Ajout de l'écouteur d'événements pour le mode plein écran
                const schemaImg = div.querySelector('.schema');
                schemaImg.addEventListener('click', function() {
                    const fullscreen = document.createElement('div');
                    fullscreen.classList.add('fullscreen');

                    const fullscreenImage = document.createElement('img');
                    fullscreenImage.src = schemaImg.src;

                    fullscreen.appendChild(fullscreenImage);
                    document.body.appendChild(fullscreen);

                    fullscreen.addEventListener('click', () => {
                        fullscreen.remove();
                    });
                });
            });
        }
    }
});
