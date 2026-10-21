import { fetchBiomeMusicUrl } from '../services/firebase.js';

// Canciones exactas subidas a Firebase Storage (raquel-5f8dc.firebasestorage.app)
const FALLBACK_MELODIES = {
  bosque: {
    title: 'Canción del Bosque ♡',
    url: 'https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/bosque.mp3?alt=media'
  },
  desierto: {
    title: 'Canción del Desierto ♡',
    url: 'https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/desierto.mp3?alt=media'
  },
  hielo: {
    title: 'Canción de Hielo ♡',
    url: 'https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/hielo.mp3?alt=media'
  },
  carta: {
    title: 'Canción de Nuestra Carta ♡',
    url: 'https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/carta.mp3?alt=media'
  },
  roca: {
    title: 'Melodía de Roca ♡',
    url: 'https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/roca.mp3?alt=media'
  }
};

/**
 * Inicializa el Mini Reproductor de Música para el bioma actual
 * @param {Object} options
 * @param {string} options.biome - 'bosque' | 'hielo' | 'desierto' | 'roca' | 'carta'
 * @param {string} [options.title] - Título para mostrar en el reproductor
 */
export async function initMiniMusicPlayer({ biome = 'bosque', title = '' }) {
  // Evitar duplicados
  if (document.getElementById('mini-music-player')) return;

  const biomeKey = (biome || 'bosque').toLowerCase();
  const defaultMeta = FALLBACK_MELODIES[biomeKey] || FALLBACK_MELODIES.bosque;
  const displayTitle = title || defaultMeta.title;

  // 1. Inyectar HTML del reproductor
  const playerEl = document.createElement('div');
  playerEl.className = 'mini-music-player';
  playerEl.id = 'mini-music-player';
  playerEl.setAttribute('role', 'region');
  playerEl.setAttribute('aria-label', `Reproductor de música de ${displayTitle}`);

  playerEl.innerHTML = `
    <div class="mmp-icon-disc" id="mmp-disc" title="Música romántica de este sector ♡">
      🎵
    </div>
    <div class="mmp-info">
      <span class="mmp-title" id="mmp-title">${displayTitle}</span>
      <span class="mmp-status" id="mmp-status">Cargando canción...</span>
    </div>
    <div class="mmp-controls">
      <button type="button" class="mmp-btn" id="mmp-mute-btn" title="Silenciar / Activar sonido" aria-label="Silenciar o activar música">
        🔊
      </button>
      <button type="button" class="mmp-btn mmp-btn-replay" id="mmp-replay-btn" title="Volver a escuchar desde el principio" aria-label="Reiniciar canción">
        🔁
      </button>
    </div>
    <div class="mmp-autoplay-prompt is-hidden" id="mmp-autoplay-prompt">
      ✨ Toca aquí para escuchar la música ♡
    </div>
  `;

  document.body.appendChild(playerEl);

  // 2. Elementos del DOM
  const discEl = playerEl.querySelector('#mmp-disc');
  const titleEl = playerEl.querySelector('#mmp-title');
  const statusEl = playerEl.querySelector('#mmp-status');
  const muteBtn = playerEl.querySelector('#mmp-mute-btn');
  const replayBtn = playerEl.querySelector('#mmp-replay-btn');
  const promptEl = playerEl.querySelector('#mmp-autoplay-prompt');

  // 3. Crear Audio
  const audio = new Audio();
  audio.loop = true;
  audio.volume = 0.65;
  audio.preload = 'auto';

  // Leer estado de mute previo
  let isMuted = localStorage.getItem('lyoko_music_muted') === 'true';
  audio.muted = isMuted;
  updateMuteButtonUI();

  function updateMuteButtonUI() {
    if (audio.muted) {
      muteBtn.textContent = '🔇';
      muteBtn.title = 'Activar sonido ♡';
      statusEl.textContent = 'Silenciado 🔇';
      playerEl.classList.remove('is-playing');
    } else {
      muteBtn.textContent = '🔊';
      muteBtn.title = 'Silenciar canción';
      if (!audio.paused) {
        statusEl.textContent = 'Reproduciendo ♡';
        playerEl.classList.add('is-playing');
      }
    }
  }

  // 4. Intentar reproducir
  async function attemptPlay() {
    try {
      await audio.play();
      promptEl.classList.add('is-hidden');
      if (!audio.muted) {
        playerEl.classList.add('is-playing');
        statusEl.textContent = 'Reproduciendo ♡';
      }
    } catch (err) {
      // Navegador bloqueó autoplay hasta que el usuario interactúe
      promptEl.classList.remove('is-hidden');
      statusEl.textContent = 'Toca para sonar 🎵';

      const playOnFirstGesture = () => {
        audio.play().then(() => {
          promptEl.classList.add('is-hidden');
          if (!audio.muted) {
            playerEl.classList.add('is-playing');
            statusEl.textContent = 'Reproduciendo ♡';
          }
        }).catch(() => {});
        window.removeEventListener('click', playOnFirstGesture);
        window.removeEventListener('touchstart', playOnFirstGesture);
        window.removeEventListener('keydown', playOnFirstGesture);
      };

      window.addEventListener('click', playOnFirstGesture, { once: true });
      window.addEventListener('touchstart', playOnFirstGesture, { once: true });
      window.addEventListener('keydown', playOnFirstGesture, { once: true });
    }
  }

  // 5. Botón de Silenciar / Desmutear (Mute Toggle)
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.muted = !audio.muted;
    localStorage.setItem('lyoko_music_muted', String(audio.muted));
    updateMuteButtonUI();

    if (!audio.muted && audio.paused) {
      audio.play().catch(() => {});
    }
  });

  // 6. Botón de Volver a Repetir (Replay from 0:00)
  replayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.currentTime = 0;
    statusEl.textContent = '¡Reiniciando! 🔁';
    replayBtn.style.transform = 'scale(0.85) rotate(-90deg)';
    setTimeout(() => {
      replayBtn.style.transform = '';
      if (!audio.muted) statusEl.textContent = 'Reproduciendo ♡';
    }, 450);

    audio.play().then(() => {
      promptEl.classList.add('is-hidden');
      if (!audio.muted) {
        playerEl.classList.add('is-playing');
      }
    }).catch(() => {});
  });

  // Si tocan el toast de aviso de autoplay, reproducir directamente
  promptEl.addEventListener('click', (e) => {
    e.stopPropagation();
    promptEl.classList.add('is-hidden');
    audio.muted = false;
    audio.play().catch(() => {});
    updateMuteButtonUI();
  });

  // Si tocan el disco giratorio, alternar silencio
  discEl.addEventListener('click', () => {
    muteBtn.click();
  });

  // 7. Cargar canción: Primero probar en Firebase Storage ('canciiones'), si no, usar fallback
  audio.src = defaultMeta.url;
  attemptPlay();

  // En segundo plano buscar si ya se subió a Firebase Storage en la carpeta 'canciiones'
  try {
    const fbMusic = await fetchBiomeMusicUrl(biomeKey);
    if (fbMusic && fbMusic.url) {
      console.log(`[MiniMusicPlayer] Usando canción de Firebase Storage para ${biomeKey}: ${fbMusic.name}`);
      const wasPlaying = !audio.paused;
      audio.src = fbMusic.url;
      const cleanName = fbMusic.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ');
      titleEl.textContent = cleanName || displayTitle;
      titleEl.title = fbMusic.name;
      if (wasPlaying || !isMuted) {
        attemptPlay();
      }
    }
  } catch (e) {
    console.warn(`[MiniMusicPlayer] Nota Firebase para ${biomeKey}:`, e.message);
  }

  return {
    audio,
    playerEl
  };
}
