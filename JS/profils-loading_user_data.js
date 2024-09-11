document.addEventListener("DOMContentLoaded", function() {
    // Récupérer l'ID de l'utilisateur à partir du localStorage
    const userId = localStorage.getItem('userId');
  
    if (userId !== null) {
        // Chargement des données JSON
        fetch('../Json/user_data.json')
            .then(response => response.json())
            .then(data => {
                // Utiliser l'ID de l'utilisateur pour obtenir les données de l'utilisateur correspondant
                const user = data.authors.find(author => author.ID === userId);
  
                // Remplissage des éléments HTML avec les données JSON de l'utilisateur choisi
                document.getElementById('utilisateur').innerText = user.utilisateur;
                document.getElementById('userImage').src = user.picture;
                document.getElementById('grade').innerText = user.grade;
                document.getElementById('status').innerText = user.status;
                document.getElementById('studies').innerText = user.studies;
                document.getElementById('education_level').innerText = user.education_level;
                document.getElementById('university').innerText = user.university;
                document.getElementById('additional_info').innerText = user.additional_info;
                document.getElementById('instagram_link').addEventListener('click', function() {
                    window.location.href = user.instagram_link;
                });
                document.getElementById('linkedin_link').addEventListener('click', function() {
                    window.location.href = user.linkedin_link;
                });
                // Ajout du lien mail si disponible dans l'objet utilisateur
                if (user.mail_link) {
                    document.getElementById('mail_link').addEventListener('click', function() {
                        window.location.href = user.mail_link;
                    });
                }
                document.getElementById('contribution').innerText = user.contribution;
            })
            .catch(error => console.error('Erreur de chargement des données JSON:', error));
    } else {
        // Gérer le cas où l'ID de l'utilisateur n'est pas fourni dans le localStorage
        console.error('ID de l\'utilisateur non fourni dans le localStorage.');
    }
});
