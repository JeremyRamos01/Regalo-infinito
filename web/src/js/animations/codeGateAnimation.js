export function initChiclosoCodeGate(onUnlockSuccess) {
  const gateScreen = document.getElementById('gate-screen');
  const gummyBox = document.getElementById('gummy-box');
  const slots = Array.from(document.querySelectorAll('.code-slot'));
  const feedback = document.getElementById('gate-feedback');
  const SECRET_CODE = '2206';
  let currentInput = '';

  if (!gateScreen || !gummyBox) return;

  gateScreen.classList.remove('is-hidden');
  gummyBox.style.opacity = '1';
  gummyBox.style.transform = 'translateY(0)';

  function renderSlots() {
    slots.forEach((slot, idx) => {
      const char = currentInput[idx] || '';
      slot.textContent = char;
      slot.classList.toggle('filled', Boolean(char));
    });
  }

  function pushDigit(digit) {
    if (currentInput.length >= 4) return;
    currentInput += digit;
    renderSlots();
    if (feedback) feedback.textContent = '';
  }

  function removeDigit() {
    if (!currentInput.length) return;
    currentInput = currentInput.slice(0, -1);
    renderSlots();
  }

  function verifyCode() {
    if (currentInput.length < 4) {
      if (feedback) {
        feedback.style.color = 'var(--nb-black)';
        feedback.textContent = 'Introduce los 4 dígitos';
      }
      triggerError();
      return;
    }

    if (currentInput === SECRET_CODE) {
      if (feedback) {
        feedback.style.color = '#00875a';
        feedback.textContent = '¡Código aceptado! Accediendo...';
      }

      gummyBox.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      gummyBox.style.opacity = '0';
      gummyBox.style.transform = 'scale(0.96)';

      setTimeout(() => {
        gateScreen.classList.add('is-hidden');
        currentInput = '';
        renderSlots();
        if (typeof onUnlockSuccess === 'function') onUnlockSuccess();
      }, 250);
    } else {
      if (feedback) {
        feedback.style.color = '#de350b';
        feedback.textContent = 'Código incorrecto. Vuelve a intentarlo';
      }
      triggerError();
      currentInput = '';
      setTimeout(renderSlots, 200);
    }
  }

  function triggerError() {
    gummyBox.classList.remove('shake-error');
    void gummyBox.offsetWidth; // re-flow
    gummyBox.classList.add('shake-error');
  }

  if (!gummyBox.dataset.bound) {
    gummyBox.dataset.bound = 'true';

    document.querySelectorAll('.key-btn[data-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.key;
        if (val === 'clear') {
          currentInput = '';
          renderSlots();
        } else if (val === 'back') {
          removeDigit();
        } else {
          pushDigit(val);
        }
      });
    });

    document.getElementById('unlock-btn')?.addEventListener('click', verifyCode);

    window.addEventListener('keydown', (e) => {
      if (gateScreen.classList.contains('is-hidden')) return;
      if (/^[0-9]$/.test(e.key)) pushDigit(e.key);
      else if (e.key === 'Backspace') removeDigit();
      else if (e.key === 'Enter') verifyCode();
    });
  }
}
