function checkAuth() {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
    return false;
  }
  const currentUser = localStorage.getItem('currentUser');
  document.getElementById('currentUserName').textContent = 'Connecté: ' + currentUser;
  return true;
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;
  document.getElementById('logoutBtn').addEventListener('click', logout);
  diffBtns.forEach(btn => btn.disabled = true);
  await loadGameData();
  diffBtns.forEach(btn => btn.disabled = false);
});

let gages, levelMeta, endMsgs, bons;

async function loadGameData() {
  try {
    const response = await fetch('questions.json');
    const data = await response.json();
    gages = data.gages;
    levelMeta = data.levelMeta;
    endMsgs = data.endMsgs;
    bons = data.bons || [];
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }
}

let level = null, deck = [], idx = 0, flipped = false, busy = false, isBonus = false;

const $ = id => document.getElementById(id);
const diffBtns     = document.querySelectorAll('.diff-btn');
const diffSection  = $('difficulty-section');
const gameArea     = $('game-area');
const endScreen    = $('end-screen');
const card         = $('card');
const levelBadge   = $('level-badge');
const progressInfo = $('progress-info');
const cardQuestion = $('card-question');
const cardTag      = $('card-tag');
const cardNum      = $('card-num');
const cardPips     = $('card-pips');
const btnNext      = $('btn-next');
const btnRestart   = $('btn-restart');
const btnEndReplay = $('btn-end-replay');
const btnEndMenu   = $('btn-end-menu');
const endTitle     = $('end-title');
const endText      = $('end-text');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderPips(n) {
  cardPips.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const d = document.createElement('div');
    d.className = 'level-pip' + (i < n ? ' filled' : '');
    cardPips.appendChild(d);
  }
}

function shouldShowBonus() {
  return Math.random() < 0.1 && bons.length > 0;
}

function loadCard(i) {
  const q = deck[i];
  isBonus = shouldShowBonus();
  if (isBonus) {
    const bonus = bons[Math.floor(Math.random() * bons.length)];
    cardQuestion.textContent = bonus.text;
    cardTag.textContent = bonus.tag;
    cardNum.textContent = 'Bonus';
    cardPips.innerHTML = '';
    card.classList.add('bonus');
  } else {
    cardQuestion.textContent = q.gages ?? q.gage;
    cardTag.textContent = q.tag;
    cardNum.textContent = `#${i + 1}`;
    renderPips(levelMeta[level].pips);
    card.classList.remove('bonus');
  }
  progressInfo.textContent = `${i + 1} / ${deck.length}`;
}

function startGame(l) {
  level = l;
  deck = shuffle(gages[l]);
  idx = 0; flipped = false; busy = false;

  levelBadge.textContent = levelMeta[l].label;
  loadCard(0);

  diffSection.style.display = 'none';
  endScreen.classList.remove('visible');
  gameArea.classList.add('visible');
  btnNext.classList.remove('visible');
  btnRestart.classList.add('visible');

  card.classList.remove('flipped', 'leave', 'dealing');
  void card.offsetWidth;
  card.classList.add('dealing');
  setTimeout(() => card.classList.remove('dealing'), 350);
}

document.querySelector('.card-wrap').addEventListener('click', () => {
  if (busy || flipped) return;
  flipped = true;
  card.classList.add('flipped');
  btnNext.classList.add('visible');
});

btnNext.addEventListener('click', () => {
  if (busy) return;
  busy = true;
  btnNext.classList.remove('visible');
  card.classList.add('leave');

  setTimeout(() => {
    idx++;
    if (idx >= deck.length) { showEnd(); return; }
    card.classList.remove('flipped', 'leave', 'dealing');
    flipped = false;
    busy = false;
    loadCard(idx);
    void card.offsetWidth;
    card.classList.add('dealing');
    setTimeout(() => card.classList.remove('dealing'), 350);
  }, 340);
});

function showEnd() {
  gameArea.classList.remove('visible');
  endTitle.textContent = levelMeta[level].label + ' — terminé';
  endText.textContent = endMsgs[level];
  endScreen.classList.add('visible');
}

function goMenu() {
  gameArea.classList.remove('visible');
  endScreen.classList.remove('visible');
  diffSection.style.display = '';
  diffBtns.forEach(b => b.classList.remove('active'));
}

btnRestart.addEventListener('click', goMenu);
btnEndMenu.addEventListener('click', goMenu);
btnEndReplay.addEventListener('click', () => startGame(level));

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setTimeout(() => startGame(btn.dataset.level), 180);
  });
});

loadGameData();
