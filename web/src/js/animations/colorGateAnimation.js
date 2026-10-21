export function initColorCodeGate(onUnlockSuccess) {
  const rockGateScreen = document.getElementById('rock-gate-screen');
  const colorBox = document.getElementById('color-box');
  const slots = [
    document.getElementById('color-slot-0'),
    document.getElementById('color-slot-1'),
    document.getElementById('color-slot-2')
  ];
  const feedback = document.getElementById('rock-gate-feedback');
  
  // Secuencia secreta especificada por el usuario: Amarillo, Rojo, Blanco
  const SECRET_SEQUENCE = ['amarillo', 'rojo', 'blanco'];
  
  const COLOR_PALETTE = {
    rojo: '#ff4d6d',
    amarillo: '#ffd12e',
    azul: '#4d96ff',
    verde: '#52b788',
    morado: '#a06cd5',
    rosa: '#ff85a1',
    gris: '#8d99ae',
    naranja: '#ff9f1c',
    blanco: '#ffffff'
  };

  let selectedColors = [];

  function updateSlots() {
    slots.forEach((slot, idx) => {
      if (!slot) return;
      const colorKey = selectedColors[idx];
      if (colorKey && COLOR_PALETTE[colorKey]) {
        slot.style.backgroundColor = COLOR_PALETTE[colorKey];
        slot.style.borderColor = 'var(--nb-black)';
        slot.style.transform = 'scale(1.05)';
        slot.setAttribute('title', colorKey.toUpperCase());
      } else {
        slot.style.backgroundColor = 'var(--nb-white)';
        slot.style.transform = 'scale(1)';
        slot.removeAttribute('title');
      }
    });
  }

  function addColor(colorKey) {
    if (selectedColors.length >= 3) return;
    selectedColors.push(colorKey);
    updateSlots();
    if (feedback) feedback.textContent = '';
  }

  function removeLastColor() {
    if (!selectedColors.length) return;
    selectedColors.pop();
    updateSlots();
  }

  function clearAllColors() {
    selectedColors = [];
    updateSlots();
    if (feedback) feedback.textContent = '';
  }

  function verifyColorSequence() {
    if (selectedColors.length < 3) {
      if (feedback) {
        feedback.style.color = 'var(--nb-brown-dark)';
        feedback.textContent = 'Elige 3 colores para la combinación';
      }
      triggerError();
      return;
    }

    const isMatch = selectedColors.length === SECRET_SEQUENCE.length &&
      selectedColors.every((c, i) => c.toLowerCase() === SECRET_SEQUENCE[i].toLowerCase());

    if (isMatch) {
      if (feedback) {
        feedback.style.color = '#00875a';
        feedback.textContent = '¡Combinación correcta! Abriendo carta de amor... ♡';
      }

      colorBox.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      colorBox.style.opacity = '0';
      colorBox.style.transform = 'scale(0.96)';

      setTimeout(() => {
        rockGateScreen.classList.add('is-hidden');
        selectedColors = [];
        updateSlots();
        colorBox.style.opacity = '1';
        colorBox.style.transform = 'none';
        if (typeof onUnlockSuccess === 'function') {
          onUnlockSuccess();
        }
      }, 350);
    } else {
      if (feedback) {
        feedback.style.color = '#de350b';
        feedback.textContent = 'Combinación incorrecta. Vuelve a intentarlo mi amor';
      }
      triggerError();
      setTimeout(() => {
        selectedColors = [];
        updateSlots();
      }, 400);
    }
  }

  function triggerError() {
    if (!colorBox) return;
    colorBox.classList.remove('shake-error');
    void colorBox.offsetWidth; // re-flow
    colorBox.classList.add('shake-error');
  }

  // Vincular eventos solo una vez
  if (colorBox && !colorBox.dataset.bound) {
    colorBox.dataset.bound = 'true';

    document.querySelectorAll('.color-btn[data-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        if (color) addColor(color);
      });
    });

    document.getElementById('color-clear-btn')?.addEventListener('click', clearAllColors);
    document.getElementById('color-back-btn')?.addEventListener('click', removeLastColor);
    document.getElementById('unlock-rock-btn')?.addEventListener('click', verifyColorSequence);
  }

  // Función para restablecer estado al abrir
  return {
    show: () => {
      if (rockGateScreen) {
        rockGateScreen.classList.remove('is-hidden');
      }
      if (colorBox) {
        colorBox.style.opacity = '1';
        colorBox.style.transform = 'none';
      }
      clearAllColors();
    },
    hide: () => {
      if (rockGateScreen) {
        rockGateScreen.classList.add('is-hidden');
      }
    }
  };
}
