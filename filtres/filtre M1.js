document.addEventListener('DOMContentLoaded', function() {
    fetch('./Json/Big mama.json')  // Remplacez par le chemin vers votre fichier JSON
        .then(response => response.json())
        .then(data => {
            generateContent(data);
        });

    function generateContent(data) {
        // Generate content for 'ouvrages'
        if (data.ouvrages.M1) {
            data.ouvrages.M1.forEach(item => {
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

        // Generate content for 'cours'
        if (data.cours.M1) {
            data.cours.M1.forEach(item => {
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
         // Generate content for 'podcasts'
         if (data.podcasts.M1) {
            data.podcasts.M1.forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `
                <div class="podcast">
                <img src="${item.img_src}" alt="">
                <p>${item.title}</p>
                <a href="${item.url_1}">
                <div class="bouton2">${item.source_url_1}</div></a>
                <a href="${item.url_2}">
                <div class="bouton2">${item.source_url_2}</div></a>
            </div>
                `;
                document.getElementById('podcasts').appendChild(div);
            });

            
        }
                 // Generate content for 'ytb_videos'
                 if (data.ytb_videos.M1) {
                    data.ytb_videos.M1.forEach(item => {
                        const div = document.createElement('div');
                        div.innerHTML = `<p style=" margin-left: 15px;">${item.title} </p>
                        <iframe style="margin: 15px; border-radius: 15px;" width="400" height="215" src="${item.url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                        `;
                        document.getElementById('ytb_videos').appendChild(div);
                    });
        
                    
                }

        // Generate content for 'schemas'
        if (data.schemas.M1) {
            data.schemas.M1.forEach(item => {
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