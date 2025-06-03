function activerModeDeprime() {
    const logo = document.createElement('img');
    logo.src = '../img/icon.png';
    logo.style.position = 'fixed';
    logo.style.width = '100px';
    logo.style.height = '100px';
    logo.style.zIndex = 9999;
    logo.style.pointerEvents = 'none';
    logo.style.transition = 'transform 0.1s linear';
    document.body.appendChild(logo);

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const logoWidth = 100;
    const logoHeight = 100;

    let x = 100;
    let y = 100;
    let dx = 2;
    let dy = 2;
    let rotation = 0;

    const messages = [
        "Tu vas t’en sortir 🫶",
        "Respire, ça ira mieux bientôt 🍃",
        "Même les pires journées ont une fin 🌙",
        "Tu n’es pas seul·e 🤍",
        "Chaque petit pas compte 👣",
        "Ta motivation d’aujourd’hui construit ton succès de demain 🏗️",
        "Chaque jurisprudence maîtrisée est une victoire de plus ⚖️",
        "Tu n’as pas besoin d’aller vite, juste de continuer 🐾",
        "Ton courage est ta meilleure alliée 🎯",
        "Chaque révision est un pas de plus vers ton rêve 📘",
        "Tu fais preuve d’une force immense, même dans les petits gestes 💪",
        "Rien ne peut t’arrêter si tu gardes le cap 🌟",
        "Les efforts d’aujourd’hui paient toujours un jour 💼",
        "Ta résilience est admirable 🌱",
        "Fais une pause, ton cerveau a besoin de respirer 🧘",
        "Tu as le droit de ne pas tout savoir, tout de suite ⏳",
        "Un esprit fatigué a aussi besoin de bienveillance 🛏️",
        "Ce n’est pas l’échec qui compte, mais ce que tu en fais 🔄",
        "Continue, même à petits pas, tu avances 🚶‍♂️",
        "Tu es en train de te forger un avenir solide 🏛️",
        "Chaque difficulté surmontée te rapproche de ton objectif 🔓",
        "Le doute fait partie du chemin vers l’excellence ❓➡️✨",
        "Tu as toutes les ressources en toi pour réussir 💡",
        "Ce n’est qu’une étape, pas une fin 🔁",
        "Garde la tête haute, même quand c’est dur 🌤️",
        "Rappelle-toi pourquoi tu as commencé 🎯",
        "Ce que tu apprends aujourd’hui fera ta force demain 🧠",
        "Tu es plus près de la ligne d’arrivée que tu ne le crois 🏁",
        "Ta discipline est déjà une forme de réussite 🕰️",
        "Un jour, tu seras fier(e) de ne pas avoir abandonné 🥇",
        "Tu avances, même quand tu ne t’en rends pas compte 📚",
        "Une page à la fois, un article à la fois 📖",
        "Tu n’es pas ton dernier résultat 🧠",
        "La persévérance est ta superpuissance ⚖️",
        "Tu es capable de choses incroyables 💼",
        "Garde confiance, tu construis ton avenir pas à pas 🏛️",
        "C’est normal de douter, ça fait partie du chemin 🌊",
        "Repose-toi, le droit ne s’envolera pas 😴",
        "Tu n’es pas seul(e) dans cette galère, on rame ensemble 🚣‍♀️",
        "Tu as déjà surmonté plus dur que ça 🔥",
        "L’essentiel, c’est d’avancer, même lentement 🐢",
        "Ton travail porte ses fruits, même s’ils sont encore verts 🍏",
        "Crois en toi, tu en es digne 🎓",
        "Tu es plus fort(e) que ce que tu penses 🧩",
        "Un mauvais jour ne fait pas un mauvais juriste 🌧️",
        "Ton futur toi te remerciera 🙌",
        "Tu fais de ton mieux, et c’est assez 🌟",
        "Répète-toi que tu es capable, jusqu’à ce que tu y croies 🗣️",
        "Tu as le droit de ralentir sans abandonner 🕊️",
        "Chaque petit effort compte, vraiment 💧",
        "Tu n’as pas besoin d’être parfait(e), juste d’avancer ❤️",
        "Même les plus grands juristes ont commencé comme toi 📎",
        "Ce n’est pas facile, mais tu deviens plus fort(e) à chaque étape 🛤️",
        "Tu mérites de réussir, n’en doute jamais 💬",
        "Ce que tu fais aujourd’hui construit ta victoire de demain 🏆",
        "bon t'as pas le choix, tu dois y aller, mais tu peux le faire !",
        "Tu es capable de surmonter cette épreuve, un pas à la fois 🏋️",
        "azy je vais faire une overdose de gentillesse",
        "pas l'habitude de dire des choses gentilles comme ca moi...", 
        "je vais pas m'habituer à dire des choses gentilles, je te préviens",
        "je vais pas faire ça tous les jours, hein ?",
        "je vais pas faire ça toute la journée, hein ?",
        "je vais pas faire ça toute la semaine, hein ?",
        "je vais pas faire ça toute l'année, hein ?",
        "imagine ce genre de messages te remontent le moral... enfin je dis ca mais immagine ... ; )",
        "meme si ces messages sont génériques ils sont faits pour toi.",
        "t'as pensé a consulter ?",
        "faut partir en vacances marcel."
    ];

   
    function showMessage(x, y) {
        const message = document.createElement('div');
        message.textContent = messages[Math.floor(Math.random() * messages.length)];
        message.style.position = 'absolute';
        message.style.left = `${x}px`;
        message.style.top = `${y}px`;
        message.style.backgroundColor = '#545454';
        message.style.color = 'white';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '10px';
        message.style.fontFamily = 'sans-serif';
        message.style.zIndex = 9999;
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.5s';
        document.body.appendChild(message);

        setTimeout(() => {
            message.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => document.body.removeChild(message), 500);
        }, 3000);
    }

    function animate() {
        x += dx;
        y += dy;

        if (x <= 0 || x + logoWidth >= window.innerWidth) {
            dx = -dx;
            rotation += 15;
            showMessage(x, y); // Message au rebond horizontal
        }
        if (y <= 0 || y + logoHeight >= window.innerHeight) {
            dy = -dy;
            rotation += 15;
            showMessage(x, y); // Message au rebond vertical
        }

        logo.style.left = x + 'px';
        logo.style.top = y + 'px';
        logo.style.transform = `rotate(${rotation}deg)`;

        requestAnimationFrame(animate);
    }
        // Ajouter l'événement pour arrêter l'animation et faire disparaître le logo
    const stopButton = document.getElementById('stop-animation');
    stopButton.addEventListener('click', () => {
        animationActive = false;
        logo.style.display = 'none';
    });

    let animationActive = true;
    function animate() {
        if (!animationActive) return;

        x += dx;
        y += dy;

        if (x <= 0 || x + logoWidth >= window.innerWidth) {
            dx = -dx;
            rotation += 15;
            showMessage(x, y);
        }
        if (y <= 0 || y + logoHeight >= window.innerHeight) {
            dy = -dy;
            rotation += 15;
            showMessage(x, y);
        }

        logo.style.left = x + 'px';
        logo.style.top = y + 'px';
        logo.style.transform = `rotate(${rotation}deg)`;

        requestAnimationFrame(animate);
    }


    animate();

    // Ajouter l'événement pour augmenter la vitesse à chaque clic sur le bouton
    const increaseSpeedButton = document.getElementById('increase-speed');
    increaseSpeedButton.addEventListener('click', () => {
        dx *= 2.5; // Augmente la vitesse sur l'axe X
        dy *= 2.5; // Augmente la vitesse sur l'axe Y
    });

    
}