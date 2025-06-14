├── client /
│   ├── index.html
│   ├── script.js
│   └── style.css
└── server /
    ├── server.py
    └── env /

index.html

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css" />
  <title>Clavier Keypad</title>
  <style>

  </style>
</head>
<body>

  <div class="etat">
    <div id="status-indicator" class="status disconnected"></div>
    <button onclick="location.reload()" id="resetBtn">connection...</button>
    
  </div>
<div id="grid-container"></div>
<script src="./script.js"></script>
</body>
</html>





script.js
 
document.addEventListener("DOMContentLoaded", () => {
  // WebSocket
  const indicator = document.getElementById("status-indicator");
  const resetBtn = document.getElementById('resetBtn');

  const ws = new WebSocket("ws://192.168.1.13:8765");

  ws.onopen = () => {
    console.log("Connecté!");
    indicator.textContent = "Etat :";
    indicator.classList.remove("disconnected", "error");
    indicator.classList.add("connected");
  };

  ws.onclose = () => {
    console.log("Déconnecté!");
    indicator.textContent = "Déconnecté";
    indicator.classList.remove("connected", "error");
    indicator.classList.add("disconnected");
  };

  ws.onerror = (e) => {
    console.log("Erreur :", e);
    indicator.textContent = "Erreur";
    indicator.classList.remove("connected", "disconnected");
    indicator.classList.add("error");
  };

  function shrinkButtonBasedOnStatus(statusClass) {
    resetBtn.classList.add('shrink');
    resetBtn.classList.remove('connected', 'disconnected', 'error');

    if (statusClass) {
      resetBtn.classList.add(statusClass);
    }

    setTimeout(() => {
      resetBtn.textContent = '';
    }, 500);
  }

  // Après 3 secondes, on ne shrink le bouton que si connecté
  setTimeout(() => {
    if (indicator.classList.contains('connected')) {
      shrinkButtonBasedOnStatus('connected');
    }
  }, 1000);

  // Keys
  const keys = [
    { id: '1', x: 0, y: 0 },
    { id: '2', x: 1, y: 0 },
    { id: '3', x: 2, y: 0 },
    { id: '4', x: 3, y: 0 },
    { id: '5', x: 0, y: 1 },
    { id: '6', x: 1, y: 1 },
    { id: '7', x: 2, y: 1 },
    { id: '8', x: 3, y: 1 },
    { id: '9', x: 0, y: 2 },
    { id: '0', x: 1, y: 2 },
    { id: 'enter', x: 2, y: 2 },
    { id: 'backspace', x: 3, y: 2 },
  ];

  const gridContainer = document.getElementById('grid-container');

  let isDragging = false;
  let draggedKey = null;
  let ghostKey = null;
  let offsetX = 0;
  let offsetY = 0;
  let dragTimer = null;

  function savePositions() {
    localStorage.setItem('keyPositions', JSON.stringify(keys));
  }

  function loadPositions() {
    const saved = localStorage.getItem('keyPositions');
    if (saved) {
      const savedKeys = JSON.parse(saved);
      keys.forEach(k => {
        const savedKey = savedKeys.find(sk => sk.id === k.id);
        if (savedKey) {
          k.x = savedKey.x;
          k.y = savedKey.y;
        }
      });
    }
  }

  function renderKeys() {
    gridContainer.innerHTML = '';
    keys
      .sort((a, b) => (a.y * 10 + a.x) - (b.y * 10 + b.x))
      .forEach(k => {
        const keyElem = document.createElement('div');
        keyElem.classList.add('key');
        keyElem.textContent = k.id;
        keyElem.dataset.id = k.id;
        gridContainer.appendChild(keyElem);
      });
  }

  gridContainer.addEventListener('mousedown', e => {
    if (!e.target.classList.contains('key')) return;

    const keyElem = e.target;

    dragTimer = setTimeout(() => {
      isDragging = true;
      draggedKey = keyElem;

      const rect = draggedKey.getBoundingClientRect();
      offsetX = rect.width / 2;
      offsetY = rect.height / 2;

      ghostKey = keyElem.cloneNode(true);
      ghostKey.classList.add('dragging');
      ghostKey.style.width = `${rect.width}px`;
      ghostKey.style.height = `${rect.height}px`;
      ghostKey.style.left = `${e.clientX - offsetX}px`;
      ghostKey.style.top = `${e.clientY - offsetY}px`;
      document.body.appendChild(ghostKey);
    }, 500);
  });

  document.addEventListener('mousemove', e => {
    if (isDragging && ghostKey) {
      ghostKey.style.left = `${e.clientX - offsetX}px`;
      ghostKey.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', e => {
    if (dragTimer) {
      clearTimeout(dragTimer);
      dragTimer = null;
    }

    if (isDragging && draggedKey) {
      const rect = gridContainer.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / 100);
      const y = Math.floor((e.clientY - rect.top) / 100);

      if (x >= 0 && y >= 0 && !keys.some(k => k.x === x && k.y === y)) {
        const id = draggedKey.dataset.id;
        const key = keys.find(k => k.id === id);
        key.x = x;
        key.y = y;
        savePositions();
      }

      if (ghostKey) {
        document.body.removeChild(ghostKey);
        ghostKey = null;
      }

      draggedKey = null;
      isDragging = false;

      renderKeys();
    } else if (e.target.classList.contains('key')) {
      const id = e.target.dataset.id;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(id);
        console.log("Envoyé :", id);
      }
    }
  });

  resetBtn.addEventListener('click', () => {
    keys.forEach((k, i) => {
      k.x = i % 4;
      k.y = Math.floor(i / 4);
    });
    savePositions();
    renderKeys();
  });

  loadPositions();
  renderKeys();

});



style.css

body {
  font-family: sans-serif;
  text-align: center;
}

.keypad button {
  width: 60px;
  height: 60px;
  margin: 5px;
  font-size: 24px;
  cursor: pointer;
}
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; /* centrage vertical */
      background: #222;
      color: #eee;
      font-family: sans-serif;
      height: 100vh;
      margin: 0;
      background-image: url('./fond.jpg');
      background-size: cover;
      background-position: center;
    }
    .etat
    {
      display: flex;
      position: absolute;
      top: 10px;
      left: 15px;
    }

    #resetBtn {
      margin: 10px;
      padding: 5px 10px;
      font-size: 1rem;
      cursor: pointer;
    }

    #grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, 90px);
      gap: 10px;
      justify-content: center;
      background: #444;
      padding: 10px;
      border-radius: 10px;
      width: 550px;
      max-width: 90vw;
      max-height: 80vh;
      min-width: calc(4 * 90px + 3 * 10px); /* 4 colonnes + 3 gaps */
      min-height: calc(3 * 90px + 2 * 10px); /* 3 lignes + 2 gaps */
      resize: both;
      overflow: auto;
    }

    .key {
      width: 90px;
      height: 90px;
      background: #666;
      color: #fff;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: background 0.2s;
      z-index: 1;
    }

    .key:hover {
      background: #888;
    }

    .dragging {
      position: absolute;
      pointer-events: none;
      z-index: 999;
      opacity: 0.9;
      background: #aaa;
    }

#resetBtn {
  transition: all 0.5s ease;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 50px;
  background-color: #ff7b00;
  color: black;
  border: none;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  max-height: 40px;
}

#resetBtn.shrink {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  font-size: 0;
  color: transparent;
}
#resetBtn.connected {
  background-color: #4caf50; /* vert */
}
#resetBtn.disconnected {
  background-color: #f44336; /* rouge */
}
#resetBtn.error {
  background-color: #ff9800; /* orange */
}


#resetBtn.shrink {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0;
  color: transparent;
  transition: all 1.5s ease;
}

/* Couleurs selon statut */
#resetBtn.connected {
  background-color: #4caf50; /* vert */
}

#resetBtn.disconnected {
  background-color: #f44336; /* rouge */
}

#resetBtn.error {
  background-color: #ff9800; /* orange */
}


server.py

# server/server.py
import asyncio
import websockets
import keyboard

async def handle_client(websocket):  # plus de `path`
    print("Client connecté !")
    try:
        async for message in websocket:
            print(f"Reçu : {message}")
            # Envoie la touche reçue au clavier
            if len(message) == 1:
                keyboard.press_and_release(message)
            elif message == "enter":
                keyboard.press_and_release("enter")
            elif message == "backspace":
                keyboard.press_and_release("backspace")
            else:
                print(f"Touche non prise en charge : {message}")
    except websockets.exceptions.ConnectionClosed:
        print("Client déconnecté.")

async def main():
    async with websockets.serve(handle_client, "0.0.0.0", 8765):
        print("Serveur en attente sur ws://0.0.0.0:8765 ...")
        await asyncio.Future()  # Attend indéfiniment

if __name__ == "__main__":
    asyncio.run(main())
