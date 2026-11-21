// script.js — Typing Code Master — Game Logic
// Requires syntax-bank.js to be loaded first (provides SYNTAX_BANK, LANG_CONFIG)

'use strict';

// ── Difficulty Configuration ────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy', emoji: '🌱',
    baseSpeed: 14, speedPerLevel: 3,
    spawnInterval: 4500, minSpawnInterval: 1500,
    gracePeriod: 6000, penaltyPoints: 8,
    tier2Level: 3, tier3Level: 6,
    badgeClass: 'badge-easy',
  },
  medium: {
    label: 'Medium', emoji: '⚡',
    baseSpeed: 18, speedPerLevel: 4,
    spawnInterval: 3500, minSpawnInterval: 1000,
    gracePeriod: 5000, penaltyPoints: 15,
    tier2Level: 2, tier3Level: 4,
    badgeClass: 'badge-medium',
  },
  hard: {
    label: 'Hard', emoji: '🔥',
    baseSpeed: 26, speedPerLevel: 6,
    spawnInterval: 2200, minSpawnInterval: 700,
    gracePeriod: 3000, penaltyPoints: 25,
    tier2Level: 1, tier3Level: 2,
    badgeClass: 'badge-hard',
  },
};

// ── Storage ─────────────────────────────────────────────────────────────────
const Storage = {
  KEY: 'tcm_leaderboard',

  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(entries) {
    localStorage.setItem(this.KEY, JSON.stringify(entries));
  },

  /** Add entry and keep top-10 sorted by score desc */
  addEntry(entry) {
    const entries = this.load();
    entries.push(entry);
    entries.sort((a, b) => b.score - a.score);
    const top = entries.slice(0, 10);
    this.save(top);
    return top;
  },

  /** Get best score for name+lang+difficulty combo */
  getHiScore(name, lang, difficulty) {
    const entries = this.load();
    const matches = entries.filter(
      e => e.name === name && e.lang === lang && e.difficulty === difficulty
    );
    return matches.length ? Math.max(...matches.map(e => e.score)) : 0;
  },
};

// ── Game State ───────────────────────────────────────────────────────────────
const State = {
  // Profile selections
  username: '',
  selectedLang: null,
  selectedDifficulty: null,

  // Session
  score: 0,
  hiScore: 0,
  level: 1,
  combo: 0,
  maxCombo: 0,       // track max combo for game over stats
  tokensHit: 0,      // successfully typed tokens
  tokensMissed: 0,   // tokens that fell past bottom
  tokens: [],        // active token objects
  lockedTokenId: null,  // id of the currently locked token

  // Timing
  lastFrameTime: 0,
  spawnTimer: 0,
  currentSpawnInterval: 0,
  graceRemaining: 0,  // ms remaining in grace period
  paused: false,
  gameOver: false,
  running: false,

  // RAF handle
  rafHandle: null,
  spawnHandle: null,

  reset() {
    this.score = 0;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.tokensHit = 0;
    this.tokensMissed = 0;
    this.tokens = [];
    this.lockedTokenId = null;
    this.lastFrameTime = 0;
    this.spawnTimer = 0;
    this.paused = false;
    this.gameOver = false;
    this.running = false;
    if (this.rafHandle) { cancelAnimationFrame(this.rafHandle); this.rafHandle = null; }
    if (this.spawnHandle) { clearTimeout(this.spawnHandle); this.spawnHandle = null; }
    const diff = DIFFICULTY_CONFIG[this.selectedDifficulty];
    this.currentSpawnInterval = diff ? diff.spawnInterval : 4500;
    this.graceRemaining = diff ? diff.gracePeriod : 6000;
    this.hiScore = Storage.getHiScore(this.username, this.selectedLang, this.selectedDifficulty);
  },
};

let _tokenIdCounter = 0;

// ── DOM References ───────────────────────────────────────────────────────────
const DOM = {
  // Screens
  screenProfile: null,
  screenGame:    null,
  // Profile
  usernameInput:  null,
  langGrid:       null,
  diffGrid:       null,
  btnStart:       null,
  leaderboardList: null,
  // HUD
  hudName:        null,
  hudLangBadge:   null,
  hudDiffBadge:   null,
  hudLevel:       null,
  hudCombo:       null,
  hudHiScore:     null,
  hudScore:       null,
  // Game
  gameArea:       null,
  typingInput:    null,
  btnPause:       null,
  graceBanner:    null,
  // Overlays
  missFlash:      null,
  pauseOverlay:   null,
  gameOverOverlay: null,
  goScore:        null,
  goLevel:        null,
  goCombo:        null,
  goLang:         null,
  goDiff:         null,
  btnRestart:     null,
  btnHome:        null,

  init() {
    this.screenProfile  = document.getElementById('screen-profile');
    this.screenGame     = document.getElementById('screen-game');
    this.usernameInput  = document.getElementById('username-input');
    this.langGrid       = document.getElementById('lang-grid');
    this.diffGrid       = document.getElementById('diff-grid');
    this.btnStart       = document.getElementById('btn-start');
    this.leaderboardList = document.getElementById('leaderboard-list');
    this.hudName        = document.getElementById('hud-name');
    this.hudLangBadge   = document.getElementById('hud-lang-badge');
    this.hudDiffBadge   = document.getElementById('hud-diff-badge');
    this.hudLevel       = document.getElementById('hud-level');
    this.hudCombo       = document.getElementById('hud-combo');
    this.hudHiScore     = document.getElementById('hud-hiscore');
    this.hudScore       = document.getElementById('hud-score');
    this.gameArea       = document.getElementById('game-area');
    this.typingInput    = document.getElementById('typing-input');
    this.btnPause       = document.getElementById('btn-pause');
    this.graceBanner    = document.getElementById('grace-banner');
    this.missFlash      = document.getElementById('miss-flash');
    this.pauseOverlay   = document.getElementById('pause-overlay');
    this.gameOverOverlay = document.getElementById('gameover-overlay');
    this.goScore        = document.getElementById('go-score');
    this.goLevel        = document.getElementById('go-level');
    this.goCombo        = document.getElementById('go-combo');
    this.goLang         = document.getElementById('go-lang');
    this.goDiff         = document.getElementById('go-diff');
    this.btnRestart     = document.getElementById('btn-restart');
    this.btnHome        = document.getElementById('btn-home');
  },
};

// ── Screen Management ────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Leaderboard Rendering ────────────────────────────────────────────────────
function renderLeaderboard() {
  const entries = Storage.load();
  const container = DOM.leaderboardList;
  container.innerHTML = '';

  if (!entries.length) {
    container.innerHTML = '<p class="text-slate-500 text-center text-sm py-4">No scores yet. Be the first!</p>';
    return;
  }

  entries.forEach((e, i) => {
    const diff = DIFFICULTY_CONFIG[e.difficulty] || {};
    const lang = LANG_CONFIG[e.lang] || {};
    const rowClass = i === 0 ? 'lb-row-gold' : i === 1 ? 'lb-row-silver' : i === 2 ? 'lb-row-bronze' : '';
    const medals = ['🥇','🥈','🥉'];
    const medal = medals[i] || `#${i+1}`;

    const row = document.createElement('div');
    row.className = `flex items-center gap-2 px-3 py-2 rounded bg-slate-800 ${rowClass}`;
    row.innerHTML = `
      <span class="w-7 text-center text-sm">${medal}</span>
      <span class="flex-1 font-semibold text-slate-200 truncate text-sm">${escHtml(e.name)}</span>
      <span class="text-xs px-1.5 py-0.5 rounded font-bold ${lang.badgeClass || ''}">${lang.icon || e.lang}</span>
      <span class="text-xs px-1.5 py-0.5 rounded font-bold ${diff.badgeClass || ''}">${diff.emoji || ''} ${diff.label || e.difficulty}</span>
      <span class="text-xs text-slate-400 hidden sm:block">Lv.${e.level}</span>
      <span class="text-xs text-slate-400 hidden sm:block">${e.accuracy}%</span>
      <span class="font-bold text-emerald-400 text-sm w-16 text-right">${e.score}</span>
    `;
    container.appendChild(row);
  });
}

// ── Profile Setup ────────────────────────────────────────────────────────────
function buildLangGrid() {
  const grid = DOM.langGrid;
  grid.innerHTML = '';
  Object.entries(LANG_CONFIG).forEach(([key, cfg]) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'lang-chip';
    chip.dataset.lang = key;
    chip.innerHTML = `
      <span class="text-xs font-bold px-1.5 py-0.5 rounded ${cfg.badgeClass}">${cfg.icon}</span>
      <span class="text-xs text-slate-300">${cfg.label}</span>
    `;
    chip.addEventListener('click', () => selectLang(key));
    grid.appendChild(chip);
  });
}

function buildDiffGrid() {
  const grid = DOM.diffGrid;
  grid.innerHTML = '';
  Object.entries(DIFFICULTY_CONFIG).forEach(([key, cfg]) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'diff-chip text-left';
    chip.dataset.diff = key;
    chip.innerHTML = `
      <div class="text-sm font-bold">${cfg.emoji} ${cfg.label}</div>
      <div class="text-xs text-slate-400 mt-0.5">${cfg.baseSpeed}px/s · ${cfg.penaltyPoints}pt penalty</div>
    `;
    chip.addEventListener('click', () => selectDifficulty(key));
    grid.appendChild(chip);
  });
}

function selectLang(lang) {
  State.selectedLang = lang;
  DOM.langGrid.querySelectorAll('.lang-chip').forEach(c => {
    c.classList.toggle('lang-selected', c.dataset.lang === lang);
  });
  updateStartButton();
}

function selectDifficulty(diff) {
  State.selectedDifficulty = diff;
  DOM.diffGrid.querySelectorAll('.diff-chip').forEach(c => {
    // remove all diff-selected classes first
    c.classList.remove('diff-selected-easy','diff-selected-medium','diff-selected-hard');
    if (c.dataset.diff === diff) c.classList.add(`diff-selected-${diff}`);
  });
  updateStartButton();
}

function updateStartButton() {
  const name = DOM.usernameInput.value.trim();
  const valid = name.length > 0 && State.selectedLang && State.selectedDifficulty;
  DOM.btnStart.disabled = !valid;
}

// ── Syntax Pool ──────────────────────────────────────────────────────────────
/** Returns the active syntax pool based on current level + difficulty */
function getActiveSyntaxPool() {
  const bank = SYNTAX_BANK[State.selectedLang];
  const diff = DIFFICULTY_CONFIG[State.selectedDifficulty];
  const pool = [...bank.tier1];
  if (State.level >= diff.tier2Level) pool.push(...bank.tier2);
  if (State.level >= diff.tier3Level) pool.push(...bank.tier3);
  return pool;
}

// ── Token Spawning ───────────────────────────────────────────────────────────
function spawnToken() {
  if (!State.running || State.paused || State.gameOver) return;

  const pool = getActiveSyntaxPool();
  const text = pool[Math.floor(Math.random() * pool.length)];
  const areaWidth = DOM.gameArea.clientWidth;

  // Measure approximate token width (13px font, 7.8px per char approx)
  const approxWidth = text.length * 7.8 + 24;
  const maxX = Math.max(10, areaWidth - approxWidth - 10);
  const x = 10 + Math.random() * maxX;

  const id = ++_tokenIdCounter;
  const diff = DIFFICULTY_CONFIG[State.selectedDifficulty];
  const speedPx = diff.baseSpeed + (State.level - 1) * diff.speedPerLevel; // px/s

  const el = document.createElement('div');
  el.className = 'syntax-token anim-spawn';
  el.id = `token-${id}`;
  el.style.left = `${x}px`;
  el.style.top = '-40px';
  renderTokenHighlight(el, text, 0);

  DOM.gameArea.appendChild(el);

  const tokenObj = { id, text, el, y: -40, speed: speedPx, matched: 0 };
  State.tokens.push(tokenObj);

  scheduleNextSpawn();
}

function scheduleNextSpawn() {
  if (State.spawnHandle) clearTimeout(State.spawnHandle);
  if (!State.running || State.paused || State.gameOver) return;
  State.spawnHandle = setTimeout(spawnToken, State.currentSpawnInterval);
}

// ── Token Highlight Rendering ─────────────────────────────────────────────────
/** Renders per-character spans for matched/cursor/pending states */
function renderTokenHighlight(el, text, matchedCount) {
  el.innerHTML = '';
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i];
    if (i < matchedCount)       span.className = 'char-matched';
    else if (i === matchedCount) span.className = 'char-cursor';
    else                         span.className = 'char-pending';
    el.appendChild(span);
  }
}

// ── Target Locking ───────────────────────────────────────────────────────────
/**
 * Target locking: given the current input text, find the best token to lock.
 * Priority: tokens whose text starts with the typed input, lowest on screen first.
 */
function resolveLock(typedText) {
  if (!typedText) {
    State.lockedTokenId = null;
    return null;
  }

  // If we already have a locked token, check if it still matches
  if (State.lockedTokenId !== null) {
    const existing = State.tokens.find(t => t.id === State.lockedTokenId);
    if (existing && existing.text.startsWith(typedText)) {
      return existing;
    }
    // Lock broken — clear
    State.lockedTokenId = null;
  }

  // Find candidates (startsWith match) sorted by y descending (closest to bottom first)
  const candidates = State.tokens
    .filter(t => t.text.startsWith(typedText))
    .sort((a, b) => b.y - a.y);

  if (candidates.length) {
    State.lockedTokenId = candidates[0].id;
    return candidates[0];
  }
  return null;
}

// ── Input Handling ───────────────────────────────────────────────────────────
function onInputChange() {
  if (!State.running || State.paused || State.gameOver) return;

  const typed = DOM.typingInput.value;

  // Resolve which token is locked
  const locked = resolveLock(typed);

  // Update all token highlights
  State.tokens.forEach(t => {
    t.el.classList.toggle('token-locked', t.id === State.lockedTokenId);
    if (t.id === State.lockedTokenId) {
      t.matched = typed.length;
      renderTokenHighlight(t.el, t.text, t.matched);
    } else {
      // Reset non-locked tokens' highlight
      if (t.matched !== 0) {
        t.matched = 0;
        renderTokenHighlight(t.el, t.text, 0);
      }
    }
  });

  // Show input error state if no match
  DOM.typingInput.classList.toggle('input-error', typed.length > 0 && !locked);

  // Check for full match
  if (locked && typed === locked.text) {
    awardSuccess(locked);
    DOM.typingInput.value = '';
    DOM.typingInput.classList.remove('input-error');
    State.lockedTokenId = null;
  }
}

// ── Scoring ──────────────────────────────────────────────────────────────────
/** Award points and animate on successful token completion */
function awardSuccess(token) {
  State.combo++;
  State.tokensHit++;
  if (State.combo > State.maxCombo) State.maxCombo = State.combo;
  const multiplier = Math.min(State.combo, 8); // cap at 8×
  const points = token.text.length * multiplier;
  State.score += points;

  updateHUD();
  checkLevelUp();
  spawnScoreBurst(token, `+${points}`);
  animateCombo();

  removeToken(token, 'success');
}

/** Apply penalty when a token reaches the bottom */
function applyMissPenalty(token) {
  const diff = DIFFICULTY_CONFIG[State.selectedDifficulty];
  State.combo = 0;
  State.tokensMissed++;
  State.score = Math.max(-999, State.score - diff.penaltyPoints);

  updateHUD();
  triggerMissFlash();
  removeToken(token, 'miss');

  // Clear input if it was aimed at this token
  if (State.lockedTokenId === token.id) {
    State.lockedTokenId = null;
    DOM.typingInput.value = '';
    DOM.typingInput.classList.remove('input-error');
  }

  // Game Over if score drops below 0
  if (State.score < 0) triggerGameOver();
}

/** Check and handle level up */
function checkLevelUp() {
  const newLevel = Math.floor(State.score / 200) + 1;
  if (newLevel > State.level) {
    State.level = newLevel;
    // Reduce spawn interval proportionally
    const diff = DIFFICULTY_CONFIG[State.selectedDifficulty];
    const reduction = (State.level - 1) * 150;
    State.currentSpawnInterval = Math.max(diff.minSpawnInterval, diff.spawnInterval - reduction);
    updateHUD();
  }
}

// ── Token Removal ────────────────────────────────────────────────────────────
function removeToken(token, reason) {
  const idx = State.tokens.indexOf(token);
  if (idx !== -1) State.tokens.splice(idx, 1);

  token.el.classList.remove('anim-spawn');
  token.el.classList.add(reason === 'success' ? 'anim-success' : 'anim-miss');

  setTimeout(() => { if (token.el.parentNode) token.el.parentNode.removeChild(token.el); }, 500);
}

// ── Score Burst ──────────────────────────────────────────────────────────────
function spawnScoreBurst(token, label) {
  const burst = document.createElement('div');
  burst.className = 'score-burst';
  burst.textContent = label;
  burst.style.left = `${parseFloat(token.el.style.left) + 10}px`;
  burst.style.top  = `${token.y - 10}px`;
  DOM.gameArea.appendChild(burst);
  setTimeout(() => { if (burst.parentNode) burst.parentNode.removeChild(burst); }, 750);
}

// ── Visuals ───────────────────────────────────────────────────────────────────
function triggerMissFlash() {
  DOM.missFlash.classList.remove('flash-active');
  void DOM.missFlash.offsetWidth; // force reflow to restart animation
  DOM.missFlash.classList.add('flash-active');
}

function animateCombo() {
  const el = DOM.hudCombo;
  el.classList.remove('combo-pop');
  void el.offsetWidth;
  el.classList.add('combo-pop');
}

// ── HUD Update ───────────────────────────────────────────────────────────────
function updateHUD() {
  DOM.hudScore.textContent  = State.score;
  DOM.hudLevel.textContent  = `Lv.${State.level}`;
  DOM.hudCombo.textContent  = `×${State.combo}`;
  DOM.hudHiScore.textContent = Math.max(State.hiScore, State.score);
}

// ── Game Loop (requestAnimationFrame) ────────────────────────────────────────
function gameLoop(timestamp) {
  if (!State.running || State.gameOver) return;
  if (State.paused) {
    State.rafHandle = requestAnimationFrame(gameLoop);
    return;
  }

  const delta = State.lastFrameTime ? (timestamp - State.lastFrameTime) / 1000 : 0;
  State.lastFrameTime = timestamp;

  // Grace period — tokens don't move during grace
  if (State.graceRemaining > 0) {
    State.graceRemaining -= delta * 1000;
    if (State.graceRemaining <= 0) {
      State.graceRemaining = 0;
      DOM.graceBanner.style.display = 'none';
    } else {
      const sec = Math.ceil(State.graceRemaining / 1000);
      DOM.graceBanner.style.display = '';
      DOM.graceBanner.textContent   = `⏳ Starting in ${sec}s…`;
    }
    State.rafHandle = requestAnimationFrame(gameLoop);
    return;
  }

  const areaHeight = DOM.gameArea.clientHeight;

  // Move all tokens downward
  State.tokens.forEach(token => {
    token.y += token.speed * delta;
    token.el.style.top = `${token.y}px`;
  });

  // Detect tokens that have fallen past the bottom
  const missed = State.tokens.filter(t => t.y > areaHeight + 10);
  missed.forEach(t => applyMissPenalty(t));

  if (!State.gameOver) {
    State.rafHandle = requestAnimationFrame(gameLoop);
  }
}

// ── Game Flow ─────────────────────────────────────────────────────────────────
function startGame() {
  State.username  = DOM.usernameInput.value.trim();

  // Clear leftover tokens from game area
  DOM.gameArea.querySelectorAll('.syntax-token').forEach(el => el.remove());

  State.reset();
  updateHUD();

  // Set HUD badges
  const lang = LANG_CONFIG[State.selectedLang];
  const diff = DIFFICULTY_CONFIG[State.selectedDifficulty];
  DOM.hudName.textContent     = State.username;
  DOM.hudLangBadge.textContent = lang.icon;
  DOM.hudLangBadge.className   = `text-xs font-bold px-2 py-0.5 rounded ${lang.badgeClass}`;
  DOM.hudDiffBadge.textContent = `${diff.emoji} ${diff.label}`;
  DOM.hudDiffBadge.className   = `text-xs font-bold px-2 py-0.5 rounded ${diff.badgeClass}`;

  DOM.typingInput.value = '';
  DOM.typingInput.classList.remove('input-error');
  DOM.graceBanner.style.display = '';
  DOM.pauseOverlay.style.display    = 'none';
  DOM.gameOverOverlay.style.display = 'none';

  showScreen('screen-game');
  DOM.typingInput.focus();

  State.running = true;

  // Start the game loop
  State.rafHandle = requestAnimationFrame(gameLoop);

  // Start spawning after grace period
  State.spawnHandle = setTimeout(spawnToken, State.graceRemaining + 100);
}

function pauseGame() {
  if (!State.running || State.gameOver) return;
  State.paused = true;
  DOM.pauseOverlay.style.display = 'flex';
  DOM.btnPause.textContent = '▶ Resume';
  if (State.spawnHandle) { clearTimeout(State.spawnHandle); State.spawnHandle = null; }
}

function resumeGame() {
  if (!State.running || State.gameOver) return;
  State.paused = false;
  State.lastFrameTime = 0; // reset delta to avoid jump
  DOM.pauseOverlay.style.display = 'none';
  DOM.btnPause.textContent = '⏸ Pause';
  DOM.typingInput.focus();
  scheduleNextSpawn();
}

function triggerGameOver() {
  State.gameOver = true;
  State.running  = false;
  cancelAnimationFrame(State.rafHandle);
  if (State.spawnHandle) clearTimeout(State.spawnHandle);

  const diff = DIFFICULTY_CONFIG[State.selectedDifficulty];
  const lang = LANG_CONFIG[State.selectedLang];

  // Calculate accuracy from hit/miss counters
  const totalSeen = State.tokensHit + State.tokensMissed;
  const accuracy  = totalSeen > 0 ? Math.round((State.tokensHit / totalSeen) * 100) : 100;

  // Save to leaderboard
  const entry = {
    name: State.username,
    lang: State.selectedLang,
    difficulty: State.selectedDifficulty,
    score: Math.max(0, State.score),
    level: State.level,
    combo: State.maxCombo,
    accuracy,
    date: new Date().toISOString(),
  };
  Storage.addEntry(entry);
  State.hiScore = Storage.getHiScore(State.username, State.selectedLang, State.selectedDifficulty);

  // Populate game over overlay
  DOM.goScore.textContent = Math.max(0, State.score);
  DOM.goLevel.textContent = `Level ${State.level}`;
  DOM.goCombo.textContent = `Max ×${State.maxCombo}`;
  DOM.goLang.className    = `text-xs font-bold px-2 py-0.5 rounded ${lang.badgeClass}`;
  DOM.goLang.textContent  = `${lang.icon} ${lang.label}`;
  DOM.goDiff.className    = `text-xs font-bold px-2 py-0.5 rounded ${diff.badgeClass}`;
  DOM.goDiff.textContent  = `${diff.emoji} ${diff.label}`;

  DOM.gameOverOverlay.style.display = 'flex';
}

function goHome() {
  State.running  = false;
  State.gameOver = false;
  cancelAnimationFrame(State.rafHandle);
  if (State.spawnHandle) clearTimeout(State.spawnHandle);
  DOM.gameArea.querySelectorAll('.syntax-token').forEach(el => el.remove());
  renderLeaderboard();
  showScreen('screen-profile');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!State.running || State.gameOver) return;
    if (State.paused) resumeGame(); else pauseGame();
  }
});

// ── Event Wiring ─────────────────────────────────────────────────────────────
function wireEvents() {
  DOM.usernameInput.addEventListener('input', updateStartButton);
  DOM.btnStart.addEventListener('click', startGame);
  DOM.typingInput.addEventListener('input', onInputChange);
  DOM.btnPause.addEventListener('click', () => {
    if (State.paused) resumeGame(); else pauseGame();
  });
  DOM.btnRestart.addEventListener('click', () => {
    // Keep same lang/difficulty, restart
    DOM.gameArea.querySelectorAll('.syntax-token').forEach(el => el.remove());
    _tokenIdCounter = 0;
    startGame();
  });
  DOM.btnHome.addEventListener('click', goHome);
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  DOM.init();
  buildLangGrid();
  buildDiffGrid();
  wireEvents();
  renderLeaderboard();
  showScreen('screen-profile');
  DOM.btnStart.disabled = true;
}

document.addEventListener('DOMContentLoaded', init);
