const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const { exec } = require('child_process');


//test
let mainWindow;


const https = require('https');
const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'version.json'); // Fichier local de version
const updateUrl = "https://lesupport.me/lesupport.app/update.json"; // URL du fichier update.json

// Fonction pour lire la version actuelle du programme
function getCurrentVersion() {
    if (fs.existsSync(versionFilePath)) {
        try {
            const versionData = fs.readFileSync(versionFilePath, 'utf-8');
            return JSON.parse(versionData).currentVersion;
        } catch (error) {
            console.error("Erreur de lecture du fichier version.json :", error);
            return "0.0.0"; // Valeur par défaut si erreur
        }
    } else {
        console.warn("⚠️ version.json introuvable. Création avec version 0.0.0.");
        updateLocalVersion("0.0.0"); // Création du fichier si absent
        return "0.0.0";
    }
}

ipcMain.on('launch-hermes', (event) => {
    const hermesPath = path.join(__dirname, 'utils', 'protocole Hermes', 'index.html');

    if (!fs.existsSync(hermesPath)) {
        console.error("❌ Erreur : Fichier Hermes introuvable :", hermesPath);
        event.sender.send('update-mid-bar', "about:blank"); // Nettoie l'iframe en cas d'erreur
        return;
    }

    console.log("📂 Envoi de l'URL de Hermes :", `file://${hermesPath}`);
    event.sender.send('update-mid-bar', `file://${hermesPath}`);
});



// Fonction pour mettre à jour la version locale après la mise à jour
function updateLocalVersion(newVersion) {
    try {
        fs.writeFileSync(versionFilePath, JSON.stringify({ currentVersion: newVersion }, null, 2));
        console.log(`✅ Fichier version.json mis à jour avec la version ${newVersion}`);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de version.json :", error);
    }
}

// Fonction pour télécharger un fichier et le remplacer dans l'application
function downloadFile(fileUrl, savePath, callback) {
    const file = fs.createWriteStream(savePath);
    https.get(fileUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
            file.close(() => {
                console.log(`📥 Fichier mis à jour : ${savePath}`);
                callback();
            });
        });
    }).on("error", (err) => {
        console.error(`❌ Erreur de téléchargement pour ${fileUrl}:`, err);
    });
}

// Vérifier si une mise à jour est nécessaire
function checkForUpdates() {
    https.get(updateUrl, (res) => {
        let data = "";
        res.on("data", chunk => { data += chunk; });
        res.on("end", () => {
            try {
                const updateInfo = JSON.parse(data);
                const latestVersion = updateInfo.latestVersion;
                const filesToUpdate = updateInfo.files;
                const currentVersion = getCurrentVersion();

                console.log(`🔍 Version actuelle : ${currentVersion}, Dernière version disponible : ${latestVersion}`);

                if (currentVersion < latestVersion) { // Vérifie si la version actuelle est inférieure
                    let fileList = filesToUpdate.map(file => `- ${file.path}`).join("\n");

                    dialog.showMessageBox({
                        type: "info",
                        buttons: ["Mettre à jour", "Ignorer"],
                        title: "Mise à jour disponible",
                        message: `Une nouvelle version (${latestVersion}) est disponible.\nLes fichiers suivants seront mis à jour :\n${fileList}`
                    }).then(result => {
                        if (result.response === 0) { // L'utilisateur accepte la mise à jour
                            let downloadedFiles = 0;
                            filesToUpdate.forEach(file => {
                                const savePath = path.join(__dirname, file.path);
                                downloadFile(file.url, savePath, () => {
                                    downloadedFiles++;
                                    if (downloadedFiles === filesToUpdate.length) {
                                        updateLocalVersion(latestVersion); // 🔴 Mise à jour après téléchargement de tous les fichiers
                                        dialog.showMessageBox({
                                            type: "info",
                                            buttons: ["OK"],
                                            title: "Mise à jour terminée",
                                            message: "Les fichiers ont été mis à jour avec succes ;). Cependant votre programme fonctionne toujours sur une version anterieure, vous pouvez redémarrer votre application pour béneficier des nouveautées."
                                        });
                                    }
                                });
                            });
                        }
                    });
                } else {
                    console.log("✅ Le programme est déjà à jour.");
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des mises à jour :", error);
            }
        });
    }).on("error", err => console.error("❌ Erreur réseau :", err));
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
            webSecurity: false,  // Désactiver la restriction CORS pour fichiers locaux
            contextIsolation: false,
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
        width: 1500,
        height: 600,
        title: 'Crédits',
        modal: true,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true
        }
    });

    creditsWindow.loadURL('data:text/html/css;charset=utf-8,' + encodeURIComponent(`
       
        

,--.   ,------.                                                
|  |   |  .---'                                                
|  |   |   --,                                                 
|  '--.|   ---.                                                
 -----' ------'                                                
 ,---.  ,--. ,--.,------. ,------.  ,-----. ,------. ,--------.
'   .-' |  | |  ||  .--. '|  .--. ''  .-.  '|  .--. ''--.  .--'
 .   -. |  | |  ||  '--' ||  '--' ||  | |  ||  '--'.'   |  |   
.-'    |'  '-'  '|  | --' |  | --' '  '-'  '|  |\  \    |  |   
 -----'   -----'  --'      --'       -----'  --' '--'    --'   
           

Credits du programme "Le Support"
Nom du logiciel : Le Support
Version : [1.0.0]
Developpeur principal : Charles Kremer
Date de creation : BETA VERSION :2023



Permission est accordee, gratuitement, a toute personne obtenant une copie de ce logiciel et des fichiers 
de documentation associes (le "Logiciel"), d'utiliser le Logiciel sans restriction, y compris sans limitation 
les droits d'utiliser, copier, modifier, fusionner, publier, distribuer, sous-licencier et/ou vendre des copies
 du Logiciel, et de permettre aux personnes a qui le Logiciel est fourni de le faire, sous reserve des 
 conditions suivantes :

La notice de droit d'auteur ci-dessus et la presente notice de permission doivent etre incluses dans toutes 
copies ou parties substantielles du Logiciel.

LE LOGICIEL EST FOURNI "EN L'ETAT", SANS GARANTIE D'AUCUNE SORTE, EXPLICITE OU IMPLICITE, Y COMPRIS MAIS SANS 
S'Y LIMITER AUX GARANTIES DE QUALITE MARCHANDE, D'ADEQUATION A UN USAGE PARTICULIER ET D'ABSENCE DE CONTREFAÇON. 
EN AUCUN CAS LES AUTEURS OU LES DETENTEURS DES DROITS D'AUTEUR NE POURRONT ETRE TENUS RESPONSABLES DE TOUTE 
RECLAMATION, DOMMAGE OU AUTRE RESPONSABILITE, QUE CE SOIT DANS LE CADRE D'UNE ACTION CONTRACTUELLE, DELICTUELLE 
OU AUTRE, EN PROVENANCE DE, PAR SUITE DE OU EN RAPPORT AVEC LE LOGICIEL OU L'UTILISATION OU AUTRES MANIEMENTS 
DUDIT LOGICIEL.




Developpement et realisation
Ce programme est entierement concu, developpe et maintenu par Charles Kremer, etudiant  de droit a l'universite Paris Nanterre.

Le developpement a ete realise en autonomie, depuis la phase de conception jusqu'a la mise en production, avec une attention particuliere portee a l'accessibilite, a l'ergonomie et a la fiabilite.

Technologies utilisees
Le Support repose sur une combinaison de technologies modernes et efficaces, notamment :

Electron.js pour l'interface et la creation de l'application de bureau multiplateforme

Node.js pour la logique cote serveur

HTML / CSS / JavaScript pour la structure et l'apparence de l'application




Design et interface
L'interface utilisateur a ete concue pour etre simple, intuitive et agreable, avec un style epure inspire des principes de minimalisme numerique.
Tous les elements graphiques ont ete realises sur mesure, sauf mention contraire ci-dessous.

génération : adobe illustrator

Medias, icones et ressources graphiques

-   Icones : lesupport.me

-   Polices : sans-serif

-   Sons ou animations : lesupport.me


Licence
Ce logiciel est distribue sous la licence suivante : Usage prive uniquement 

Merci de respecter les conditions d'utilisation et de ne pas redistribuer ou modifier ce logiciel sans autorisation prealable si aucune licence libre n'est mentionnee.

Contact
Pour toute question, suggestion ou contribution :
Email : charlesjonathankremer@gmail.com
Site / Depot : https://github.com/spitfire229/Le-Support

                             ******************                             
                       ******************************                       
                   **************************************                   
                ***************               **************                
              ***********                          ***********              
            **********                                 *********            
          *********                                      *********          
        ********                                            ********        
       *******                                                *******       
      *******                      *****      **               *******      
     ******                    *****************                 *******    
   *******                  ********   *********                  *******   
   ******                  *****           ******                  ******   
  ******                  ******            *****                   ******  
  *****                   *****              ****                    ****** 
 ******                   *****               **                     ****** 
******                    ******                                      ******
******                     ********                                   ******
******                      ***********                               ******
******                        *************                           ******
******                           *************                        ******
******                               ***********                      ******
******                                   ********                     ******
******                                     *******                    ******
******                     **                *****                    ******
 ******                   ***                ******                  ****** 
 ******                   ****               *****                   ****** 
  ******                  *****              *****                  ******  
   ******                  ******           *****                  ******   
   *******                 **********   ********                  *******   
     ******                *******************                   *******    
      *******               *       ******                     *******      
       *******                                                *******       
        ********                                            ********        
          *********                                      *********          
            *********                                  *********            
              ***********                          ***********              
                **************                **************                
                   **************************************                   
                       ******************************                       
                             ******************                             
 _               _____                                    _
| |             / ____|                                  | |
| |       ___  | (___   _   _  _ __   _ __    ___   _ __ | |_     _ __ ___    ___
| |      / _ \  \___ \ | | | || '_ \ | '_ \  / _ \ |  __|| __|   | '_   _ \  / _ \
| |____ |  __/  ____) || |_| || |_) || |_) || (_) || |   | |_  _ | | | | | ||  __/
|______| \___| |_____/  \__,_|| .__/ | .__/  \___/ |_|    \__|(_)|_| |_| |_| \___|
                              | |    | |
--   ______  __                  __                        __  __
--  |      ||  |--..---.-..----.|  |.-----..-----.        |  |/  |.----..-----..--------..-----..----.
--  |   ---||     ||  _  ||   _||  ||  -__||__ --|        |     < |   _||  -__||        ||  -__||   _|
--  |______||__|__||___._||__|  |__||_____||_____|        |__|\__||__|  |_____||__|__|__||_____||__|
--                                                
*/

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


