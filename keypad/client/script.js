// script.js
let ws;

function connect() {
  // Remplace par l'IP de ton PC
  ws = new WebSocket("ws://192.168.1.10:8765");

  ws.onopen = () => console.log("Connecté au serveur !");
  ws.onclose = () => console.log("Déconnecté !");
  ws.onerror = (e) => console.log("Erreur : ", e);
}

function send(key) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(key);
  } else {
    console.log("Non connecté !");
  }
}

connect();
