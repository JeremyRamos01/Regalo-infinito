export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  window.addEventListener('mousemove', (e) => {
    anime({
      targets: dot,
      left: e.clientX,
      top: e.clientY,
      duration: 0,
      easing: 'linear'
    });

    anime({
      targets: ring,
      left: e.clientX,
      top: e.clientY,
      duration: 350,
      easing: 'easeOutQuad'
    });
  });
}

export function initHeroAnimation() {
  anime.timeline({
    easing: 'easeOutExpo'
  })
  .add({
    targets: '#hero-title',
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 1600,
    delay: 200
  })
  .add({
    targets: '.hero-subtitle',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 1200
  }, '-=1000');
}