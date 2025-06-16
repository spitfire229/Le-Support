addon/
├── main.js         ← process principal Electron
├── preload.js      ← communication entre main et renderer
├── renderer.js     ← logique frontend de l'app
├── telecommande/   ← interface téléphone
│   ├── index.html
│   ├── script.js
│   └── style.css
├── package.json
└── env / 

main.js : 

const { app, BrowserWindow } = require('electron');
const path = require('path');
const httpServer = require('./server');

function createWindow() {
  const win = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  httpServer(); // démarre le serveur web (contrôle distant)
  createWindow();
});
const { ipcMain, BrowserWindow } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
}

// Et dans le ws.on('message', ...) du server.js
if (mainWindow) {
  mainWindow.webContents.send('telecommande-command', msg.toString());
}



server.js : 

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');
const robot = require('robotjs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Obtenir l'adresse IP locale
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Servir la télécommande statique
app.use('/telecommande', express.static(path.join(__dirname, 'telecommande')));

// Gestion WebSocket
wss.on('connection', (ws) => {
  console.log('Télécommande connectée');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'command') {
        console.log('Commande bouton :', msg.cmd);
        // Ici gérer les commandes spécifiques (ex: play, pause, etc.)
      } else if (msg.type === 'move') {
        console.log(`Déplacement : dx=${msg.dx}, dy=${msg.dy}`);

        // Récupérer position souris actuelle
        const pos = robot.getMousePos();

        // Calculer nouvelle position avec bornes écran
        const screenSize = robot.getScreenSize();
        let newX = Math.min(Math.max(pos.x + msg.dx, 0), screenSize.width - 1);
        let newY = Math.min(Math.max(pos.y + msg.dy, 0), screenSize.height - 1);

        // Déplacer la souris
        robot.moveMouse(newX, newY);
      } else if (msg.type === 'click') {
        if (msg.button === 'left') {
          robot.mouseClick('left');
        } else if (msg.button === 'right') {
          robot.mouseClick('right');
        }
      }
    } catch (err) {
      console.log('Message invalide :', data.toString());
    }
  });
});

// Démarrage serveur et affichage QR code
server.listen(3000, async () => {
  const ip = getLocalIP();
  const url = `http://${ip}:3000/telecommande`;

  console.log(`✅ Serveur en écoute sur ${url}`);

  try {
    const qr = await QRCode.toString(url, { type: 'terminal' });
    console.log('\n📱 Scanne ce QR code avec ton téléphone pour te connecter :\n');
    console.log(qr);
  } catch (err) {
    console.error('Erreur génération QR code :', err);
  }
});


index.html : 


<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Télécommande</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
    <img class="logo" src="./logo .png" alt="">
  <h1>joyeuse fete des peres</h1>

  <select id="modeSelector">
    <option value="buttons">🎛️ Mode Boutons</option>
    <option value="trackpad"><img class="icon" src="./trackpad.svg" alt=""> Mode Trackpad</option>
  </select>

<div id="buttonsMode" class="mode">
  <button data-cmd="play">
    <img class="icon" src="./play.svg" alt="Play Icon" />
    Play
  </button>
  <button data-cmd="pause">
    <img class="icon" src="./stop.svg" alt="Pause Icon" />
    Pause
  </button>
  <button data-cmd="volume-up">
    <img class="icon" src="./volume-up.svg" alt="Volume Up Icon" />
    Volume +
  </button>
  <button data-cmd="volume-down">
    <img class="icon" src="./volume-down.svg" alt="Volume Down Icon" />
    Volume -
  </button>
</div>


  <div id="trackpadMode" class="mode" style="display: none;">
    <label for="sensitivity">Sensibilité souris : <span id="sensValue">1.0</span></label><br/>
    <input type="range" id="sensitivity" min="0.1" max="5" step="0.1" value="1" />

    <div id="trackpadArea"><img class="trackpad" src="./trackpad.svg" alt=""> Déplace ton doigt ici</div>
    
  </div>

  <script src="script.js"></script>
</body>
</html>
