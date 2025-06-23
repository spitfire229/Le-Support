const socket = new WebSocket(`ws://${location.host}`);

const modeSelector = document.getElementById('modeSelector');
const buttonsMode = document.getElementById('buttonsMode');
const trackpadMode = document.getElementById('trackpadMode');
const trackpadArea = document.getElementById('trackpadArea');

// Changer de mode
modeSelector.addEventListener('change', () => {
  const mode = modeSelector.value;
  buttonsMode.style.display = mode === 'buttons' ? 'block' : 'none';
  trackpadMode.style.display = mode === 'trackpad' ? 'block' : 'none';
});

// Boutons
document.querySelectorAll('#buttonsMode button').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    socket.send(JSON.stringify({ type: 'command', cmd }));
  });
});



// Trackpad
let lastX = null;
let lastY = null;
let sensitivity = 1.0;

const sensitivitySlider = document.getElementById('sensitivity');
const sensValueDisplay = document.getElementById('sensValue');

sensitivitySlider.addEventListener('input', () => {
  sensitivity = parseFloat(sensitivitySlider.value);
  sensValueDisplay.textContent = sensitivity.toFixed(1);
});

// Au début du toucher on initialise lastX, lastY
trackpadArea.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  lastX = touch.clientX;
  lastY = touch.clientY;
});

let lastSentTime = 0;
const throttleDelay = 33; // environ 30 fois par seconde

// Au déplacement on calcule dx/dy, on multiplie par sensitivity
trackpadArea.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  if (lastX === null || lastY === null) {
    lastX = touch.clientX;
    lastY = touch.clientY;
  }

  let dx = (touch.clientX - lastX) * sensitivity;
  let dy = (touch.clientY - lastY) * sensitivity;

  socket.send(JSON.stringify({ type: 'move', dx, dy }));

  lastX = touch.clientX;
  lastY = touch.clientY;

  e.preventDefault();
}, { passive: false });

// Reset lastX/Y à la fin du toucher
trackpadArea.addEventListener('touchend', () => {
  lastX = null;
  lastY = null;
});
let lastTap = 0;
const doubleTapDelay = 300; // 300 ms max entre 2 taps pour un double tap

trackpadArea.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < doubleTapDelay) {
    // Double tap détecté -> clic droit
    socket.send(JSON.stringify({ type: 'click', button: 'right' }));
    lastTap = 0; // reset
  } else {
    // Tap simple -> clic gauche (avec délai pour vérifier si c'est un double tap)
    lastTap = now;

    // Attendre un peu avant d'envoyer le clic gauche (pour voir si un 2e tap arrive)
    setTimeout(() => {
      if (Date.now() - lastTap >= doubleTapDelay && lastTap !== 0) {
        socket.send(JSON.stringify({ type: 'click', button: 'left' }));
        lastTap = 0;
      }
    }, doubleTapDelay);
  }
});

const modes = {
  buttons: document.getElementById('buttonsMode'),
  trackpad: document.getElementById('trackpadMode'),
  keypad: document.getElementById('keypadMode')
};

modeSelector.addEventListener('change', (e) => {
  Object.values(modes).forEach(m => m.style.display = 'none');
  const selected = e.target.value;
  if (modes[selected]) modes[selected].style.display = 'block';
});

// Initialisation WebSocket
const ws = new WebSocket(`ws://${location.hostname}:3000`);
ws.onopen = () => console.log('✅ WebSocket connecté');

function sendCommand(cmd) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'command', cmd }));
  }
}

// Gestion boutons fixes
document.querySelectorAll('#buttonsMode button').forEach(btn => {
  btn.addEventListener('click', () => sendCommand(btn.dataset.cmd));
});

// 🎯 Keypad par défaut + édition
const keypadGrid = document.getElementById('keypadGrid');
const editKeypadBtn = document.getElementById('editKeypad');

// Commandes par défaut
const defaultKeypad = [
  { label: "Lecture", cmd: "play" },
  { label: "Pause", cmd: "pause" },
  { label: "Volume +", cmd: "volume-up" },
  { label: "Volume -", cmd: "volume-down" },
  { label: "Avancer", cmd: "forward" },
  { label: "Reculer", cmd: "rewind" },
  { label: "Plein écran", cmd: "fullscreen" },
  { label: "Échap", cmd: "escape" }
];

function loadKeypadButtons() {
  const stored = JSON.parse(localStorage.getItem('keypadButtons') || 'null');
  const buttons = stored || defaultKeypad;

  keypadGrid.innerHTML = '';
  buttons.forEach((btn, i) => {
    const b = document.createElement('button');
    b.textContent = btn.label;
    b.onclick = () => sendCommand(btn.cmd);
    keypadGrid.appendChild(b);
  });

  if (!stored) {
    localStorage.setItem('keypadButtons', JSON.stringify(defaultKeypad));
  }
}

editKeypadBtn.addEventListener('click', () => {
  const buttons = JSON.parse(localStorage.getItem('keypadButtons') || '[]');
  const label = prompt("Nom du bouton :");
  const cmd = prompt("Commande à envoyer :");

  if (label && cmd) {
    buttons.push({ label, cmd });
    localStorage.setItem('keypadButtons', JSON.stringify(buttons));
    loadKeypadButtons();
  }
});

loadKeypadButtons();


