document.addEventListener('keydown', (event) => {
    console.log(`Touche appuyée : ${event.key}`);
    
    // Exemple : envoi à Electron via IPC si besoin
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('key-pressed', event.key);
});
