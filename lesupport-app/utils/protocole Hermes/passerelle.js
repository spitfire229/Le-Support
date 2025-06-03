const os = require('os');
const bonjour = require('bonjour')();
const express = require('express');

const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Récupérer le nom de l'ordinateur
const deviceName = os.hostname();

// Démarrer un serveur HTTP pour recevoir des messages
app.post('/message', (req, res) => {
    console.log(`📩 Message reçu de ${req.body.sender}: ${req.body.message}`);
    res.json({ status: 'Message reçu !' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`📡 Serveur actif sur http://${os.networkInterfaces()['Wi-Fi'][0].address}:${PORT}`);
});

// Publier le service sur le réseau
const service = bonjour.publish({ name: `AirDrop-${deviceName}`, type: 'http', port: PORT });

console.log(`🔗 Service publié sous le nom : AirDrop-${deviceName}`);

// Rechercher d'autres appareils
bonjour.find({ type: 'http' }, (service) => {
    console.log(`🔍 Appareil détecté : ${service.name} IP: ${service.referer.address}`);
});

// Nettoyage à la fermeture
process.on('exit', () => {
    service.stop();
    bonjour.destroy();
});
