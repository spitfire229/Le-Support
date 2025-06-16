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

function createKeypadButton(text, command) {
  const button = document.createElement('button');
  button.textContent = text;
  button.dataset.command = command;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.classList.add('keypad-remove');
  removeBtn.title = 'Supprimer';

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    button.remove(); // supprime le bouton entier
  });

  button.appendChild(removeBtn);
  return button;
}

// Lorsqu'une commande est sélectionnée
document.querySelectorAll('#commandList li').forEach(item => {
  item.addEventListener('click', () => {
    const commandText = item.textContent;
    const command = item.getAttribute('data-command');

    const newButton = createKeypadButton(commandText, command);
    document.getElementById('keypadGrid').appendChild(newButton);

    document.getElementById('commandList').classList.add('hidden');
  });
});

// Pour les boutons existants : ajout du bouton de suppression
document.querySelectorAll('#keypadGrid button').forEach(button => {
  if (!button.querySelector('.keypad-remove')) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.classList.add('keypad-remove');
    removeBtn.title = 'Supprimer';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      button.remove();
    });
    button.appendChild(removeBtn);
  }
});
