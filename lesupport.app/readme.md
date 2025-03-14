app-electron
├── lesupport - setup/
│   ├── main.js            # Processus principal d’Electron
│   ├── index.html         # Interface principale
│   ├── renderer.js        # Gestion de l'interface et des événements
│   ├── package.json       # Configuration du projet
│   ├── style-sheets/           # Dossier des scripts Python
│       ├── style.css
│       ├── light-style.css




"main.js"


const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;

function createMainWindow() {
    if (mainWindow) return;

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, 'img', 'lesupport ico.png'), // Chemin de l'icône
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // Création du menu personnalisé
    const customMenu = Menu.buildFromTemplate([
        {
            label: '←- ',
            accelerator: 'Alt+Left',
            click: () => {
                if (mainWindow.webContents.canGoBack()) {
                    mainWindow.webContents.goBack();
                }
            }
        },
        {
            label: '|     ⌂     |',
            accelerator: 'Alt+H',
            icon: path.join(__dirname, 'img', 'home.png'), // Vérifie le chemin ici
            click: () => {
                if (mainWindow) {
                    mainWindow.loadFile('index.html');
                }
            }
        }
        ,
        
        {
            label: ' -→',
            accelerator: 'Alt+Right',
            click: () => {
                if (mainWindow.webContents.canGoForward()) {
                    mainWindow.webContents.goForward();
                }
            }
        },
        {
            label: '     Aide',
            submenu: [
                {
                    label: 'Rafraîchir',
                    accelerator: 'Ctrl+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.reload();
                        }
                    }
                },
                {
                    label: 'F11 → Activer/Désactiver le mode plein écran',
                    accelerator: 'F11',
                    click: () => {
                        let isFullScreen = mainWindow.isFullScreen();
                        mainWindow.setFullScreen(!isFullScreen);
                    }
                },
                {
                    label: 'Ctrl + Shift + I → Ouvrir la console de développement (DevTools)',
                    accelerator: 'Ctrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.openDevTools();
                    }
                },
                {
                    label: '🔹 Gestion des fenêtres',
                    submenu: [
                        {
                            label: 'Ctrl + W → Fermer la fenêtre actuelle',
                            accelerator: 'Ctrl+W',
                            click: () => {
                                if (mainWindow) {
                                    mainWindow.close();
                                }
                            }
                        },
                        {
                            label: 'Ctrl + N → Ouvrir une nouvelle fenêtre',
                            accelerator: 'Ctrl+N',
                            click: () => {
                                createMainWindow();
                            }
                        },
                        {
                            label: 'Ctrl + Q → Quitter l\'application',
                            accelerator: 'Ctrl+Q',
                            click: () => {
                                app.quit();
                            }
                        }
                    ]
                },
                {
                    label: '🔹 Outils & Fonctions',
                    submenu: [
                        {
                            label: 'F1 → Ouvrir l\'aide',
                            accelerator: 'F1',
                            click: () => {
                                showHelpWindow();
                            }
                        },
                        {
                            label: 'Ctrl + P → Imprimer la page',
                            accelerator: 'Ctrl+P',
                            click: () => {
                                mainWindow.webContents.print();
                            }
                        },
                        {
                            label: 'Ctrl + F → Ouvrir une barre de recherche',
                            accelerator: 'Ctrl+F',
                            click: () => {
                                mainWindow.webContents.send('open-search-bar');
                            }
                        },
                        {
                            label: 'Ctrl + S → Sauvegarder la page',
                            accelerator: 'Ctrl+S',
                            click: () => {
                                mainWindow.webContents.send('save-page');
                            }
                        },
                        {
                            label: 'Ctrl + O → Ouvrir un fichier',
                            accelerator: 'Ctrl+O',
                            click: () => {
                                shell.openItem('file:///path/to/file');
                            }
                        }
                    ]
                },
                {
                    label: '🔹 Personnalisation / Thèmes',
                    submenu: [
                        {
                            label: 'Ctrl + T → Basculer entre un thème clair et un thème sombre',
                            accelerator: 'Ctrl+T',
                            click: () => {
                                mainWindow.webContents.send('toggle-theme');
                            }
                        },
                        {
                            label: 'Ctrl + + → Zoomer',
                            accelerator: 'Ctrl+Plus',
                            click: () => {
                                mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 1);
                            }
                        },
                        {
                            label: 'Ctrl + - → Dézoomer',
                            accelerator: 'Ctrl+-',
                            click: () => {
                                mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 1);
                            }
                        },
                        {
                            label: 'Ctrl + 0 → Réinitialiser le zoom',
                            accelerator: 'Ctrl+0',
                            click: () => {
                                mainWindow.webContents.setZoomLevel(0);
                            }
                        }
                    ]
                },
                {
                    label: '🔹 Notifications & Logs',
                    submenu: [
                        {
                            label: 'Ctrl + L → Ouvrir la console des logs',
                            accelerator: 'Ctrl+L',
                            click: () => {
                                mainWindow.webContents.send('open-logs');
                            }
                        },
                        {
                            label: 'Ctrl + Shift + N → Activer/Désactiver les notifications',
                            accelerator: 'Ctrl+Shift+N',
                            click: () => {
                                mainWindow.webContents.send('toggle-notifications');
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: 'Crédits',
            click: () => {
                showCreditsWindow();
            }
        }
    ]);

    // Appliquer le menu personnalisé
    Menu.setApplicationMenu(customMenu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Fenêtre d'aide
function showHelpWindow() {
    let helpWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: 'Aide',
        modal: true,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true
        }
    });

    helpWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
        <html>
        <head><title>Aide</title></head>
        <body>
            <h2>Commandes Utilisables</h2>
            <ul>
                <li><b>Alt + Left</b> : Reculer</li>
                <li><b>Alt + Right</b> : Avancer</li>
                <li><b>Ctrl + R</b> : Rafraîchir</li>
                <li><b>F11</b> : Activer/Désactiver le mode plein écran</li>
                <li><b>Ctrl + Shift + I</b> : Ouvrir la console de développement</li>
                <li><b>Ctrl + W</b> : Fermer la fenêtre actuelle</li>
                <li><b>Ctrl + N</b> : Ouvrir une nouvelle fenêtre</li>
                <li><b>Ctrl + Q</b> : Quitter l'application</li>
                <li><b>Ctrl + P</b> : Imprimer la page</li>
                <li><b>Ctrl + F</b> : Ouvrir une barre de recherche</li>
                <li><b>Ctrl + S</b> : Sauvegarder une page</li>
                <li><b>Ctrl + O</b> : Ouvrir un fichier</li>
                <li><b>Ctrl + T</b> : Basculer entre un thème clair et sombre</li>
                <li><b>Ctrl + +</b> : Zoomer</li>
                <li><b>Ctrl + -</b> : Dézoomer</li>
                <li><b>Ctrl + 0</b> : Réinitialiser le zoom</li>
                <li><b>Ctrl + L</b> : Ouvrir la console des logs</li>
                <li><b>Ctrl + Shift + N</b> : Activer/Désactiver les notifications</li>
            </ul>
            <button onclick="window.close()">Fermer</button>
        </body>
        </html>
    `));
}

// Fenêtre des crédits
function showCreditsWindow() {
    let creditsWindow = new BrowserWindow({
        width: 500,
        height: 300,
        title: 'Crédits',
        modal: true,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true
        }
    });

    creditsWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
        <html>
        <head><title>Crédits</title></head>
        <body>
            <h2>Crédits</h2>
            <p>Application développée par [Ton Nom]</p>
            <button onclick="window.close()">Fermer</button>
        </body>
        </html>
    `));
}

// Lancer l'application
app.whenReady().then(createMainWindow);

// Gérer l'événement `activate` sur macOS pour éviter de créer plusieurs fenêtres
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

// Fermer l'application quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});



________________________________________

"render.js"

const { ipcRenderer } = require('electron');

function runScript(scriptName) {
    ipcRenderer.send('run-script', scriptName);
}

// Réception des logs de la console
ipcRenderer.on('console-log', (event, data) => {
    document.getElementById('console-output').textContent += data + '\n';
});

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

    // Appliquer le thème sur tout le document
    function applyTheme(theme) {
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        document.documentElement.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
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
    const notifContainer = document.getElementById('notif-page');

    // URL du fichier JSON (remplace par ton lien réel)
    const jsonURL = "https://lesupport.me/Json/notifs.json";

    // Fonction pour charger les notifications
    function loadNotifications() {
        fetch(jsonURL)
            .then(response => response.json())
            .then(data => {
                notifContainer.innerHTML = "<h4>CONSOLE DES NOTIFS</h4>"; // Réinitialisation

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

function changeIframe(url) {
    document.getElementById('content-frame').src = url;
}


document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('google-suite-btn');
    const popup = document.getElementById('popup');

    googleBtn.addEventListener('mouseenter', (event) => {
        popup.style.display = 'flex';
        popup.style.left = `${event.target.getBoundingClientRect().right + 5}px`;
        popup.style.top = `${event.target.getBoundingClientRect().top}px`;
    });

    googleBtn.addEventListener('mouseleave', () => {
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    });

    popup.addEventListener('mouseenter', () => {
        popup.style.display = 'flex';
    });

    popup.addEventListener('mouseleave', () => {
        popup.style.display = 'none';
    });
});



________________________________________

"index.html"

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesupport - loader</title>
    <link rel="stylesheet" href="./style-sheets/style.css">
    <link rel="stylesheet" href="./style-sheets/light-style.css">
</head>
<body>
    
    <div class="sidebar-right">
        <button class="icon" onclick="changeIframe('https://lesupport.me')"><img class="icon-img" src="./img/lesupport.png" alt=""></button>
        


        <button class="icon pop-up-btn" data-popup-id="popup1">
            <img src="./img/logo nanterre.png" alt="Docs">
        </button>
        <div id="popup1" class="popup">
            <a href="https://portail.parisnanterre.fr/page-student/"><button class="icon"><img src="./img/ent nanterre.svg" alt="Sheets"></button></a>
            <a href="https://coursenligne.parisnanterre.fr/"><button class="icon"><img src="./img/CEL.svg" alt="Sheets"></button></a>
            <a href="https://myplanning.parisnanterre.fr/direct/myplanning.jsp?ticket=ST-26389-hPV9ioXQQMN-l5mFDUZQjNeCeQM-superman"><button class="icon"><img src="./img/EDT.svg" alt="Sheets"></button></a>
        </div>
        
        <button class="icon pop-up-btn" data-popup-id="popup2">
            <img src="./img/suite google.png" alt="Docs">
        </button>
        <div id="popup2" class="popup">
            <a href="https://docs.google.com/document/u/0/?tgif=d"><button class="icon pop_up_icon"><img src="./img/ggdoc.svg" alt="Docs"></button></a>
            <a href="https://docs.google.com/spreadsheets/u/0/?tgif=d"><button class="icon pop_up_icon"><img src="./img/ggsheet.svg" alt="Sheets"></button></a>
            <a href="https://docs.google.com/presentation/u/0/?tgif=d"><button class="icon pop_up_icon"><img src="./img/ggslides.svg" alt="Sheets"></button></a>
            <a href="https://docs.google.com/forms/u/0/?tgif=d"><button class="icon pop_up_icon"><img src="./img/ggforms.svg" alt="Sheets"></button></a>
            <a href="https://drive.google.com/drive/home"><button class="icon pop_up_icon"><img src="./img/ggdrive.svg" alt="Sheets"></button></a>
            <a href="https://mail.google.com/mail/u/0/"><button class="icon pop_up_icon"><img src="./img/ggmail.svg" alt="Sheets"></button></a>
        </div>
        

        <button class="icon pop-up-btn" data-popup-id="popup4">
            <img src="./img/logo marteau.png" alt="Docs">
        </button>
        <div id="popup4" class="popup">
            <a href="https://www-dalloz-fr.faraway.parisnanterre.fr/etudiants"><button class="icon pop_up_icon"><img src="./img/logo dalloz.png" alt="Docs"></button></a>
            <a href="https://signin.lexisnexis.com/lnaccess/app/signin?back=https://www-lexis360intelligence-fr.faraway.parisnanterre.fr/legan-callback&aci=lint"><button class="icon pop_up_icon"><img src="./img/logo lexis.png" alt="Docs"></button></a>
            <a href="https://www.legifrance.gouv.fr/liste/code?etatTexte=VIGUEUR&etatTexte=VIGUEUR_DIFF"><button class="icon pop_up_icon"><img src="./img/logo code.png" alt="Docs"></button></a>
        </div>

        <button class="icon pop-up-btn" data-popup-id="popup3">
            <img src="./img/logo mapper.png" alt="Docs">
        </button>
        <div id="popup3" class="popup">
            <p>A très bientôt pour de nouveaux programmes</p>
        </div>
        











        <div class="bottom-buttons">
            <div class="separator"></div>
            <button class="icon"><img src="./img/notif.png" alt=""></button>
            <button class="icon" ><img src="./img/console.png" alt=""></button>
            <button class="icon" ><img src="./img/paramettre.png" alt=""></button>
        </div>
    </div>



        <!-- Page des paramètres (glisse depuis la droite) -->
<div id="settings-page">
    <h4>PARAMETTRES</h4>

    <label for="theme">Thème :</label>
    <select id="theme">
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
    </select>

    <label for="volume">Volume :</label>
    <input type="range" id="volume" min="0" max="100">

    <button id="close-settings">Fermer</button>
</div>



<div class="mid-bar">
    <div class="div-background"><iframe id="content-frame" style="border-radius: 15px; border: none; z-index: 5;" width="98%" height="98%"></iframe>
</div>
    </div>

    <div class="sidebar-left" id="console-page"><button id="clear-notifications">Vider les notification</button>
        <h4>CONSOLE DES LOG</h4>
        <pre id="console-output"></pre>
        
    </div>

    <div class="sidebar-left-notif" id="notif-page"><button id="clear-notifications">Vider les notification</button>

        <h4>CONSOLE DES notif</h4>
        
        <pre id="notif-output"></pre>
        
    </div>




    <script src="renderer.js"></script>
    <script src="./pop_up.js"></script>

    <script>
        
    </script>
</body>
</html>
