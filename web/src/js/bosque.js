import { fetchAllPuzzlePhotos, subscribeToPuzzlePhotos } from './services/firebase.js';
import { initMiniMusicPlayer } from './components/miniMusicPlayer.js';

let allPhotos = [];
let activePhotoIndex = 0;

// Estado del Puzzle Drag and Drop
let gridSize = 3; // 3x3 o 4x4
let currentTiles = [];
let draggedIndex = null;
let selectedTapIndex = null;
let moveCount = 0;
let timerSeconds = 0;
let timerInterval = null;
let isSolved = false;
let isHintVisible = false;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBosqueSector);
} else {
  initBosqueSector();
}

function initBosqueSector() {
  setupDomContainers();
  setupEventListeners();
  setupBubuFloatingCompanion();
  initMiniMusicPlayer({ biome: 'bosque', title: 'Sector Bosque ♡' });

  // 1. CARGA INMEDIATA: mostrar fotos de inmediato sin esperar a la red
  loadFallbackPhotos();

  // 2. En segundo plano: cargar fotos adicionales del servidor y Firebase
  syncMorePhotosInBackground();
}

function loadFallbackPhotos() {
  const puzzleFiles = [
    "WhatsApp Image 2026-10-21 at 16.20.07.jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08 (1).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08 (2).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08 (3).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08.jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (1).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (2).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (3).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (4).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09.jpeg"
  ];

  const fallbacks = puzzleFiles.map((filename, idx) => ({
    id: `puzzle-${idx + 1}`,
    url: `https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/fotos_rompecabezas%2F${encodeURIComponent(filename)}?alt=media`,
    name: `Rompecabezas #${idx + 1}`
  }));

  // Opciones tiernas con Bubu y Dudu
  fallbacks.push({ id: 'bubu-dudu-1', url: '../assets/bubu-dudu/bubu-dudu-love-hug.gif', name: 'Bubu y Dudu Cariñosos' });
  fallbacks.push({ id: 'bubu-dudu-2', url: '../assets/bubu-dudu/bubu-dudu-kisses.gif', name: 'Bubu y Dudu Besitos' });
  fallbacks.push({ id: 'bubu-dudu-3', url: '../assets/bubu-dudu/bubu-dudu-tight-hug.gif', name: 'Bubu y Dudu Abrazo Fuerte' });

  // Cargar fotos que se hayan subido específicamente al rompecabezas
  try {
    const customPhotos = JSON.parse(localStorage.getItem('lyoko_puzzle_custom_photos') || '[]');
    if (customPhotos.length > 0) {
      fallbacks.unshift(...customPhotos);
    }
  } catch (e) {}

  updatePhotosList(fallbacks);
}

async function syncMorePhotosInBackground() {
  try {
    const photos = await fetchAllPuzzlePhotos();
    if (photos && photos.length > 0) {
      const seen = new Set(allPhotos.map(p => p.url));
      photos.forEach(p => {
        if (!seen.has(p.url)) {
          allPhotos.push(p);
          seen.add(p.url);
        }
      });
      renderCarrusel();
    }
  } catch (e) {
    console.warn("Sincronización en segundo plano:", e);
  }

  try {
    subscribeToPuzzlePhotos((livePhotos) => {
      if (livePhotos && livePhotos.length > 0) {
        const seen = new Set(allPhotos.map(p => p.url));
        livePhotos.forEach(p => {
          if (!seen.has(p.url)) {
            allPhotos.push(p);
            seen.add(p.url);
          }
        });
        renderCarrusel();
      }
    });
  } catch (e) {}
}

function updatePhotosList(newPhotos) {
  allPhotos = newPhotos;
  if (activePhotoIndex >= allPhotos.length) activePhotoIndex = 0;

  renderCarrusel();
  if (allPhotos[activePhotoIndex]) {
    loadPhotoIntoPuzzle(allPhotos[activePhotoIndex].url);
  }
}

function setupDomContainers() {
  const container = document.getElementById('puzzle-app-container');
  if (!container) return;

  container.innerHTML = `
    <div class="puzzle-main-wrapper">
      <!-- BLOQUE 1: Marcador de Tiempo y Movimientos -->
      <div class="puzzle-block-card puzzle-stats-block">
        <div class="stat-pill">
          <span>⏱️ Tiempo:</span> <b id="puzzle-timer">00:00</b>
        </div>
        <div class="stat-pill">
          <span>🔄 Movimientos:</span> <b id="puzzle-moves">0</b>
        </div>
      </div>

      <!-- BLOQUE 2: Controles y Acciones en Bloques -->
      <div class="puzzle-block-card puzzle-controls-block">
        <div class="controls-row-difficulty">
          <span class="block-subheading">Dificultad:</span>
          <div class="btn-group-difficulty">
            <button type="button" class="puzzle-btn-sm is-active" id="btn-difficulty-3" title="Modo 3x3 (Fácil)">3×3 Fácil</button>
            <button type="button" class="puzzle-btn-sm" id="btn-difficulty-4" title="Modo 4x4 (Reto)">4×4 Reto</button>
          </div>
        </div>
        <div class="controls-row-actions">
          <button type="button" class="puzzle-btn-sm" id="btn-hint" title="Ver foto original">👁️ Pista</button>
          <button type="button" class="puzzle-btn-sm" id="btn-shuffle" title="Barajar piezas">🔀 Barajar</button>
          <input type="file" id="bosque-file-input" accept="image/*" style="display: none;" />
          <button type="button" class="puzzle-btn-sm" id="btn-upload-photo" title="Cargar otra foto de tu galería">📷 Subir Foto</button>
        </div>
      </div>

      <!-- BLOQUE 3: Tablero del Rompecabezas -->
      <div class="puzzle-block-card puzzle-board-block">
        <div class="puzzle-board-container" id="board-container">
          <div class="puzzle-grid" id="puzzle-grid"></div>
          <img src="" alt="Pista original" class="puzzle-hint-preview is-hidden" id="puzzle-hint-img" />
        </div>
        <p class="puzzle-touch-helper" id="puzzle-helper-text">✋ Toca o arrastra una pieza sobre otra para moverla</p>
      </div>

      <!-- BLOQUE 4: Galería de Fotos en Cuadrícula / Bloques (NO alargada) -->
      <div class="puzzle-block-card puzzle-gallery-block">
        <div class="gallery-header-row">
          <span class="block-subheading">📸 Elige un recuerdo para armar:</span>
          <span class="gallery-count-badge" id="gallery-count">0 fotos</span>
        </div>
        <div class="puzzle-photos-grid" id="carrusel-track">
          <!-- Miniaturas en cuadrícula de bloques -->
        </div>
      </div>
    </div>

    <!-- Modal de Victoria Romántica -->
    <div class="victory-modal-overlay is-hidden" id="victory-modal">
      <div class="victory-card">
        <img src="../assets/bubu-dudu/bubu-dudu-happy-dance.gif" alt="Bubu y Dudu celebrando" class="victory-bubu-img" />
        <h2 class="victory-title">¡Muy bien mi amor! 🎉💖</h2>
        
        <!-- Pista del Color Amarillo para Sector Roca -->
        <div style="background: #fff9db; border: 3px solid var(--nb-black); box-shadow: 3px 3px 0px var(--nb-black); border-radius: 14px; padding: 0.85rem 1rem; width: 100%; box-sizing: border-box; text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #ffd43b; border: 2.5px solid var(--nb-black); box-shadow: 1.5px 1.5px 0px var(--nb-black);"></span>
            <span style="font-family: var(--font-display); font-weight: 900; font-size: 1rem; color: #d97706; text-transform: uppercase; letter-spacing: 0.03em;">Color Amarillo</span>
          </div>
          <p style="margin: 0; font-family: var(--font-display); font-weight: 800; font-size: 0.95rem; color: var(--nb-black); line-height: 1.35;">
            El color amarillo para usarlo en el código de roca.
          </p>
          <small style="display: block; margin-top: 0.35rem; font-weight: 700; color: #b45309; font-size: 0.8rem;">
            (esto se usará más adelante)
          </small>
        </div>

        <p class="victory-text" id="victory-message">
          ¡Completaste este recuerdo perfecto, eres increíble mi princesa! ♡
        </p>
        <div class="victory-stats-row">
          <span>⏱️ <b id="victory-time-val">00:00</b></span>
          <span>🔄 <b id="victory-moves-val">0 movs</b></span>
        </div>
        <div class="victory-actions">
          <button type="button" class="unlock-btn" id="victory-replay-btn" style="flex: 1;">
            ¡Jugar de nuevo! 🔀
          </button>
          <button type="button" class="key-btn key-action" id="victory-close-btn" style="padding: 0.6rem 1rem;">
            Cerrar ♡
          </button>
        </div>
      </div>
    </div>
  `;
}

function setupEventListeners() {
  document.getElementById('btn-difficulty-3')?.addEventListener('click', () => setDifficulty(3));
  document.getElementById('btn-difficulty-4')?.addEventListener('click', () => setDifficulty(4));
  document.getElementById('btn-hint')?.addEventListener('click', toggleHint);
  document.getElementById('btn-shuffle')?.addEventListener('click', () => shuffleCurrentPuzzle());

  // Flechas del carrusel
  const track = document.getElementById('carrusel-track');
  document.getElementById('carrusel-prev')?.addEventListener('click', () => {
    track?.scrollBy({ left: -160, behavior: 'smooth' });
  });
  document.getElementById('carrusel-next')?.addEventListener('click', () => {
    track?.scrollBy({ left: 160, behavior: 'smooth' });
  });

  document.getElementById('victory-replay-btn')?.addEventListener('click', () => {
    document.getElementById('victory-modal')?.classList.add('is-hidden');
    shuffleCurrentPuzzle();
  });

  document.getElementById('victory-close-btn')?.addEventListener('click', () => {
    document.getElementById('victory-modal')?.classList.add('is-hidden');
  });

  // Subir o elegir foto personalizada para el puzzle
  const fileInput = document.getElementById('bosque-file-input');
  const uploadBtn = document.getElementById('btn-upload-photo');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const customPhoto = {
          id: `custom-puzzle-${Date.now()}`,
          url: evt.target.result,
          name: file.name.replace(/\.[^/.]+$/, ''),
          date: ''
        };

        // Guardar exclusivamente para el rompecabezas
        try {
          const list = JSON.parse(localStorage.getItem('lyoko_puzzle_custom_photos') || '[]');
          list.unshift(customPhoto);
          if (list.length > 10) list.pop();
          localStorage.setItem('lyoko_puzzle_custom_photos', JSON.stringify(list));
        } catch (e) {
          console.warn("Storage puzzle save:", e);
        }

        allPhotos.unshift(customPhoto);
        activePhotoIndex = 0;
        renderCarrusel();
        loadPhotoIntoPuzzle(customPhoto.url);
      };
      reader.readAsDataURL(file);
    });
  }
}

// Renderizar las fotos en cuadrícula de bloques
function renderCarrusel() {
  const track = document.getElementById('carrusel-track');
  const countBadge = document.getElementById('gallery-count');
  if (countBadge) {
    countBadge.textContent = `${allPhotos.length} fotos`;
  }
  if (!track) return;

  if (allPhotos.length === 0) {
    track.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--nb-brown-soft); padding: 0.8rem 0.6rem; text-align: center; width: 100%; grid-column: 1 / -1;">
        Esperando recuerdos... ♡
      </div>
    `;
    return;
  }

  track.innerHTML = allPhotos.map((photo, idx) => {
    const isActive = idx === activePhotoIndex;
    const cleanName = photo.name || `Foto #${idx + 1}`;

    return `
      <button type="button" class="gallery-thumb-block ${isActive ? 'is-active' : ''}" data-idx="${idx}" title="${cleanName}">
        <img src="${photo.url}" alt="${cleanName}" loading="lazy" />
        ${isActive ? '<span class="thumb-active-badge">✓</span>' : ''}
      </button>
    `;
  }).join('');

  track.querySelectorAll('.gallery-thumb-block').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (!isNaN(idx) && allPhotos[idx]) {
        activePhotoIndex = idx;
        renderCarrusel();
        loadPhotoIntoPuzzle(allPhotos[idx].url);
      }
    });
  });
}


let activeImgAspectRatio = 1; // ancho / alto

function loadPhotoIntoPuzzle(photoUrl) {
  const hintImg = document.getElementById('puzzle-hint-img');
  if (hintImg) hintImg.src = photoUrl;

  // Medir dimensiones reales de la foto para evitar que se vea estirada
  const img = new Image();
  img.src = photoUrl;
  img.onload = () => {
    if (img.naturalWidth && img.naturalHeight) {
      activeImgAspectRatio = img.naturalWidth / img.naturalHeight;
    }
    shuffleCurrentPuzzle();
  };
  img.onerror = () => {
    activeImgAspectRatio = 1;
    shuffleCurrentPuzzle();
  };
}

function setDifficulty(newSize) {
  if (gridSize === newSize) return;
  gridSize = newSize;

  document.getElementById('btn-difficulty-3')?.classList.toggle('is-active', gridSize === 3);
  document.getElementById('btn-difficulty-4')?.classList.toggle('is-active', gridSize === 4);

  shuffleCurrentPuzzle();
}

function shuffleCurrentPuzzle() {
  if (allPhotos.length === 0) return;

  const totalTiles = gridSize * gridSize;
  currentTiles = Array.from({ length: totalTiles }, (_, i) => i);

  do {
    for (let i = currentTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentTiles[i], currentTiles[j]] = [currentTiles[j], currentTiles[i]];
    }
  } while (isPuzzleSolved());

  draggedIndex = null;
  selectedTapIndex = null;
  moveCount = 0;
  isSolved = false;
  updateMoveCounter();
  resetTimer();
  startTimer();

  renderPuzzleBoard();
}

// Renderizar el tablero con Drag and Drop nativo y táctil
function renderPuzzleBoard() {
  const grid = document.getElementById('puzzle-grid');
  if (!grid) return;

  if (allPhotos.length === 0) {
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr';
    grid.style.gridTemplateRows = '1fr';
    grid.style.background = '#fffcf8';
    grid.innerHTML = `
      <div class="puzzle-empty-state">
        <img src="../assets/bubu-dudu/bubu-dudu-waiting.gif" alt="Bubu y Dudu esperando" class="bubu-sticker" style="width: 76px; height: 76px; border-radius: 14px;" />
        <p>Esperando recuerdos... ♡</p>
      </div>
    `;
    return;
  }

  const activePhoto = allPhotos[activePhotoIndex] || allPhotos[0];
  const photoUrl = activePhoto.url;

  grid.style.display = 'grid';
  grid.style.background = 'var(--nb-black)';
  grid.style.gap = '3px';
  grid.style.padding = '4px';
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  grid.innerHTML = '';

  currentTiles.forEach((tileVal, currentPos) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    tile.draggable = !isSolved;
    tile.dataset.pos = currentPos;

    if (selectedTapIndex === currentPos) {
      tile.classList.add('is-selected');
    }

    const origRow = Math.floor(tileVal / gridSize);
    const origCol = tileVal % gridSize;

    tile.style.backgroundImage = `url("${photoUrl}")`;

    // Si la imagen no es perfectamente cuadrada, aplicar escala tipo "cover" proporcional
    // para que las caras y personas no se vean achatadas ni estiradas
    if (activeImgAspectRatio > 1) {
      // Foto horizontal (más ancha que alta): ajustamos altura al 100% y ancho escalado
      const bgWidth = gridSize * 100 * activeImgAspectRatio;
      const bgHeight = gridSize * 100;
      const excess = (bgWidth - (gridSize * 100)) / 2;
      const posX = ((origCol / (gridSize - 1)) * 100);
      const posY = ((origRow / (gridSize - 1)) * 100);
      tile.style.backgroundSize = `${bgWidth}% ${bgHeight}%`;
      tile.style.backgroundPosition = `calc(${posX}% - ${(origCol - (gridSize - 1) / 2) * (excess / gridSize)}%) ${posY}%`;
    } else if (activeImgAspectRatio < 1 && activeImgAspectRatio > 0) {
      // Foto vertical (más alta que ancha): ajustamos ancho al 100% y altura escalada
      const bgWidth = gridSize * 100;
      const bgHeight = (gridSize * 100) / activeImgAspectRatio;
      const excess = (bgHeight - (gridSize * 100)) / 2;
      const posX = ((origCol / (gridSize - 1)) * 100);
      const posY = ((origRow / (gridSize - 1)) * 100);
      tile.style.backgroundSize = `${bgWidth}% ${bgHeight}%`;
      tile.style.backgroundPosition = `${posX}% calc(${posY}% - ${(origRow - (gridSize - 1) / 2) * (excess / gridSize)}%)`;
    } else {
      // Foto cuadrada perfecta
      const posX = (origCol / (gridSize - 1)) * 100;
      const posY = (origRow / (gridSize - 1)) * 100;
      tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
      tile.style.backgroundPosition = `${posX}% ${posY}%`;
    }

    // --- HTML5 DRAG AND DROP (Ratón) ---
    tile.addEventListener('dragstart', (e) => {
      if (isSolved) return;
      draggedIndex = currentPos;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', currentPos.toString());
      tile.classList.add('is-dragging');
    });

    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedIndex !== null && draggedIndex !== currentPos) {
        tile.classList.add('is-dragover');
      }
    });

    tile.addEventListener('dragleave', () => {
      tile.classList.remove('is-dragover');
    });

    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      tile.classList.remove('is-dragover');
      if (draggedIndex !== null && draggedIndex !== currentPos) {
        swapTiles(draggedIndex, currentPos);
      }
      draggedIndex = null;
    });

    tile.addEventListener('dragend', () => {
      tile.classList.remove('is-dragging');
      document.querySelectorAll('.puzzle-tile').forEach(t => t.classList.remove('is-dragover', 'is-dragging'));
      draggedIndex = null;
    });

    // --- TOUCH DRAG AND DROP (Pantalla táctil / Móvil) ---
    tile.addEventListener('touchstart', (e) => {
      if (isSolved) return;
      draggedIndex = currentPos;
      tile.classList.add('is-dragging');
    }, { passive: true });

    tile.addEventListener('touchmove', (e) => {
      if (draggedIndex === null || isSolved) return;
      const touch = e.touches[0];
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetTile = elemBelow?.closest('.puzzle-tile');

      document.querySelectorAll('.puzzle-tile').forEach(t => t.classList.remove('is-dragover'));
      if (targetTile && targetTile !== tile) {
        targetTile.classList.add('is-dragover');
      }
    }, { passive: true });

    tile.addEventListener('touchend', (e) => {
      if (draggedIndex === null || isSolved) return;
      const touch = e.changedTouches[0];
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetTile = elemBelow?.closest('.puzzle-tile');

      tile.classList.remove('is-dragging');
      document.querySelectorAll('.puzzle-tile').forEach(t => t.classList.remove('is-dragover'));

      if (targetTile) {
        const targetPos = parseInt(targetTile.dataset.pos, 10);
        if (!isNaN(targetPos) && targetPos !== draggedIndex) {
          swapTiles(draggedIndex, targetPos);
        }
      }
      draggedIndex = null;
    });

    // --- TAP DE APOYO ---
    tile.addEventListener('click', () => {
      if (isSolved) return;
      if (selectedTapIndex === null) {
        selectedTapIndex = currentPos;
        renderPuzzleBoard();
      } else if (selectedTapIndex === currentPos) {
        selectedTapIndex = null;
        renderPuzzleBoard();
      } else {
        swapTiles(selectedTapIndex, currentPos);
        selectedTapIndex = null;
      }
    });

    grid.appendChild(tile);
  });
}

function swapTiles(fromPos, toPos) {
  [currentTiles[fromPos], currentTiles[toPos]] = [currentTiles[toPos], currentTiles[fromPos]];
  moveCount++;
  updateMoveCounter();
  renderPuzzleBoard();

  if (isPuzzleSolved()) {
    handleVictory();
  }
}

function isPuzzleSolved() {
  if (currentTiles.length === 0) return false;
  return currentTiles.every((val, idx) => val === idx);
}

function handleVictory() {
  isSolved = true;
  clearInterval(timerInterval);

  const grid = document.getElementById('puzzle-grid');
  if (grid) {
    grid.style.gap = '0px';
    grid.style.padding = '0px';
  }

  launchCelebrationHearts();

  setTimeout(() => {
    const modal = document.getElementById('victory-modal');
    const timeVal = document.getElementById('victory-time-val');
    const movesVal = document.getElementById('victory-moves-val');

    if (timeVal) timeVal.textContent = formatTime(timerSeconds);
    if (movesVal) movesVal.textContent = `${moveCount} movs`;
    if (modal) modal.classList.remove('is-hidden');
  }, 450);
}

function toggleHint() {
  const hintImg = document.getElementById('puzzle-hint-img');
  const btnHint = document.getElementById('btn-hint');
  if (!hintImg) return;

  isHintVisible = !isHintVisible;
  hintImg.classList.toggle('is-hidden', !isHintVisible);
  btnHint?.classList.toggle('is-active', isHintVisible);
}

function updateMoveCounter() {
  const movesEl = document.getElementById('puzzle-moves');
  if (movesEl) movesEl.textContent = moveCount;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds++;
    const timerEl = document.getElementById('puzzle-timer');
    if (timerEl) timerEl.textContent = formatTime(timerSeconds);
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerSeconds = 0;
  const timerEl = document.getElementById('puzzle-timer');
  if (timerEl) timerEl.textContent = '00:00';
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function launchCelebrationHearts() {
  const board = document.getElementById('board-container');
  if (!board) return;

  const ICONS = ['💖', '✨', '🌸', '🥰', '🐻', '🐼', '💘'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('span');
    p.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
    p.style.position = 'absolute';
    p.style.left = `${Math.random() * 80 + 10}%`;
    p.style.top = `${Math.random() * 80 + 10}%`;
    p.style.fontSize = `${Math.random() * 1.5 + 1.2}rem`;
    p.style.pointerEvents = 'none';
    p.style.zIndex = '50';
    p.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
    p.style.opacity = '1';
    board.appendChild(p);

    requestAnimationFrame(() => {
      const offsetX = (Math.random() - 0.5) * 120;
      const offsetY = -Math.random() * 100 - 40;
      p.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.3)`;
      p.style.opacity = '0';
    });

    setTimeout(() => p.remove(), 1050);
  }
}

function setupBubuFloatingCompanion() {
  const btn = document.getElementById('bubu-floating-btn');
  const speech = document.getElementById('bubu-speech');
  if (!btn || !speech) return;

  const LOVE_PHRASES = [
    "¡Armar recuerdos contigo es lo más lindo! 🥰",
    "¡Eres la pieza que completa mi vida, Raquelita! 🧩💖",
    "¡Dudu y Bubu dicen que eres una experta en puzzles! ✨",
    "¡Abrazo gigante de oso para mi princesa! 🐻💖🐼",
    "¡Cada foto contigo es mi tesoro favorito! 📸🤍"
  ];

  let timeoutId = null;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const p = LOVE_PHRASES[Math.floor(Math.random() * LOVE_PHRASES.length)];
    speech.textContent = p;
    speech.classList.remove('is-hidden');

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      speech.classList.add('is-hidden');
    }, 4500);
  });
}
