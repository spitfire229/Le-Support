const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// ---------------------
// 🧠 SCRIPT PRINCIPAL
// ---------------------

document.addEventListener('DOMContentLoaded', () => {

    // 🎛️ PARAMÈTRES
    const settingsPage = document.getElementById('settings-page');
    const settingsButton = document.querySelector('.bottom-buttons .icon:last-child');
    const closeSettingsButton = document.getElementById('close-settings');
    const themeSelect = document.getElementById('theme');
    const volumeInput = document.getElementById('volume');

    settingsButton.addEventListener('click', () => settingsPage.classList.add('open'));
    closeSettingsButton.addEventListener('click', () => settingsPage.classList.remove('open'));

    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    if (localStorage.getItem('volume')) volumeInput.value = localStorage.getItem('volume');

    themeSelect.addEventListener('change', (event) => {
        const theme = event.target.value;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    });

    volumeInput.addEventListener('input', (event) => {
        localStorage.setItem('volume', event.target.value);
    });

    function applyTheme(theme) {
        const head = document.head;
        const existingLink = document.getElementById('theme-stylesheet');
        if (existingLink) head.removeChild(existingLink);

        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.id = 'theme-stylesheet';
        newLink.href = `./themes/${theme}.css`;
        head.appendChild(newLink);
    }

    // 🖥️ CONSOLE
    const consolePanel = document.querySelector('.sidebar-left');
    const consoleButton = document.querySelector('.bottom-buttons .icon:nth-last-child(2)');
    consoleButton.addEventListener('click', () => {
        consolePanel.classList.toggle('console-visible');
        consolePanel.classList.toggle('console-hidden');
    });
    consolePanel.classList.add('console-hidden');

    // 🔔 NOTIFICATIONS
    const notifPanel = document.querySelector('.sidebar-left-notif');
    const notifButton = document.getElementById('notif-toggle');
    notifButton.addEventListener('click', () => {
        notifPanel.classList.toggle('console-visible');
        notifPanel.classList.toggle('console-hidden');
    });
    notifPanel.classList.add('console-hidden');

    const notifContainer = document.getElementById('notif-page');
    const jsonURL = "https://lesupport.me/Json/notifs.json";

    function loadNotifications() {
        fetch(jsonURL)
            .then(res => res.json())
            .then(data => {
                notifContainer.innerHTML = "<h4>CONSOLE DES NOTIFS</h4><button id='clear-notifications'>actualiser les notifications</button>";
                data.forEach(notif => {
                    const notifElement = document.createElement("div");
                    notifElement.classList.add("notif-item");
                    notifElement.innerHTML = `<strong>${notif.date} - ${notif.heure}</strong><br><em>${notif.matiere}</em><br>${notif.message}`;
                    notifContainer.appendChild(notifElement);
                });
                document.getElementById('clear-notifications').addEventListener('click', () => {
                    localStorage.clear();
                    alert("Notifications supprimées !");
                    location.reload();
                });
            })
            .catch(err => console.error("Erreur de chargement des notifications :", err));
    }
    loadNotifications();
    setInterval(loadNotifications, 300000); // 5 min

    // 📦 MODULES DYNAMIQUES
    const modulesDir = path.join(__dirname, 'addon');
    const container = document.getElementById('modules');

    fs.readdir(modulesDir, (err, files) => {
        if (err) return console.error("Erreur de lecture du dossier addon :", err);
        files.forEach(file => {
            if (file !== 'unité-centrale.js' && file.endsWith('.js')) {
                const fullPath = path.join(modulesDir, file);
                import(fullPath).then(mod => {
                    if (mod.render && typeof mod.render === 'function') {
                        const element = mod.render();
                        container.appendChild(element);
                        console.log(`✅ Module ${file} intégré`);
                    } else {
                        console.warn(`⚠️ Le module ${file} n'exporte pas de fonction 'render'`);
                    }
                }).catch(e => console.error(`❌ Erreur de chargement du module ${file} :`, e));
            }
        });
    });

    // 🔄 IFRAME
    const iframe = document.querySelector("iframe");
    iframe.onload = () => {
        try {
            iframe.contentWindow.postMessage('ping', '*');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.documentElement.style.overflow = "auto";
            iframeDoc.documentElement.style.scrollbarWidth = "none";
            const style = document.createElement("style");
            style.innerHTML = `::-webkit-scrollbar { display: none; }`;
            iframeDoc.head.appendChild(style);
        } catch (error) {
            console.warn("Impossible de modifier le CSS de l'iframe (CORS ?)");
        }
    };

    iframe.addEventListener('error', () => {
        ipcRenderer.send('console-log', "Erreur: Impossible de charger Lesupport.me");
    });

    // 📌 BOUTON HERMES
    const hermesButton = document.querySelector('.icon img[src="./img/hermes.png"]');
    let hermesVisible = false;

    hermesButton.addEventListener('click', () => {
        console.log("🔘 Bouton Hermès cliqué, état :", hermesVisible ? "Cacher" : "Afficher");
        if (hermesVisible) {
            document.getElementById('content-frame').src = '';
        } else {
            ipcRenderer.send('launch-hermes');
        }
        hermesVisible = !hermesVisible;
    });

    ipcRenderer.on('update-mid-bar', (event, url) => {
        console.log("📂 Chargement de Hermes :", url);
        document.getElementById('content-frame').src = url;
    });

});

// Fonction appelée via onclick="changeIframe('url')"
function changeIframe(url) {
    const iframe = document.getElementById('content-frame');
    if (iframe) {
        iframe.src = url;
        console.log("📥 Iframe changé :", url);
    } else {
        console.warn("❌ Iframe non trouvé !");
    }
}

document.getElementById('openDrawer').addEventListener('click', async () => {
  const drawer = document.getElementById('drawer');
  drawer.classList.add('open');

  const content = document.getElementById('drawerContent');
  content.innerText = 'Chargement...';

  try {
    const res = await fetch('https://tonserveur.com/chemin/vers/fichier.json'); // remplace l’URL ici
    const data = await res.json(); // ou .text() si c’est un .txt
    content.innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    content.innerText = "Erreur lors du chargement : " + err.message;
  }
});

document.getElementById('closeDrawer').addEventListener('click', () => {
  document.getElementById('drawer').classList.remove('open');
});



// LOG CONSOLE PARTAGÉ
ipcRenderer.on('console-log', (event, data) => {
    document.getElementById('console-output').textContent += data + '\n';
});

// Lancement de scripts externes
function runScript(scriptName) {
    ipcRenderer.send('run-script', scriptName);
}
