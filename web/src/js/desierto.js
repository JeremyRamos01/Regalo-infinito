import { CHAT_ANALYTICS } from './chatData.js';
import { initMiniMusicPlayer } from './components/miniMusicPlayer.js';

document.addEventListener('DOMContentLoaded', () => {
  initDesertApp();
});

function initDesertApp() {
  const { overview, duels, wordCloud, daysOfWeekDistribution } = CHAT_ANALYTICS;

  // 1. Renderizar KPIs y Cápsula Histórica
  renderKpis(overview);
  renderHistoricalMilestones(overview);

  // 2. Renderizar Nube de Palabras Flotantes
  renderWordCloud(wordCloud);

  // 3. Renderizar Duelos con Filtros
  renderDuelsWithCategories(duels, overview);

  // 4. Renderizar Gráfico Semanal y Estilos de Chat
  renderWeeklyChart(daysOfWeekDistribution, overview.mostActiveDay);
  renderChatStyleComparison(overview);

  // 5. Renderizar Emojis y Hábitos
  renderEmojisAndHabits(overview);

  // 6. Configurar Tabs
  setupTabs();

  // 7. Configurar Modal de Palabras
  setupWordModal();

  // 8. Companion Flotante Bubu & Dudu
  setupBubuFloatingCompanion();

  // 9. Mini Reproductor de Música del Desierto
  initMiniMusicPlayer({ biome: 'desierto', title: 'Sector Desierto ♡' });
}

function renderKpis(ov) {
  const totalEl = document.getElementById('kpi-total-msg');
  const daysEl = document.getElementById('kpi-total-days');
  const recordEl = document.getElementById('kpi-record-day');
  const peakEl = document.getElementById('kpi-peak-hour');
  const loveEl = document.getElementById('kpi-love-count');
  const activeDayEl = document.getElementById('kpi-active-day');

  if (totalEl) totalEl.textContent = Number(ov.totalMessages).toLocaleString('es-ES');
  if (daysEl) daysEl.textContent = `${ov.totalDaysTalking} días`;
  if (recordEl) recordEl.textContent = `${Number(ov.maxDayMessages).toLocaleString('es-ES')} msgs`;
  if (peakEl) peakEl.textContent = ov.peakHour;
  if (loveEl) loveEl.textContent = '19.791 veces';
  if (activeDayEl) activeDayEl.textContent = ov.mostActiveDay;
}

function renderHistoricalMilestones(ov) {
  const container = document.getElementById('first-message-capsule');
  if (!container || !ov) return;

  const milestones = ov.historicalMilestones;
  if (!milestones) {
    const msg = ov.firstMessage;
    if (!msg) return;
    container.innerHTML = `
      <div class="history-card-wrapper">
        <span class="history-pill-tag">📜 El Primer Mensaje de Nuestra Historia</span>
        <h2 class="history-title">"${escapeHtml(msg.text)}"</h2>
        <span class="col-meta">📅 ${msg.date} a las ${msg.time}</span>
      </div>
    `;
    return;
  }

  const { firstBlocks, firstTeAmo, mutualTeAmo } = milestones;

  const blocksHtml = firstBlocks.map((b, idx) => {
    const isJeremy = b.sender === 'jeremy';
    const senderTheme = isJeremy ? 'is-jeremy' : 'is-raquel';
    const avatarBadge = isJeremy ? '💙 Jeremy' : '💖 Raquel';

    const msgsHtml = b.messages.map(m => {
      const isMedia = m.includes('📷') || m.includes('Multimedia');
      return `<div class="chat-bubble-row ${isMedia ? 'is-media' : ''}">${escapeHtml(m)}</div>`;
    }).join('');

    return `
      <div class="chat-block-unit ${senderTheme}">
        <div class="chat-block-meta">
          <span class="chat-avatar-pill">${avatarBadge}</span>
          <span class="chat-block-time">Bloque ${idx + 1} · ${b.date} ${b.time}</span>
        </div>
        <div class="chat-block-bubbles">
          ${msgsHtml}
        </div>
      </div>
    `;
  }).join('');

  const dialogueHtml = mutualTeAmo.dialogue.map(d => {
    const isJeremy = d.sender === 'jeremy';
    const isBoth = d.sender === 'both';
    const dTheme = isJeremy ? 'dialogue-jeremy' : (isBoth ? 'dialogue-both' : 'dialogue-raquel');
    const badgeHtml = d.highlight ? `<span class="dialogue-highlight-pill">${d.highlight}</span>` : '';

    return `
      <div class="dialogue-box ${dTheme}">
        <div class="dialogue-header">
          <strong>${d.senderName}</strong>
          ${badgeHtml}
        </div>
        <p class="dialogue-content">${escapeHtml(d.text)}</p>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="history-card-wrapper">
      <div class="history-main-header">
        <div class="history-pill-tag">📜 Cápsula del Tiempo · Origen & Primeros Hitos</div>
        <h2 class="history-title">Cómo Comenzó Nuestra Historia de Amor ♡</h2>
        <p class="history-subtitle">Los 3 primeros bloques de conversación en WhatsApp y el momento exacto en el que nació nuestro "Te Amo".</p>
      </div>

      <div class="history-grid-layout">
        <!-- Columna Izquierda: Los 3 Primeros Bloques -->
        <div class="history-col-card blocks-card">
          <div class="history-col-header">
            <div class="col-icon">💬</div>
            <div>
              <h3 class="col-title">Los 3 Primeros Bloques de Chat</h3>
              <span class="col-meta">18 de Enero de 2026 · El primer saludo</span>
            </div>
          </div>
          <div class="chat-stream-container">
            ${blocksHtml}
          </div>
        </div>

        <!-- Columna Derecha: Hitos de "Te Amo" -->
        <div class="history-col-right">
          <!-- Hito 1: Quién dijo Te Amo primero -->
          <div class="history-col-card first-love-card">
            <div class="history-col-header">
              <div class="col-icon heart-bounce">💘</div>
              <div style="flex: 1;">
                <h3 class="col-title">¿Quién dijo "Te Amo" primero?</h3>
                <span class="col-meta">📅 ${firstTeAmo.date} · ${firstTeAmo.time} (${firstTeAmo.daysSinceStart} días después)</span>
              </div>
              <span class="col-winner-badge">👑 Jeremy Ramos</span>
            </div>
            
            <div class="love-quote-box" style="display: flex; gap: 0.8rem; align-items: center;">
              <img src="../assets/bubu-dudu/bubu-dudu-kiss-cheek.gif" alt="Bubu y Dudu besito" class="bubu-sticker" style="width: 68px; height: 68px; border-radius: 14px; flex-shrink: 0;" />
              <div style="flex: 1; position: relative;">
                <span class="quote-mark">“</span>
                <p class="quote-content">${escapeHtml(firstTeAmo.quote)}</p>
                <div class="quote-signature">💙 Jeremy a Raquelita (${firstTeAmo.time})</div>
              </div>
            </div>

            <p class="milestone-explanation">
              ${escapeHtml(firstTeAmo.detail)}
            </p>
          </div>

          <!-- Hito 2: Cuándo empezó a ser mutuo -->
          <div class="history-col-card mutual-love-card">
            <div class="history-col-header">
              <div class="col-icon">💞</div>
              <div style="flex: 1;">
                <h3 class="col-title">${escapeHtml(mutualTeAmo.title)}</h3>
                <span class="col-meta">📅 ${mutualTeAmo.date} · ${mutualTeAmo.time}</span>
              </div>
              <span class="col-winner-badge mutual-badge">✨ Sellado Mutuo</span>
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.6rem;">
              <img src="../assets/bubu-dudu/bubu-dudu-happy-dance.gif" alt="Bubu y Dudu celebrando" class="bubu-sticker" style="width: 58px; height: 58px; border-radius: 12px; flex-shrink: 0;" />
              <p class="milestone-explanation" style="margin: 0;">
                ${escapeHtml(mutualTeAmo.context)}
              </p>
            </div>

            <div class="dialogue-stream">
              ${dialogueHtml}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderWordCloud(words) {
  const container = document.getElementById('word-cloud-container');
  if (!container) return;

  container.innerHTML = '';

  const maxTotal = words[0]?.total || 100;
  const minTotal = words[words.length - 1]?.total || 1;

  const TAG_COLORS = [
    { bg: '#ffe5ec' },
    { bg: '#fff0f3' },
    { bg: '#e8f4f8' },
    { bg: '#fefae0' },
    { bg: '#eaf7ee' },
    { bg: '#f3e8ff' },
    { bg: '#fff8eb' }
  ];

  words.forEach((w, idx) => {
    const ratio = Math.sqrt((w.total - minTotal) / (maxTotal - minTotal || 1));
    const fontSize = (0.8 + ratio * 1.5).toFixed(2);

    const tag = document.createElement('button');
    tag.type = 'button';
    tag.className = `cloud-tag float-${(idx % 3) + 1}`;
    
    const colorTheme = TAG_COLORS[idx % TAG_COLORS.length];
    tag.style.backgroundColor = colorTheme.bg;
    tag.style.fontSize = `${fontSize}rem`;
    tag.style.animationDelay = `${(idx * 0.1).toFixed(2)}s`;

    tag.innerHTML = `<span>${w.word}</span> <small style="font-size: 0.65em; opacity: 0.75;">(${w.total})</small>`;

    tag.addEventListener('click', () => {
      openWordModal(w);
    });

    container.appendChild(tag);
  });
}

const DUEL_STORIES = {
  te_amo: 'Jeremy gana declarando su amor con 3.420 "te amo" frente a 2.539 de Raquel (57% vs 43%) ♡',
  amor: '¡Jeremy con una ligera ventaja (52% vs 48%), pero ambos la dicen prácticamente sin parar!',
  hermosa: 'Jeremy gana de goleada (98% vs 2%): el fan número 1 de tu carita y de tu sonrisa preciosa.',
  princesa: 'Jeremy gana indiscutible: siempre tratándote como a su reina y princesa de su corazón.',
  mi_vida: 'Jeremy gana llamándola "mi vida" a cada oportunidad (56% vs 44%).',
  te_extrano: 'Jeremy gana expresando sus ganas de verte y contar las horas para abrazarte (64% vs 36%).',
  te_adoro: 'Jeremy gana dedicándole palabras dulces de adoración (72% vs 28%).',
  beso: 'Jeremy gana por poquito enviando besos virtuales (51% vs 49%), ¡medio parejos!',
  abrazo: 'Jeremy gana por la mínima enviando abrazos con el alma (52% vs 48%), ¡medio parejos!',
  dios: 'Jeremy gana por poco (52% vs 48%), ambos poniendo siempre a Dios en el centro.',
  futuro: 'Jeremy gana por poquito soñando despierto con su futuro juntos (52% vs 48%).',
  jaja: 'Jeremy gana por poco en risas cotidianas (53% vs 47%), ¡bastante parejos!',
  jaja_caps: 'Raquel arrasa haciendo temblar el teclado con sus risas en MAYÚSCULAS (73% vs 27%).',
  sueno: 'Raquel reina indiscutible de tener sueño y de irse a mimir tiernamente (63% vs 37%).',
  hambre: 'Raquel gana siempre teniendo antojos de comiditas ricas (61% vs 39%).',
  quejas: 'Raquel gana haciendo pucheros adorables con sus "jooo" y "ayyy" (59% vs 41%).',
  perdon: 'Raquel gana disculpándose siempre con tierna humildad (55% vs 45%).',
  planes: 'Raquel gana proponiendo citas, salidas y momentos para verse (56% vs 44%).',
  buenas_noches: 'Raquel gana despidiendo el día con dulces sueños (54% vs 46%).',
  buenos_dias: 'Raquel madruga más y gana dando los primeros buenos días (52% vs 48%).',
  estudiar: 'Raquel gana comentando sus horas de estudio y exámenes (55% vs 45%).',
  trabajo: 'Raquel gana comentando cosas del trabajo y la rutina (59% vs 41%).',
  cansado: 'Raquel gana comentando el cansancio de las jornadas (57% vs 43%).',
  guapo: 'Raquel gana recordándole a Jeremy lo guapo que es (69% vs 31%).',
  buho_nocturno: 'Raquel reina indiscutible de las madrugadas con más de 31.000 mensajes nocturnos (69% vs 31%).',
  multimedia: 'Jeremy gana mandando fotos, audios, memes y stickers sin parar (56% vs 44%).',
  long_messages: 'Jeremy gana escribiendo cartitas y testamentos llenos de sentimiento (70% vs 30%).',
  curioso: 'Jeremy gana preguntando qué tal el día, qué haces y cómo estás (59% vs 41%).'
};

const DUEL_CATEGORIES = {
  te_amo: 'amor',
  amor: 'amor',
  hermosa: 'amor',
  princesa: 'amor',
  mi_vida: 'amor',
  te_extrano: 'amor',
  te_adoro: 'amor',
  beso: 'amor',
  abrazo: 'amor',
  futuro: 'amor',
  guapo: 'amor',
  
  jaja: 'risas',
  jaja_caps: 'risas',
  quejas: 'risas',
  perdon: 'risas',
  multimedia: 'risas',

  buho_nocturno: 'habitos',
  buenos_dias: 'habitos',
  buenas_noches: 'habitos',
  hambre: 'habitos',
  sueno: 'habitos',
  cansado: 'habitos',
  estudiar: 'habitos',
  trabajo: 'habitos',
  dios: 'habitos',
  planes: 'habitos',
  long_messages: 'habitos',
  curioso: 'habitos'
};

function renderDuelsWithCategories(duels, ov) {
  const container = document.getElementById('duels-container');
  if (!container) return;

  const allDuels = [
    ...duels,
    {
      key: 'buho_nocturno',
      label: 'Búho Nocturno (Madrugadas)',
      jeremy: ov.jeremy.nightMessages,
      raquel: ov.raquel.nightMessages,
      total: ov.jeremy.nightMessages + ov.raquel.nightMessages,
      winner: ov.raquel.nightMessages > ov.jeremy.nightMessages ? 'Raquel' : 'Jeremy'
    },
    {
      key: 'multimedia',
      label: 'Rey/Reina de Fotos & Stickers',
      jeremy: ov.jeremy.media,
      raquel: ov.raquel.media,
      total: ov.jeremy.media + ov.raquel.media,
      winner: ov.jeremy.media > ov.raquel.media ? 'Jeremy' : 'Raquel'
    },
    {
      key: 'long_messages',
      label: 'El de los Testamentos Largos (>150 car.)',
      jeremy: ov.jeremy.longMessages,
      raquel: ov.raquel.longMessages,
      total: ov.jeremy.longMessages + ov.raquel.longMessages,
      winner: ov.jeremy.longMessages > ov.raquel.longMessages ? 'Jeremy' : 'Raquel'
    },
    {
      key: 'curioso',
      label: 'El Más Preguntón / Curioso (¿?)',
      jeremy: ov.jeremy.questions,
      raquel: ov.raquel.questions,
      total: ov.jeremy.questions + ov.raquel.questions,
      winner: ov.jeremy.questions > ov.raquel.questions ? 'Jeremy' : 'Raquel'
    }
  ];

  function drawFiltered(filterCat) {
    container.innerHTML = '';
    const filtered = filterCat === 'all' ? allDuels : allDuels.filter(d => (DUEL_CATEGORIES[d.key] || 'amor') === filterCat);

    filtered.forEach(d => {
      const card = document.createElement('div');
      card.className = 'duel-card';

      const jPct = d.total ? Math.round((d.jeremy / d.total) * 100) : 50;
      const rPct = 100 - jPct;

      const isClose = Math.abs(jPct - rPct) <= 4;
      const winnerName = d.winner === 'Raquel' ? 'Raquel' : 'Jeremy';
      const winnerBadge = isClose ? `👑 ${winnerName} (Medio parejo)` : `👑 ${winnerName}`;
      const commentary = DUEL_STORIES[d.key] || (d.winner === 'Raquel' ? 'Raquel lidera con ventaja en esta categoría ♡' : 'Jeremy lidera con ventaja en esta categoría ♡');

      card.innerHTML = `
        <div class="duel-header">
          <h3 class="duel-title">${d.label}</h3>
          <span class="duel-winner-badge">${winnerBadge}</span>
        </div>
        <div class="duel-bar-container">
          <div class="duel-track">
            <div class="duel-bar-j" style="width: ${jPct}%;" title="Jeremy: ${d.jeremy} (${jPct}%)"></div>
            <div class="duel-bar-r" style="width: ${rPct}%;" title="Raquel: ${d.raquel} (${rPct}%)"></div>
          </div>
          <div class="duel-scores">
            <span class="score-j">💙 Jeremy: ${Number(d.jeremy).toLocaleString('es-ES')} (${jPct}%)</span>
            <span class="score-r">💖 Raquel: ${Number(d.raquel).toLocaleString('es-ES')} (${rPct}%)</span>
          </div>
        </div>
        <p class="duel-comment">${commentary}</p>
      `;

      container.appendChild(card);
    });
  }

  // Vincular botones de filtro de duelos
  const filterBtns = document.querySelectorAll('.duel-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      drawFiltered(btn.dataset.category);
    });
  });

  drawFiltered('all');
}

function renderWeeklyChart(daysData, winnerDay) {
  const container = document.getElementById('days-bars-container');
  if (!container || !daysData) return;

  const totalPerDay = daysData.labels.map((_, i) => daysData.jeremy[i] + daysData.raquel[i]);
  const maxVal = Math.max(...totalPerDay);

  container.innerHTML = daysData.labels.map((dayName, idx) => {
    const val = totalPerDay[idx];
    const pct = Math.round((val / maxVal) * 100);
    const isWinner = dayName === winnerDay;

    return `
      <div class="day-bar-col">
        <div class="day-bar-visual ${isWinner ? 'is-winner' : ''}" style="height: ${Math.max(14, pct)}%;">
          ${isWinner ? '<span class="day-crown">👑</span>' : ''}
        </div>
        <span class="day-val">${Number(val).toLocaleString('es-ES')}</span>
        <span class="day-label">${dayName.slice(0, 3)}</span>
      </div>
    `;
  }).join('');
}

function renderChatStyleComparison(ov) {
  const container = document.getElementById('style-comparison-container');
  if (!container) return;

  container.innerHTML = `
    <div class="style-card" style="border-top: 6px solid #4d96ff;">
      <h3 class="style-card-title">💙 El Estilo de Jeremy</h3>
      <div class="style-stat-row">
        <span>Longitud promedio:</span>
        <b>${ov.jeremy.avgChars} letras / msg</b>
      </div>
      <div class="style-stat-row">
        <span>Cartitas y testamentos:</span>
        <b>${ov.jeremy.longMessages} mensajes largos</b>
      </div>
      <div class="style-stat-row">
        <span>Preguntas al día:</span>
        <b>${Number(ov.jeremy.questions).toLocaleString('es-ES')} preguntas</b>
      </div>
      <div class="style-stat-row">
        <span>Fotos y stickers:</span>
        <b>${Number(ov.jeremy.media).toLocaleString('es-ES')} archivos</b>
      </div>
      <p class="duel-comment" style="margin-top: 0.3rem;">
        Jeremy es detallista, reflexivo, te llena de preguntas para cuidarte y escribe con el corazón.
      </p>
    </div>

    <div class="style-card" style="border-top: 6px solid #ff758f;">
      <h3 class="style-card-title">💖 El Estilo de Raquel</h3>
      <div class="style-stat-row">
        <span>Longitud promedio:</span>
        <b>${ov.raquel.avgChars} letras / msg</b>
      </div>
      <div class="style-stat-row">
        <span>Modo ráfaga:</span>
        <b>¡93.632 mensajes directos!</b>
      </div>
      <div class="style-stat-row">
        <span>Desvelos nocturnos:</span>
        <b>${Number(ov.raquel.nightMessages).toLocaleString('es-ES')} en madrugada</b>
      </div>
      <div class="style-stat-row">
        <span>Primer saludo del día:</span>
        <b>Ganadora en 157 mañanas</b>
      </div>
      <p class="duel-comment" style="margin-top: 0.3rem;">
        Raquel es pura chispa y espontaneidad: ráfagas rápidas de mensajes, madrugadas enteras y risas en mayúsculas.
      </p>
    </div>
  `;
}

function renderEmojisAndHabits(ov) {
  const jList = document.getElementById('jeremy-emoji-list');
  const rList = document.getElementById('raquel-emoji-list');

  if (jList) {
    jList.innerHTML = ov.jeremy.topEmojis.map(e => `
      <div class="emoji-pill">
        <span>${e.emoji}</span>
        <span class="emoji-count">${Number(e.count).toLocaleString('es-ES')}</span>
      </div>
    `).join('');
  }

  if (rList) {
    rList.innerHTML = ov.raquel.topEmojis.map(e => `
      <div class="emoji-pill">
        <span>${e.emoji}</span>
        <span class="emoji-count">${Number(e.count).toLocaleString('es-ES')}</span>
      </div>
    `).join('');
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll('.desert-tab-btn');
  const sections = {
    cloud: document.getElementById('tab-cloud-section'),
    duels: document.getElementById('tab-duels-section'),
    habits: document.getElementById('tab-habits-section'),
    emojis: document.getElementById('tab-emojis-section')
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      btn.classList.add('is-active');

      const target = btn.dataset.tab;
      if (target === 'all') {
        Object.values(sections).forEach(s => s && s.classList.remove('is-hidden'));
      } else {
        Object.entries(sections).forEach(([key, sec]) => {
          if (!sec) return;
          if (key === target) sec.classList.remove('is-hidden');
          else sec.classList.add('is-hidden');
        });
      }
    });
  });
}

function setupWordModal() {
  const modal = document.getElementById('word-modal');
  const closeBtn = document.getElementById('close-word-modal-btn');

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('is-hidden');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('is-hidden');
  });
}

function openWordModal(w) {
  const modal = document.getElementById('word-modal');
  const title = document.getElementById('word-modal-title');
  const total = document.getElementById('word-modal-total');
  const jeremyScore = document.getElementById('word-modal-jeremy');
  const raquelScore = document.getElementById('word-modal-raquel');
  const barJ = document.getElementById('word-bar-j');
  const barR = document.getElementById('word-bar-r');
  const note = document.getElementById('word-modal-note');

  if (!modal) return;

  const jPct = w.total ? Math.round((w.jeremy / w.total) * 100) : 50;
  const rPct = 100 - jPct;

  if (title) title.textContent = `"${w.word}"`;
  if (total) total.textContent = `${Number(w.total).toLocaleString('es-ES')} veces dicha en el chat`;
  if (jeremyScore) jeremyScore.textContent = `Jeremy: ${w.jeremy} (${jPct}%)`;
  if (raquelScore) raquelScore.textContent = `Raquel: ${w.raquel} (${rPct}%)`;

  if (barJ) barJ.style.width = `${jPct}%`;
  if (barR) barR.style.width = `${rPct}%`;

  if (note) {
    if (w.jeremy > w.raquel) {
      note.textContent = `Jeremy la usó más veces (${w.jeremy} frente a ${w.raquel}). ♡`;
    } else if (w.raquel > w.jeremy) {
      note.textContent = `Raquel la usó más veces (${w.raquel} frente a ${w.jeremy}). ♡`;
    } else {
      note.textContent = `¡Empate exacto! Ambos la dijeron ${w.jeremy} veces. ♡`;
    }
  }

  modal.classList.remove('is-hidden');
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
