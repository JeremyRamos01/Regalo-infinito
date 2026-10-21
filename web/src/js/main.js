import { initMagneticCursor, bindMagneticTargets } from './animations/magneticCursor.js';
import { runLyokoLoader } from './animations/loaderAnimation.js';
import { initChiclosoCodeGate } from './animations/codeGateAnimation.js';
import { showMainLyokoPage } from './animations/mainPageAnimation.js';
import { renderSectors } from '../components/sectors.js';

function logLyokoAccess(codeUsed) {
  try {
    const history = JSON.parse(localStorage.getItem('lyoko_access_logs') || '[]');
    history.push({ codeUsed, timestamp: new Date().toISOString() });
    localStorage.setItem('lyoko_access_logs', JSON.stringify(history));
  } catch (e) {}
}

function startApp() {
  renderSectors();
  initMagneticCursor();
  bindMagneticTargets();

  // Configuración del modal de pistas (Bombilla 💡)
  setupHintModal();

  // Configuración del botón de corazón blanco con fondo rojo
  setupRedHeartLockBtn();

  // Si viene explícitamente de pulsar "Volver a los Biomas" desde un sector (#biomas)
  const isDirectBiomaReturn = window.location.hash.includes('biomas') && sessionStorage.getItem('lyoko_unlocked') === 'true';

  if (isDirectBiomaReturn) {
    // Limpiamos el hash para que en la próxima recarga se vea la pantalla de carga
    history.replaceState(null, null, window.location.pathname);
    document.getElementById('loader-screen')?.classList.add('is-hidden');
    document.getElementById('gate-screen')?.classList.add('is-hidden');
    showMainLyokoPage();
  } else {
    // Al recargar o entrar normalmente: SIEMPRE mostrar la pantalla de carga primero
    sessionStorage.removeItem('lyoko_unlocked');
    if (window.location.hash) {
      history.replaceState(null, null, window.location.pathname);
    }
    
    document.getElementById('gate-screen')?.classList.add('is-hidden');
    document.getElementById('main-app')?.classList.add('is-hidden');
    document.getElementById('loader-screen')?.classList.remove('is-hidden');

    runLyokoLoader(() => {
      openCodeGateScreen();
    });
  }

  // Micro-interacción y carga con relleno de color en los 4 biomas
  const SECTOR_DATA = {
    forest: {
      badge: 'Sector Bosque ♡',
      icon: '🧩',
      sub: 'Nuestro rincón virtual de recuerdos juntos'
    },
    ice: {
      badge: 'Sector Hielo ♡',
      icon: '🗺️',
      sub: 'Trazando cada paso de nuestro camino juntos'
    },
    desert: {
      badge: 'Sector Desierto ♡',
      icon: '🎮',
      sub: 'Jugando en equipo en cada aventura'
    },
    rock: {
      badge: 'Sector Roca ♡',
      icon: '⛰️',
      sub: 'Fuerte e inquebrantable como lo que sentimos'
    }
  };

  document.querySelectorAll('.quad-card').forEach((card) => {
    card.addEventListener('click', () => {
      // Efecto táctil de pulsación
      card.style.transform = 'translate(3px, 3px)';
      card.style.boxShadow = 'var(--nb-shadow-active)';
      setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
      }, 140);

      // Desmarcar otros biomas
      document.querySelectorAll('.quad-card').forEach((c) => {
        if (c !== card) c.classList.remove('is-filled');
      });

      // Llenar con su color
      card.classList.add('is-filled');

      // Al terminar de cargar el color (750ms), navegar a la página .html del sector correspondiente
      const sectorKey = card.dataset.sector || 'forest';
      const SECTOR_PAGE_MAP = {
        forest: './pages/bosque.html',
        ice: './pages/hielo.html',
        desert: './pages/desierto.html',
        rock: './pages/roca.html'
      };

      setTimeout(() => {
        sessionStorage.setItem('lyoko_unlocked', 'true');
        const targetUrl = SECTOR_PAGE_MAP[sectorKey] || './pages/bosque.html';
        window.location.href = targetUrl;
      }, 750);
    });
  });
}

// Función para gestionar los popups de bombilla (💡) con las pistas
function setupHintModal() {
  const modal = document.getElementById('hint-modal');
  const badgeEl = document.getElementById('hint-modal-badge');
  const textEl = document.getElementById('hint-modal-text');
  const closeBtn = document.getElementById('close-hint-modal-btn');

  const HINTS = {
    gate1: {
      badge: 'Pista de Seguridad ♡',
      text: 'El cógido es el dia en que tu sonrisa hizo que la piedra mas brilalnte quedara en segundo plano'
    },
    gate2: {
      badge: 'Pista de Colores ♡',
      text: 'El código de colores es: las veces en que las rosas pudieron ver algo mas que ellas.'
    }
  };

  document.querySelectorAll('.hint-lightbulb-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const hintKey = btn.dataset.hint || 'gate1';
      const hint = HINTS[hintKey] || HINTS.gate1;

      if (badgeEl) badgeEl.textContent = hint.badge;
      if (textEl) textEl.textContent = hint.text;
      modal?.classList.remove('is-hidden');
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('is-hidden');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('is-hidden');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('is-hidden')) {
      modal.classList.add('is-hidden');
    }
  });
}

function setupBubuFloatingCompanion() {
  const btn = document.getElementById('bubu-floating-btn');
  const speech = document.getElementById('bubu-speech');
  if (!btn || !speech) return;

  const LOVE_PHRASES = [
    "¡Te amo con locura Raquelita! 🥰",
    "¡Seremos viejitos juntos, señorita! 👴👵",
    "¡Dudu y Bubu dicen que eres la más hermosa del universo! ✨",
    "¡Abrazo gigante de oso para mi princesa! 🐻💖🐼",
    "¡Dios bendice nuestro camino hoy y siempre! 🤍",
    "¡Eres lo más bonito que me ha pasado en la vida! 🌹",
    "¡Bubu no puede soltar a Dudu, justo como yo a ti! 🥹",
    "¡Un besito en la frente de parte de Jeremy! 😘"
  ];

  let timeoutId = null;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const randomPhrase = LOVE_PHRASES[Math.floor(Math.random() * LOVE_PHRASES.length)];
    speech.textContent = randomPhrase;
    speech.classList.remove('is-hidden');

    // Efecto de corazoncito flotante
    createFloatingHeart(btn);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      speech.classList.add('is-hidden');
    }, 4500);
  });
}

function createFloatingHeart(parent) {
  const heart = document.createElement('span');
  heart.textContent = '💖';
  heart.style.position = 'absolute';
  heart.style.left = '50%';
  heart.style.top = '0%';
  heart.style.transform = 'translate(-50%, -50%)';
  heart.style.pointerEvents = 'none';
  heart.style.fontSize = '1.4rem';
  heart.style.transition = 'all 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)';
  heart.style.opacity = '1';
  heart.style.zIndex = '1000';
  parent.appendChild(heart);

  requestAnimationFrame(() => {
    const randomX = (Math.random() - 0.5) * 50;
    heart.style.transform = `translate(calc(-50% + ${randomX}px), -65px) scale(1.4)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => heart.remove(), 900);
}

function openCodeGateScreen() {
  document.getElementById('loader-screen')?.classList.add('is-hidden');
  document.getElementById('main-app')?.classList.add('is-hidden');
  
  const gateScreen = document.getElementById('gate-screen');
  const gummyBox = document.getElementById('gummy-box');
  const feedback = document.getElementById('gate-feedback');
  
  if (feedback) {
    feedback.textContent = '';
  }
  if (gummyBox) {
    gummyBox.style.opacity = '1';
    gummyBox.style.transform = 'translateY(0) scale(1)';
  }
  
  document.querySelectorAll('.code-slot').forEach(s => {
    s.textContent = '';
    s.classList.remove('filled');
  });

  if (gateScreen) {
    gateScreen.classList.remove('is-hidden');
    initChiclosoCodeGate(() => {
      sessionStorage.setItem('lyoko_unlocked', 'true');
      logLyokoAccess('2206');
      showMainLyokoPage();
    });
  }
}

function setupRedHeartLockBtn() {
  const lockBtn = document.getElementById('btn-lock-gate');
  if (!lockBtn) return;

  lockBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // 1. Quitar el hash #biomas de la URL
    if (window.location.hash) {
      history.replaceState(null, null, window.location.pathname);
    }
    // 2. Limpiar la memoria de desbloqueo
    sessionStorage.removeItem('lyoko_unlocked');

    // 3. Abrir inmediatamente el panel de código inicial
    openCodeGateScreen();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startApp();
    setupBubuFloatingCompanion();
  });
} else {
  startApp();
  setupBubuFloatingCompanion();
}

