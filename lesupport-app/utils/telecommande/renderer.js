window.electronAPI.handleCommand((_event, command) => {
  console.log('Commande reçue :', command);
  if (command === 'play') {
    // Exécute l'action de lecture
  }
});
const { ipcRenderer } = require('electron');

document.getElementById('telecommande-btn').addEventListener('click', () => {
  ipcRenderer.send('open-telecommande');
});
