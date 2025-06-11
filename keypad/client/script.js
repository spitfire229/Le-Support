let ws;

function connect() {
  ws = new WebSocket("ws://192.168.1.13");

  ws.onopen = () => {
    console.log("Connecté au serveur !");
    document.body.style.backgroundColor = "lightgreen"; // Ajoute un indicateur visuel
  };
  ws.onclose = () => {
    console.log("Déconnecté !");
    document.body.style.backgroundColor = "lightcoral";
  };
  ws.onerror = (e) => {
    console.log("Erreur : ", e);
    document.body.style.backgroundColor = "orange";
  };
}

function send(key) {
  console.log("Envoi : ", key);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(key);
  } else {
    console.log("Non connecté !");
  }
}

connect();
