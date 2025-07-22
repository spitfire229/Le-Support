// main.js
const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const os = require('os');
const bonjour = require('bonjour')();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const progressStream = require('progress-stream');
const prompt = require('electron-prompt'); // Pour saisir le message à envoyer

let mainWindow;
const PORT = 3000;
const deviceName = os.hostname();
let detectedDevices = [];

// Fonction pour récupérer l'adresse IP locale
function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

const localIp = getLocalIp();

// Création de la fenêtre principale
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
}

// Démarrer le serveur Express pour recevoir des messages et fichiers
const appServer = express();
appServer.use(express.json());

// Configuration du stockage des fichiers reçus
const uploadFolder = path.join(os.homedir(), 'Documents', 'Hermes');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}
const storage = multer.diskStorage({
    destination: uploadFolder,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Endpoint pour recevoir un fichier ou un dossier compressé
appServer.post('/upload', upload.single('file'), (req, res) => {
    console.log(`📁 Fichier reçu: ${req.file.originalname}`);
    const receivedFilePath = path.join(uploadFolder, req.file.originalname);

    // Vérifie si c'est un ZIP et décompresse
    if (req.file.originalname.endsWith('.zip')) {
        const zip = new AdmZip(receivedFilePath);
        const extractPath = path.join(uploadFolder, req.file.originalname.replace('.zip', ''));
        zip.extractAllTo(extractPath, true);
        fs.unlinkSync(receivedFilePath);
        console.log(`📂 Dossier extrait: ${extractPath}`);
    }
    
    // Affiche le dossier contenant les fichiers reçus
    shell.openPath(uploadFolder);
    res.json({ status: 'Fichier ou dossier reçu !', filename: req.file.originalname });
});

// Endpoint pour recevoir un message
appServer.post('/message', (req, res) => {
    console.log(`📩 Message reçu de ${req.body.sender}: ${req.body.message}`);
    
    // Affichage d'une notification sur le récepteur
    new Notification({
        title: `Message de ${req.body.sender}`,
        body: req.body.message
    }).show();
    
    res.json({ status: 'Message reçu !' });
});

appServer.listen(PORT, () => {
    console.log(`📡 Serveur actif sur http://${localIp}:${PORT}`);
});

// Publier le service Bonjour
bonjour.publish({ name: `AirDrop-${deviceName}`, type: 'http', port: PORT });
console.log(`🔗 Service publié sous le nom : AirDrop-${deviceName}`);

// Détecter les autres appareils
bonjour.find({ type: 'http' }, (service) => {
    console.log('Service trouvé:', service);
    if (service.referer && service.referer.address) {
        const deviceIp = service.referer.address;
        if (!detectedDevices.some(d => d.ip === deviceIp)) {
            detectedDevices.push({ name: service.name, ip: deviceIp });
            console.log(`🔍 Appareil détecté : ${service.name} IP: ${deviceIp}`);
            if (mainWindow) {
                mainWindow.webContents.send('update-devices', detectedDevices);
            }
        }
    }
});

// Fonction d'envoi de fichiers et dossiers
function sendFileOrFolder(filePath, deviceIp) {
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
        const zipPath = `${filePath}.zip`;
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        // Simulation de progression (facultative) pour visualiser l'effet
        let simulatedProgress = 0;
        let interval = setInterval(() => {
            simulatedProgress = Math.min(simulatedProgress + 5, 95);
            if (mainWindow) {
                mainWindow.webContents.send('upload-progress', simulatedProgress);
            }
        }, 100);

        // Suivi réel du zippage
        archive.on('progress', (progressData) => {
            let percent = 0;
            if (progressData.fs.totalBytes > 0) {
                percent = (progressData.fs.processedBytes / progressData.fs.totalBytes) * 100;
            } else if (progressData.entries.total > 0) {
                percent = (progressData.entries.processed / progressData.entries.total) * 100;
            }
            if (percent > simulatedProgress && mainWindow) {
                simulatedProgress = percent;
                mainWindow.webContents.send('upload-progress', simulatedProgress);
            }
        });

        output.on('close', () => {
            clearInterval(interval);
            if (mainWindow) {
                mainWindow.webContents.send('upload-progress', 100);
            }
            const formData = new FormData();
            formData.append('file', fs.createReadStream(zipPath));
            sendRequest(zipPath, deviceIp, formData);
        });

        archive.pipe(output);
        archive.directory(filePath, false);
        archive.finalize();
    } else {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        sendRequest(filePath, deviceIp, formData);
    }
}

function sendRequest(filePath, deviceIp, formData) {
    // Envoyer le nom du fichier au renderer
    if (mainWindow) {
        mainWindow.webContents.send('upload-file-name', path.basename(filePath));
    }
    
    const fileStat = fs.statSync(filePath);
    const totalBytes = fileStat.size;

    // Créer un stream de lecture avec progress-stream pour suivre l'envoi
    const fileReadStream = fs.createReadStream(filePath);
    const progress = progressStream({
        length: totalBytes,
        time: 100 // émet un événement toutes les 100ms
    });

    progress.on('progress', function (progressData) {
        if (mainWindow) {
            mainWindow.webContents.send('upload-progress', progressData.percentage);
        }
    });

    const streamWithProgress = fileReadStream.pipe(progress);
    const newFormData = new FormData();
    newFormData.append('file', streamWithProgress, {
        filename: path.basename(filePath),
        knownLength: totalBytes
    });

    axios.post(`http://${deviceIp}:3000/upload`, newFormData, {
        headers: newFormData.getHeaders()
    })
    .then(response => {
        console.log(`✅ Envoi réussi: ${filePath}`);
        if (mainWindow) {
            mainWindow.webContents.send('upload-progress', 100);
        }
    })
    .catch(err => console.error('❌ Erreur d’envoi:', err));
}

app.whenReady().then(createWindow);

ipcMain.on('request-device-list', (event) => {
    if (mainWindow) {
        mainWindow.webContents.send('update-devices', detectedDevices);
    }
});

// Pour envoyer un fichier
ipcMain.on('send-file', (event, deviceIp) => {
    dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory', 'multiSelections']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            result.filePaths.forEach(filePath => sendFileOrFolder(filePath, deviceIp));
        }
    }).catch(err => console.error(err));
});

// Pour envoyer un message
ipcMain.on('send-message', (event, deviceIp) => {
    prompt({
        title: 'Envoyer un message',
        label: 'Message :',
        inputAttrs: {
            type: 'text'
        },
        type: 'input'
    }).then((message) => {
        if (message === null) {
            console.log('Message annulé');
        } else {
            axios.post(`http://${deviceIp}:3000/message`, {
                sender: deviceName,
                message: message
            })
            .then(response => {
                console.log(`✅ Message envoyé à ${deviceIp}`);
            })
            .catch(err => console.error('❌ Erreur lors de l’envoi du message:', err));
        }
    }).catch(console.error);
});
