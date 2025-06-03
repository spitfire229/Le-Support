const { ipcRenderer } = require('electron');

function runScript(scriptName) {
    ipcRenderer.send('run-script', scriptName);
}

// Réception des logs de la console
ipcRenderer.on('console-log', (event, data) => {
    document.getElementById('console-output').textContent += data + '\n';
});


document.addEventListener('DOMContentLoaded', () => {
    const { ipcRenderer } = require('electron');
    const path = require('path');
    const fs = require('fs');

    //
    // 🎛️ PARAMÈTRES
    //
    const settingsPage = document.getElementById('settings-page');
    const settingsButton = document.querySelector('.bottom-buttons .icon:last-child');
    const closeSettingsButton = document.getElementById('close-settings');
    const themeSelect = document.getElementById('theme');
    const volumeInput = document.getElementById('volume');

    settingsButton.addEventListener('click', () => {
        settingsPage.classList.add('open');
    });
    closeSettingsButton.addEventListener('click', () => {
        settingsPage.classList.remove('open');
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    if (localStorage.getItem('volume')) {
        volumeInput.value = localStorage.getItem('volume');
    }

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

    if (existingLink) {
        head.removeChild(existingLink); // Supprime l'ancien thème
    }

    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.id = 'theme-stylesheet';
    newLink.href = `./themes/${theme}.css`; // suppose que les fichiers sont dans /themes/
    head.appendChild(newLink);
}


    //
    // 🖥️ CONSOLE & NOTIFICATIONS
    //
    const consolePanel = document.querySelector('.sidebar-left');
    const consoleButton = document.querySelector('.bottom-buttons .icon:nth-last-child(2)');
    consoleButton.addEventListener('click', () => {
        consolePanel.classList.toggle('console-visible');
        consolePanel.classList.toggle('console-hidden');
    });
    consolePanel.classList.add('console-hidden');

    const notifPanel = document.querySelector('.sidebar-left-notif');
    const notifButton = document.querySelector('.bottom-buttons .icon:nth-last-child(3)');
    notifButton.addEventListener('click', () => {
        notifPanel.classList.toggle('console-visible');
        notifPanel.classList.toggle('console-hidden');
    });
    notifPanel.classList.add('console-hidden');

    //
    // 🔔 NOTIFICATIONS
    //
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
    setInterval(loadNotifications, 300000); // Toutes les 5 minutes

    //
    // 📦 MODULES ADDONS
    //
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
                }).catch(e => console.error(`❌ Erreur de chargement du module ${file}:`, e));
            }
        });
    });

    //
    // 🔄 IFRAME PRINCIPAL
    //
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

    //
    // 📌 BOUTON HERMES
    //
    const schemaBtn = document.getElementById("schema-button");
    schemaBtn.addEventListener("click", () => {
        document.getElementById("content-frame").src = "./utils/schemas/index.html";
    });

    ipcRenderer.on('update-mid-bar', (event, url) => {
        document.getElementById('content-frame').src = url;
    });
});





















//a clear





document.addEventListener('DOMContentLoaded', () => {
    const settingsPage = document.getElementById('settings-page');
    const settingsButton = document.querySelector('.bottom-buttons .icon:last-child');
    const closeSettingsButton = document.getElementById('close-settings');
    const themeSelect = document.getElementById('theme');
    const volumeInput = document.getElementById('volume');

    // Gérer l'affichage du panneau des paramètres
    settingsButton.addEventListener('click', () => {
        settingsPage.classList.add('open');
    });

    closeSettingsButton.addEventListener('click', () => {
        settingsPage.classList.remove('open');
    });

    const { ipcRenderer } = require('electron');

    document.addEventListener('DOMContentLoaded', () => {
        const hermesButton = document.querySelector('.icon img[src="./img/hermes.png"]');
        let hermesVisible = false;
    
        hermesButton.addEventListener('click', () => {
            console.log("🔘 Bouton Hermès cliqué, état :", hermesVisible ? "Cacher" : "Afficher");
    
            if (hermesVisible) {
                document.getElementById('content-frame').src = ''; // Cache Hermes
            } else {
                ipcRenderer.send('launch-hermes'); // Demande l'affichage
            }
            hermesVisible = !hermesVisible;
        });
    });
    
    ipcRenderer.on('update-mid-bar', (event, url) => {
        console.log("📂 Chargement de Hermes :", url);
        document.getElementById('content-frame').src = url;
    });
    

    // Appliquer le thème sur tout le document
function applyTheme(theme) {
    const head = document.head;
    const existingLink = document.getElementById('theme-stylesheet');

    if (existingLink) {
        head.removeChild(existingLink); // Supprime l'ancien thème
    }

    const newLink = document.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.id = 'theme-stylesheet';
    newLink.href = `./themes/${theme}.css`; // suppose que les fichiers sont dans /themes/
    head.appendChild(newLink);
}


    // Charger le thème enregistré
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    if (localStorage.getItem('volume')) {
        volumeInput.value = localStorage.getItem('volume');
    }

    // Écouter les changements de thème et enregistrer
    themeSelect.addEventListener('change', (event) => {
        const theme = event.target.value;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    });

    // Enregistrer le volume
    volumeInput.addEventListener('input', (event) => {
        localStorage.setItem('volume', event.target.value);
    });
});




document.addEventListener('DOMContentLoaded', () => {
    const settingsPage = document.getElementById('settings-page');
    const settingsButton = document.querySelector('.bottom-buttons .icon:last-child');
    const closeSettingsButton = document.getElementById('close-settings');

    const consolePanel = document.querySelector('.sidebar-left'); // Console
    const consoleButton = document.querySelector('.bottom-buttons .icon:nth-last-child(2)'); // Bouton au-dessus de Paramètres

    
    // Gérer l'affichage des paramètres
    settingsButton.addEventListener('click', () => {
        settingsPage.classList.add('open');
    });

    closeSettingsButton.addEventListener('click', () => {
        settingsPage.classList.remove('open');
    });

    // Gérer l'affichage de la console
    consoleButton.addEventListener('click', () => {
        if (consolePanel.classList.contains('console-visible')) {
            consolePanel.classList.remove('console-visible');
            consolePanel.classList.add('console-hidden');
        } else {
            consolePanel.classList.remove('console-hidden');
            consolePanel.classList.add('console-visible');
        }
    });

    // Appliquer les classes au chargement pour éviter un affichage instantané
    consolePanel.classList.add('console-hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('supportFrame');

    iframe.addEventListener('error', () => {
        ipcRenderer.send('console-log', "Erreur: Impossible de charger Lesupport.me");
    });

    iframe.onload = () => {
        try {
            // Vérifier si l'iframe est bien chargée en accédant à son contenu
            iframe.contentWindow.postMessage('ping', '*');
        } catch (error) {
            ipcRenderer.send('console-log', `Erreur de chargement: ${error.message}`);
        }
    };
});

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.querySelector("iframe");

    iframe.onload = () => {
        // Essayer d'injecter le style (ne marchera QUE si l'iframe est du même domaine)
        try {
            const css = `
                ::-webkit-scrollbar { display: none; }
            `;
            const style = document.createElement("style");
            style.innerHTML = css;
            iframe.contentWindow.document.head.appendChild(style);
        } catch (error) {
            console.warn("Impossible de modifier le CSS de l'iframe en raison des restrictions CORS.");
        }
    };
});

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.querySelector("iframe");

    iframe.onload = () => {
        try {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            iframeDocument.documentElement.style.overflow = "auto"; // Active le scroll
            iframeDocument.documentElement.style.scrollbarWidth = "none"; // Masque la scrollbar
        } catch (error) {
            console.warn("Impossible de modifier l'iframe en raison des restrictions CORS.");
        }
    };
});


document.addEventListener('DOMContentLoaded', () => {
    const notifPanel = document.querySelector('.sidebar-left-notif'); // Panneau des notifications
    const notifButton = document.querySelector('.bottom-buttons .icon:nth-last-child(3)'); // Bouton de notif

    // Gérer l'affichage des notifications
    notifButton.addEventListener('click', () => {
        if (notifPanel.classList.contains('console-visible')) {
            notifPanel.classList.remove('console-visible');
            notifPanel.classList.add('console-hidden');
        } else {
            notifPanel.classList.remove('console-hidden');
            notifPanel.classList.add('console-visible');
        }
    });

    // Appliquer la classe cachée au démarrage pour éviter l'affichage par défaut
    notifPanel.classList.add('console-hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    const clearNotifButton = document.getElementById('clear-notifications');

    clearNotifButton.addEventListener('click', () => {
        localStorage.clear();
        alert("Notifications supprimées !");
        location.reload(); // Recharge la page pour appliquer les changements
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const notifContainer = document.getElementById('notif-page');

    // URL du fichier JSON (remplace par ton lien réel)
    const jsonURL = "https://lesupport.me/Json/notifs.json";

    // Fonction pour charger les notifications
    function loadNotifications() {
        fetch(jsonURL)
            .then(response => response.json())
            .then(data => {
                notifContainer.innerHTML = "<h4>CONSOLE DES NOTIFS</h4><button id=\"clear-notifications\">actualiser les notification</button>"; // Réinitialisation

                data.forEach(notif => {
                    const notifElement = document.createElement("div");
                    notifElement.classList.add("notif-item");
                    notifElement.innerHTML = `
                        <strong>${notif.date} - ${notif.heure}</strong><br>
                        <em>${notif.matiere}</em><br>
                        ${notif.message}
                    `;
                    notifContainer.appendChild(notifElement);
                });
            })
            .catch(error => console.error("Erreur de chargement des notifications:", error));
    }

    loadNotifications(); // Charger les notifications au démarrage

    // Recharger les notifications toutes les 5 minutes
    setInterval(loadNotifications, 300000);
});

const path = require('path');
const fs = require('fs');

function chargerModulesDynamique() {
    const modulesDir = path.join(__dirname, 'addon');
    const container = document.getElementById('modules');

    fs.readdir(modulesDir, (err, files) => {
        if (err) {
            console.error("Erreur de lecture du dossier addon :", err);
            return;
        }

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
                }).catch(e => {
                    console.error(`❌ Erreur de chargement du module ${file}:`, e);
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    chargerModulesDynamique();
});


function changeIframe(url) {
    document.getElementById('content-frame').src = url;
}


document.getElementById("schema-button").addEventListener("click", function() {
    document.getElementById("content-frame").src = "./utils/schemas/index.html";
});
