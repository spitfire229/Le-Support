document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (userId && username) {
        document.getElementById('usernameDisplay').textContent = username;
    } else {
        window.location.href = 'login.html';
        alert('une erreure est survenue, veuillez vous reconnecter ');
        
    }
});
