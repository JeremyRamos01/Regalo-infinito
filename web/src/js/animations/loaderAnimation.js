export function runLyokoLoader(onComplete) {
  const anime = window.anime;
  const fillEl = document.getElementById('progress-fill');
  const percentEl = document.getElementById('progress-percent');
  const statusEl = document.getElementById('progress-status');
  const loaderCard = document.querySelector('.loader-card');
  const loaderScreen = document.getElementById('loader-screen');
  const heartEl = document.getElementById('progress-heart');

  // Asegurar que la pantalla de carga y su tarjeta sean 100% visibles al arrancar
  if (loaderScreen) loaderScreen.classList.remove('is-hidden');
  if (loaderCard) {
    loaderCard.style.opacity = '1';
    loaderCard.style.transform = 'translateY(0)';
    loaderCard.style.transition = 'none';
  }

  function updateStatus(v) {
    if (percentEl) percentEl.textContent = `${v}%`;
    if (fillEl) fillEl.style.width = `${v}%`;
    if (heartEl) heartEl.style.opacity = v > 1 ? '1' : '0';
    if (statusEl) {
      if (v < 25) statusEl.textContent = 'Sintonizando nuestro universo... ♡';
      else if (v < 55) statusEl.textContent = 'Cargando recuerdos mágicos... ♡';
      else if (v < 80) statusEl.textContent = 'Conectando corazones... ♡';
      else if (v < 100) statusEl.textContent = 'Entrando en Lyoko... ♡';
      else statusEl.textContent = '¡Conectado! ♡';
    }
  }

  updateStatus(0);

  function finishLoader() {
    if (loaderCard) {
      loaderCard.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      loaderCard.style.opacity = '0';
      loaderCard.style.transform = 'translateY(-8px)';
    }
    setTimeout(() => {
      if (loaderScreen) loaderScreen.classList.add('is-hidden');
      if (typeof onComplete === 'function') onComplete();
    }, 350);
  }

  // Animación suave y directa de la barra de carga (más lenta y romántica)
  if (typeof anime === 'function') {
    try {
      const progressTracker = { progress: 0 };
      anime({
        targets: progressTracker,
        progress: 100,
        round: 1,
        duration: 6200,
        easing: 'easeInOutQuad',
        update: (anim) => {
          const v = Math.min(100, Math.max(0, Math.round(anim.progress)));
          updateStatus(v);
        },
        complete: () => {
          updateStatus(100);
          finishLoader();
        }
      });
      return;
    } catch (e) {
      console.warn('Fallback a animación nativa:', e);
    }
  }

  // Fallback nativo
  const duration = 20000;
  const startTime = performance.now();

  function animateNative(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const v = Math.round(eased * 100);
    updateStatus(v);

    if (progress < 1) {
      requestAnimationFrame(animateNative);
    } else {
      updateStatus(100);
      finishLoader();
    }
  }
  requestAnimationFrame(animateNative);
}
