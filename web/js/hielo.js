// Sector Hielo: Mapa Lineal de Recuerdos y Sucesos (Siempre visible e independiente)
import { initMiniMusicPlayer } from './components/miniMusicPlayer.js';

const TIMELINE_EVENTS = [
  {
    id: "18-enero",
    date: "18 de Enero de 2026",
    tag: "El primer 'Wenas'",
    icon: "👋",
    title: "Ese primer mensaje que lo cambió todo",
    desc: "Vi tu foto y no me pude aguantar las ganas de escribirte aquel 'Wenas Raqueeeeeel'. Me dijiste que andabas estudiando, y yo con cualquier excusa te pregunté por tus exámenes para seguir sacándote conversación. Ahí empezó lo mejor que me ha pasado.",
    quote: "— 'Joe q mal y todavía le faltan exámenes? Por cierto que tal el examen del otro day? 👀'"
  },
  {
    id: "28-enero",
    date: "28 de Enero de 2026",
    tag: "Nuestras charlas",
    icon: "☕",
    title: "Enganchados a hablar a todas horas",
    desc: "Empezamos con los audios larguísimos contándonos el día, nuestras cosas y dándonos ánimos. Me di cuenta enseguida de que hablar contigo me daba una calma increíble y que el día no estaba completo sin ti.",
    quote: "— Entre risas tontas y anécdotas, se nos pasaban las horas volando sin darnos ni cuenta..."
  },
  {
    id: "14-febrero",
    date: "14 de Febrero de 2026",
    tag: "San Valentín",
    icon: "💌",
    title: "Nuestro primer 14 de Febrero",
    desc: "Apenas llevábamos un mes hablando y ya sentía que te conocía de toda la vida.",
    quote: "— 'Gracias por estar aquí Raquel, haces que todo sea mucho más bonito.'"
  },
  {
    id: "20-febrero",
    date: "20 de Febrero de 2026",
    tag: "Día especial",
    icon: "🌸",
    title: "20 de Febrero",
    desc: "Este fue el día en el que tú y yo decidimos comenzar con lo que las personas conocen como: Vida Feliz. Llevaba tanto tiempo esperándote que pensé que eras irreal hasta que me di cuenta de que sí estás aquí conmigo.",
    quote: "",
    isKeyDate: true
  },
  {
    id: "24-febrero",
    date: "24 de Febrero de 2026",
    tag: "Lo que sentía",
    icon: "💖",
    title: "Cuando no me aguanté y te dije 'Te amo'",
    desc: "Llevaba días sintiéndolo tan fuerte que ya no me cabía dentro del pecho. A media tarde no pude más y te lo solté directo: 'Que te amo demasiado'. Fue de las cosas más sinceras y bonitas que he sentido jamás.",
    quote: "— 'Que te amo demasiado 🥰🥹'"
  },
  {
    id: "2-marzo",
    date: "2 de Marzo de 2026",
    tag: "Consentirte",
    icon: "🐻",
    title: "¿A que no sabes qué?",
    desc: "Te solté de la nada: '¿Sabes que aparte de quererte te amo, no?'. Me encanta recordártelo a cada rato, de sorpresa, solo para verte sonreír y que nunca se te olvide lo loco que me traes.",
    quote: "— Cada día que pasaba tenía más claro que no te cambio por nada en este mundo."
  },
  {
    id: "3-marzo",
    date: "3 de Marzo de 2026",
    tag: "Día especial",
    icon: "🌟",
    title: "3 de Marzo",
    desc: "Este día, luego de la guerra de tus padres jejee, nos vimos de arriba a abajo y todo nuestro corazón por primera vez conoció el calor del otro.",
    quote: "",
    isKeyDate: true
  },
  {
    id: "4-marzo",
    date: "4 de Marzo de 2026",
    tag: "Inolvidable",
    icon: "💍",
    title: "Nuestra noche más bonita",
    desc: "De madrugada, después de hablar de todo y superar cositas juntos, nos abrimos en canal y nos dijimos con el corazón en la mano todo lo que sentimos. Tú me dijiste que era el dueño de tu corazón y yo supe que contigo quiero llegar a viejito.",
    quote: "— '...Raquel te amo con locura, seremos viejitos y nos amaremos siempre...'\n— 'Jeremy de mi vida y el dueño de mi corazón 🥰, este amor no hará más que crecer...'"
  },
  {
    id: "21-marzo",
    date: "21 de Marzo de 2026",
    tag: "Día especial",
    icon: "🌼",
    title: "21 de Marzo",
    desc: "Día donde el sol se posó sobre tu sonrisa para mirarte a la cara y que diga que tus preciosos ojos necesitasen que la naturaleza con estas flores me ayudasen a ver el maravilloso color de tu brillo, mi amor",
    quote: "",
    isKeyDate: true
  },
  {
    id: "10-abril",
    date: "10 de Abril de 2026",
    tag: "Récord de risas",
    icon: "🔥",
    title: "El día que no soltamos el móvil",
    desc: "Ese día fue una auténtica locura: más de 2.000 mensajes sin parar. Riendo, contándonos cualquier tontería, fotos de lo que hacíamos... Literalmente no podíamos despegarnos porque hablar contigo es lo más divertido y lindo del mundo.",
    quote: "— ¡Nos daban las tantas hablando y parecía que acabábamos de empezar!"
  },
  {
    id: "mayo-julio",
    date: "Mayo - Julio de 2026",
    tag: "Soñando juntos",
    icon: "🏰",
    title: "Nuestras noches planeando el futuro",
    desc: "Todas esas madrugadas despiertos soñando: cómo será nuestra casita, los viajes que haremos y la ilusión de construir una vida los dos. Cuando todos duermen, nosotros seguimos planeando nuestro futuro.",
    quote: "— En la calma de la noche, donde solo existimos tú y yo."
  },
  {
    id: "21-julio",
    date: "21 de Julio de 2026",
    tag: "Día especial",
    icon: "☀️",
    title: "21 de Julio",
    desc: "Día Ghibli jejej, este día fue muy bonito y especial, ya que descubrimos que nuestro amor hasta en películas más viejas que nosotros se veía reflejado. Fue asombroso.",
    quote: "",
    isKeyDate: true
  },
  {
    id: "momento-memorable",
    date: "21 - 22 de Julio de 2026",
    tag: "Momento memorable",
    icon: "🕊️",
    title: "Momento memorable",
    desc: "Este momento fue escencial, ya que nuestras almas comprendieron que el Señor si le habia dado lo idóneo que necesitabamos. Lo que nuestras almas querian: El amor de verdad.",
    quote: "",
    isKeyDate: true
  },
  {
    id: "22-julio",
    date: "22 de Julio de 2026",
    tag: "Día especial",
    icon: "✨",
    title: "22 de Julio",
    desc: "Día en el que POR FIN consolidamos lo nuestro amor. Luego de tantas semanas, pensando que tenía que pedirte ser mi novia y luego de tantas veces que le decía al Señor que me permitiera decírtelo bien... Mi vida se terminó de llenar de amor y el SÍ fue el que yo tanto necesitaba",
    quote: "",
    isKeyDate: true
  },
  {
    id: "presente",
    date: "Hoy y Por Siempre",
    tag: "Hoy y siempre",
    icon: "👑",
    title: "Y todo lo que nos queda por vivir",
    desc: "Todos estos meses a tu lado solo me demuestran que eres lo mejor de mi vida. Gracias por cada risa, cada abrazo y por ser mi paz. Eres el amor de mi vida, mi princesa Raquel, hoy, mañana y hasta que seamos viejitos.",
    quote: "— 'Nos amamos señorita, y de la mano de Dios vamos para adelante siempre ♡'"
  }
];

let savedMediaMap = {};

// 1. Cargar lo que tengamos en localStorage de forma preliminar
try {
  savedMediaMap = JSON.parse(localStorage.getItem('hielo_timeline_media') || '{}');
} catch (e) { }

async function saveMediaLocally(milestoneId, file, onProgress) {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name);
  onProgress(10);

  let mediaData = null;

  // 1. PRIORIDAD ABSOLUTA: Subir a Firebase Storage en la carpeta 'videos'
  try {
    const fb = await import('./services/firebase.js');
    if (fb && fb.uploadTimelineMedia) {
      onProgress(20);
      mediaData = await fb.uploadTimelineMedia(milestoneId, file, (pct) => {
        onProgress(Math.min(95, Math.max(20, Math.round(20 + pct * 0.75))));
      });
      if (mediaData && mediaData.url) {
        savedMediaMap[milestoneId] = mediaData;
        console.log(`[Hielo] Recuerdo guardado con éxito en Firebase Storage (videos):`, mediaData);
      }
    }
  } catch (err) {
    console.warn("[Firebase Storage upload]:", err);
  }

  // 2. Si Firebase falló por falta de red, intentar servidor local de respaldo
  if (!mediaData || !mediaData.url) {
    try {
      const resp = await fetch('/api/upload-media', {
        method: 'POST',
        headers: {
          'x-milestone-id': milestoneId,
          'x-file-name': encodeURIComponent(file.name),
          'content-type': file.type || 'application/octet-stream'
        },
        body: file
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.media) {
          mediaData = json.media;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback a DataURL para visualización instantánea local
  if (!mediaData || !mediaData.url) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    mediaData = {
      url: dataUrl,
      type: isVideo ? 'video' : 'image',
      fileName: file.name,
      uploadedAt: new Date().toISOString()
    };
  }

  // Guardar en caché local
  try {
    const localStore = JSON.parse(localStorage.getItem('hielo_timeline_media') || '{}');
    localStore[milestoneId] = mediaData;
    localStorage.setItem('hielo_timeline_media', JSON.stringify(localStore));
  } catch (e) {
    console.warn("[LocalStorage quota]:", e.message);
  }

  onProgress(100);
  return mediaData;
}

async function syncAllSavedMedia() {
  // 1. Sincronizar prioritariamente desde Firebase Storage (REST y Cloud)
  try {
    const fb = await import('./services/firebase.js');
    if (fb && fb.fetchTimelineMedia) {
      const cloudMedia = await fb.fetchTimelineMedia();
      if (cloudMedia && Object.keys(cloudMedia).length > 0) {
        savedMediaMap = Object.assign({}, savedMediaMap, cloudMedia);
        refreshMediaElements();
      }
    }
  } catch (e) {
    console.warn("[sync Firebase error]:", e);
  }

  // 2. Servidor local si está disponible (en localhost)
  try {
    const res = await fetch('/api/hielo-media');
    if (res.ok) {
      const serverMedia = await res.json();
      if (serverMedia && Object.keys(serverMedia).length > 0) {
        savedMediaMap = Object.assign({}, serverMedia, savedMediaMap);
        refreshMediaElements();
      }
    }
  } catch (e) { }
}

function refreshMediaElements() {
  Object.entries(savedMediaMap).forEach(([id, media]) => {
    const wrap = document.getElementById(`media-wrap-${id}`);
    const uploadArea = document.getElementById(`upload-area-${id}`);
    if (wrap && media && media.url) {
      wrap.innerHTML = renderMediaElement(media);
      wrap.classList.remove('is-hidden');
      if (uploadArea) {
        uploadArea.style.display = 'none';
      }
    }
  });
}

async function startHielo() {
  initTimeline();
  setupScrollReveal();
  setupScrollProgressBar();
  setupBubuCompanion();
  await syncAllSavedMedia();
  initMiniMusicPlayer({ biome: 'hielo', title: 'Sector Hielo ♡' });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startHielo);
} else {
  startHielo();
}

function initTimeline() {
  const container = document.getElementById('timeline-track');
  if (!container) return;

  container.innerHTML = TIMELINE_EVENTS.map((event, idx) => {
    const isAccent = idx === 0 || idx === 5 || idx === 8 || idx === 14;
    const media = savedMediaMap[event.id];

    return `
      <article class="timeline-node" data-node-idx="${idx}">
        <div class="timeline-pin" title="${event.tag}">
          <span>${event.icon}</span>
        </div>
        <div class="timeline-card">
          <div class="timeline-card-header">
            <span class="timeline-date-tag ${isAccent ? 'timeline-tag-accent' : ''}">${event.date}</span>
            <span style="font-size: 0.76rem; font-weight: 800; color: var(--nb-brown-soft);">${event.tag}</span>
          </div>
          <h2 class="timeline-node-title">${event.title}</h2>
          <p class="timeline-node-desc">${event.desc}</p>
          ${event.quote ? `<div class="timeline-node-quote">${event.quote.replace(/\n/g, '<br/>')}</div>` : ''}

          <!-- Contenedor de Foto o Video subido -->
          <div class="timeline-media-container ${media ? '' : 'is-hidden'}" id="media-wrap-${event.id}">
            ${renderMediaElement(media)}
          </div>

          <!-- Botón de subida única (solo si es fecha clave y aún no tiene foto/video) -->
          ${event.isKeyDate && !media ? `
            <div class="timeline-upload-area" id="upload-area-${event.id}">
              <input type="file" id="file-${event.id}" accept="image/*,video/*" style="display: none;" />
              <button type="button" class="timeline-upload-btn" id="upload-btn-${event.id}">
                📷 Añadir Foto o Video aquí ♡
              </button>
              <span class="timeline-upload-progress is-hidden" id="prog-${event.id}">Subiendo... 0%</span>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');

  setupUploadListeners();
}

function renderMediaElement(media) {
  if (!media || !media.url) return '';
  if (media.type === 'video') {
    return `
      <video controls playsinline preload="metadata" style="width: 100%; max-height: 340px; border-radius: 8px; object-fit: cover; background: #000; display: block;">
        <source src="${media.url}" type="video/mp4">
        <source src="${media.url}">
        Tu navegador no soporta la reproducción de este video.
      </video>
    `;
  }
  return `<img src="${media.url}" alt="Recuerdo de amor" loading="lazy" style="width: 100%; max-height: 340px; border-radius: 8px; object-fit: cover; display: block;" />`;
}

function setupUploadListeners() {
  TIMELINE_EVENTS.filter(e => e.isKeyDate).forEach(event => {
    const fileInput = document.getElementById(`file-${event.id}`);
    const uploadBtn = document.getElementById(`upload-btn-${event.id}`);
    if (!fileInput || !uploadBtn) return;

    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const progEl = document.getElementById(`prog-${event.id}`);
      if (progEl) progEl.classList.remove('is-hidden');
      uploadBtn.style.display = 'none';

      try {
        const media = await saveMediaLocally(event.id, file, (pct) => {
          if (progEl) progEl.textContent = `Guardando recuerdo... ${pct}%`;
        });

        savedMediaMap[event.id] = media;

        // Ocultar área de subida definitivamente
        document.getElementById(`upload-area-${event.id}`)?.remove();

        // Mostrar multimedia en la tarjeta
        const wrap = document.getElementById(`media-wrap-${event.id}`);
        if (wrap) {
          wrap.innerHTML = renderMediaElement(media);
          wrap.classList.remove('is-hidden');
        }
      } catch (err) {
        alert("Hubo un detalle: " + err.message);
        uploadBtn.style.display = 'inline-flex';
        if (progEl) progEl.classList.add('is-hidden');
      }
    });
  });
}

// Observador IntersectionObserver para revelar elementos hacia abajo con scroll
function setupScrollReveal() {
  const nodes = document.querySelectorAll('.timeline-node');
  if (!nodes || nodes.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  });

  nodes.forEach(node => observer.observe(node));
}

// Barra de progreso horizontal según el scroll
function setupScrollProgressBar() {
  const bar = document.getElementById('timeline-progress-fill');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

function setupBubuCompanion() {
  const btn = document.getElementById('bubu-floating-btn');
  const speech = document.getElementById('bubu-speech');
  if (!btn || !speech) return;

  const phrases = [
    "¡Cada recuerdo contigo es mi tesoro! 🐻💖🐼",
    "¡Revivir nuestros pasos me enamora más! 🥰",
    "¡Eres lo más lindo de mi vida Raquelita! ✨",
    "¡Por miles de recuerdos más juntitos! 💍♡",
    "¡Misterio de hielo superado, mi amor! ❄️❄️"
  ];

  let phraseIdx = 0;
  btn.addEventListener('click', () => {
    phraseIdx = (phraseIdx + 1) % phrases.length;
    speech.textContent = phrases[phraseIdx];
    speech.classList.remove('is-hidden');
    setTimeout(() => {
      speech.classList.add('is-hidden');
    }, 3500);
  });
}
