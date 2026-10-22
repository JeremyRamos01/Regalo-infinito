/**
 * Animador de Escritura a Lápiz para la Carta de Amor ♡
 * Efecto manuscrito orgánico tipo trazo a trazo con cursor de lápiz y pausas naturales
 */

export class LetterPencilAnimator {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('letter-content');
    this.statusEl = options.statusEl || document.getElementById('letter-status-text');
    this.skipBtn = options.skipBtn || document.getElementById('btn-skip-letter');
    this.replayBtn = options.replayBtn || document.getElementById('btn-replay-letter');
    
    this.sections = options.sections || [
      {
        type: 'greeting',
        className: 'letter-greeting-pencil',
        text: 'Mi amor hermosa,'
      },
      {
        type: 'paragraph',
        className: 'letter-paragraph-pencil',
        text: 'Cada rincón de este mundo virtual y real tiene sentido porque estás tú. Como en Lyoko, donde cada sector guarda un misterio, el misterio más grande y hermoso de mi vida ha sido encontrarte y enamorarme de cada una de tus risas, tus detalles y tu forma única de brillar.'
      },
      {
        type: 'paragraph',
        className: 'letter-paragraph-pencil',
        text: 'Ni la piedra más preciosa del universo compite con la magia que tienes. Gracias por ser mi lugar seguro, mi compañera de aventuras y el amor de mi vida.'
      },
      {
        type: 'signature',
        className: 'letter-signature-pencil',
        text: 'Siempre tuyo, con todo mi corazón ♡'
      }
    ];

    this.isAnimating = false;
    this.isSkipped = false;
    this.timeouts = [];
    this.charCounter = 0;

    this.initEvents();
  }

  initEvents() {
    this.skipBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.skip();
    });

    this.replayBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.start();
    });
  }

  clearTimeouts() {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  start() {
    if (!this.container) return;
    this.clearTimeouts();
    this.isAnimating = true;
    this.isSkipped = false;
    this.charCounter = 0;

    // Actualizar estado en interfaz
    if (this.statusEl) {
      this.statusEl.innerHTML = '<span class="pencil-live-dot"></span> Escribiendo con amor para ti...';
    }
    if (this.skipBtn) this.skipBtn.style.display = 'inline-flex';
    if (this.replayBtn) this.replayBtn.style.display = 'none';

    // Limpiar contenedor
    this.container.innerHTML = '';

    // Preparar el cursor de lápiz
    const caret = document.createElement('span');
    caret.className = 'pencil-caret';
    caret.innerHTML = '✏️';

    let currentSectionIdx = 0;

    const writeNextSection = () => {
      if (this.isSkipped || currentSectionIdx >= this.sections.length) {
        this.finish();
        return;
      }

      const sec = this.sections[currentSectionIdx];
      const p = document.createElement('p');
      p.className = sec.className;
      this.container.appendChild(p);
      p.appendChild(caret);

      let charIdx = 0;
      const fullText = sec.text;

      const typeChar = () => {
        if (this.isSkipped) {
          this.finish();
          return;
        }

        if (charIdx < fullText.length) {
          const ch = fullText[charIdx];
          
          // Insertar el carácter justo antes del lápiz
          const textNode = document.createTextNode(ch);
          p.insertBefore(textNode, caret);
          charIdx++;
          this.charCounter++;

          // Efecto de corazoncito o destello flotante suave cada ~30 caracteres
          if (this.charCounter % 28 === 0) {
            this.spawnSparkle(caret);
          }

          // Pausas orgánicas como si alguien estuviera pensando mientras escribe a mano
          let delay = 32 + Math.floor(Math.random() * 20); // Velocidad base agradable

          if (ch === ',' || ch === ';') {
            delay = 180 + Math.floor(Math.random() * 60);
          } else if (ch === '.' || ch === '!' || ch === '?') {
            delay = 340 + Math.floor(Math.random() * 100);
          } else if (ch === ' ') {
            delay = 45 + Math.floor(Math.random() * 25);
          }

          const t = setTimeout(typeChar, delay);
          this.timeouts.push(t);
        } else {
          // Sección terminada: pausa antes del siguiente párrafo
          const nextDelay = sec.type === 'greeting' ? 380 : 480;
          const t = setTimeout(() => {
            currentSectionIdx++;
            writeNextSection();
          }, nextDelay);
          this.timeouts.push(t);
        }
      };

      typeChar();
    };

    writeNextSection();
  }

  skip() {
    this.isSkipped = true;
    this.clearTimeouts();
    this.renderFull();
    this.finish();
  }

  renderFull() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.sections.forEach(sec => {
      const p = document.createElement('p');
      p.className = sec.className;
      p.textContent = sec.text;
      this.container.appendChild(p);
    });
  }

  finish() {
    this.isAnimating = false;
    this.clearTimeouts();

    // Remover cursor si queda alguno
    this.container.querySelectorAll('.pencil-caret').forEach(c => c.remove());

    if (this.statusEl) {
      this.statusEl.innerHTML = '✨ Carta escrita con todo mi amor ♡';
    }
    if (this.skipBtn) this.skipBtn.style.display = 'none';
    if (this.replayBtn) this.replayBtn.style.display = 'inline-flex';

    // Disparar una ráfaga suave de mini corazones al finalizar
    this.celebrateCompletion();
  }

  spawnSparkle(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const sparkle = document.createElement('span');
    sparkle.className = 'pencil-sparkle-dot';
    sparkle.textContent = Math.random() > 0.4 ? '♡' : '✨';
    sparkle.style.left = `${rect.left + window.scrollX + (Math.random() - 0.5) * 14}px`;
    sparkle.style.top = `${rect.top + window.scrollY - 8}px`;
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1200);
  }

  celebrateCompletion() {
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        const heart = document.createElement('span');
        heart.className = 'pencil-completion-heart';
        heart.textContent = ['💖', '💌', '🌸', '✨', '🤍'][i % 5];
        heart.style.left = `${rect.left + window.scrollX + Math.random() * rect.width}px`;
        heart.style.top = `${rect.top + window.scrollY + rect.height - 30}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1600);
      }, i * 180);
    }
  }
}
