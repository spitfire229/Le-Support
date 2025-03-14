const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const { exec } = require('child_process');

//test
let mainWindow;

const { dialog } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json'); // Lire la version actuelle de l'application
const updateUrl = "https://lesupport.me/update.json"; // URL du fichier update.json

function downloadFile(fileUrl, savePath, callback) {
    const file = fs.createWriteStream(savePath);
    https.get(fileUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
            file.close(callback);
        });
    }).on("error", (err) => {
        console.error(`Erreur de téléchargement pour ${fileUrl}:`, err);
    });
}

function checkForUpdates() {
    https.get(updateUrl, (res) => {
        let data = "";
        res.on("data", chunk => { data += chunk; });
        res.on("end", () => {
            try {
                const updateInfo = JSON.parse(data);
                const latestVersion = updateInfo.latestVersion;
                const filesToUpdate = updateInfo.files;

                if (latestVersion !== packageJson.version) {
                    let fileList = filesToUpdate.map(file => `- ${file.path}`).join("\n");

                    dialog.showMessageBox({
                        type: "info",
                        buttons: ["Mettre à jour", "Ignorer"],
                        title: "Mise à jour disponible",
                        message: `Nouvelle version disponible (${latestVersion}) !\nLes fichiers suivants seront mis à jour :\n${fileList}`
                    }).then(result => {
                        if (result.response === 0) { // L'utilisateur accepte la mise à jour
                            filesToUpdate.forEach(file => {
                                const savePath = path.join(__dirname, file.path);
                                downloadFile(file.url, savePath, () => {
                                    console.log(`${file.path} mis à jour !`);
                                });
                            });

                            dialog.showMessageBox({
                                type: "info",
                                buttons: ["OK"],
                                title: "Mise à jour terminée",
                                message: "Les fichiers ont été mis à jour. Veuillez redémarrer l'application."
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des mises à jour :", error);
            }
        });
    }).on("error", err => console.error("Erreur réseau :", err));
}

// Vérifier la mise à jour au démarrage
app.whenReady().then(() => {
    checkForUpdates();
    createMainWindow();
});


function createMainWindow() {
    if (mainWindow) return;

    mainWindow = new BrowserWindow({
        width: 1500,
        height: 800,
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
                    label: 'Ctrl + F → Ouvrir la barre de recherche',
                    accelerator: 'Ctrl+F',
                    click: () => {
                        mainWindow.webContents.send('focus-search-bar');
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

