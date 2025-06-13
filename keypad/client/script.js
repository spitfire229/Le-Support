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
