export function showMainLyokoPage() {
  const mainApp = document.getElementById('main-app');
  if (!mainApp) return;

  mainApp.classList.remove('is-hidden');
  const cards = document.querySelectorAll('.quad-card');

  if (window.anime && typeof window.anime === 'function') {
    window.anime({
      targets: cards,
      translateY: [20, 0],
      opacity: [0, 1],
      delay: window.anime.stagger(60),
      duration: 320,
      easing: 'easeOutQuad'
    });
  } else {
    cards.forEach((c) => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
  }
}
