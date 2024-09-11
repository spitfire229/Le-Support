document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validation basique du formulaire
    if (username === '' || password === '') {
        alert('Veuillez entrer votre nom d’utilisateur et mot de passe');
        return;
    }

    fetch('../Json/user_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de réseau lors de la récupération du fichier JSON');
            }
            return response.json();
        })
        .then(data => {
            const user = data.authors.find(author => author.username === username && author.password === password);
            if (user) {
                localStorage.setItem('userId', user.ID); 
                localStorage.setItem('username', user.username);
                window.location.href = '../arborescence/espace de travail.html';
            } else {
                alert('Nom d’utilisateur ou mot de passe incorrect');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.');
        });
});
