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
