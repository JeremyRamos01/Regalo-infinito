import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getStorage, ref, listAll, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBtSJzE9J-0-lcOC5vVC5JsWsfMyxkW7fE",
  authDomain: "raquel-5f8dc.firebaseapp.com",
  projectId: "raquel-5f8dc",
  storageBucket: "raquel-5f8dc.firebasestorage.app",
  messagingSenderId: "991732171393",
  appId: "1:991732171393:web:164bce47129ab4fae9c380",
  measurementId: "G-K28RPDWB0"
};

let app = null;
let storage = null;
let db = null;

export function getFirebaseApp() {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      storage = getStorage(app);
      db = getFirestore(app);
    } catch (e) {
      console.warn("Firebase ya inicializado o modo fallback:", e);
    }
  }
  return { app, storage, db };
}

/**
 * Sube foto o video para un hito de la línea temporal (Sector Hielo)
 * @param {string} milestoneId - Identificador del hito (ej: "7-enero")
 * @param {File} file - Archivo seleccionado
 * @param {Function} onProgress - Callback con porcentaje (0-100)
 */
export async function uploadTimelineMedia(milestoneId, file, onProgress = () => {}) {
  const { storage, db } = getFirebaseApp();
  const isVideo = file.type.startsWith('video/');
  const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const safeFileName = `${milestoneId}_${Date.now()}.${ext}`;
  const storagePath = `hielo_timeline/${safeFileName}`;

  let downloadUrl = '';

  // 1. Intentar subir a Firebase Storage
  if (storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(pct);
          },
          (error) => reject(error),
          async () => {
            downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });
    } catch (err) {
      console.warn("[Upload Storage]:", err.message);
    }
  }

  // 2. Si no hay storage o falló, usar Data URL local de respaldo
  if (!downloadUrl) {
    downloadUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  const mediaData = {
    url: downloadUrl,
    type: isVideo ? 'video' : 'image',
    fileName: file.name,
    uploadedAt: new Date().toISOString()
  };

  // Guardar en Firestore para que sea visible desde cualquier dispositivo
  if (db) {
    try {
      await setDoc(doc(db, "hielo_hitos", milestoneId), mediaData, { merge: true });
    } catch (e) {
      console.warn("[Firestore Hielo]:", e.message);
    }
  }

  // Respaldo inmediato en localStorage
  try {
    const localStore = JSON.parse(localStorage.getItem('hielo_timeline_media') || '{}');
    localStore[milestoneId] = mediaData;
    localStorage.setItem('hielo_timeline_media', JSON.stringify(localStore));
  } catch (e) {}

  return mediaData;
}

/**
 * Obtiene los archivos multimedia subidos de todos los hitos del Sector Hielo
 */
export async function fetchTimelineMedia() {
  const { db } = getFirebaseApp();
  const results = {};

  // Primero recuperar lo local
  try {
    const local = JSON.parse(localStorage.getItem('hielo_timeline_media') || '{}');
    Object.assign(results, local);
  } catch (e) {}

  // Luego sincronizar con Firestore
  if (db) {
    try {
      const snap = await getDocs(collection(db, "hielo_hitos"));
      snap.forEach(docSnap => {
        results[docSnap.id] = docSnap.data();
      });
    } catch (e) {
      console.warn("[Fetch Hielo Hitos]:", e.message);
    }
  }

  return results;
}

export function logLyokoAccess(codeUsed) {
  const history = JSON.parse(localStorage.getItem('lyoko_access_logs') || '[]');
  history.push({ codeUsed, timestamp: new Date().toISOString() });
  localStorage.setItem('lyoko_access_logs', JSON.stringify(history));
}

/**
 * Lee fotos directamente de Firebase Storage (Opción B: sin tocar Firestore)
 * Revisa carpetas comunes que puedas crear en Storage:
 * - "fotos rompecabezas"
 * - "fotos_rompecabezas"
 * - "rompecabezas"
 * - "fotos"
 * - o la raíz del Storage
 */
export async function fetchPuzzlePhotosFromStorage() {
  const { storage } = getFirebaseApp();
  if (!storage) {
    console.warn("[Storage] No se pudo inicializar Firebase Storage.");
    return [];
  }

  const photos = [];
  const seenUrls = new Set();

  async function exploreFolder(folderPath) {
    try {
      const folderRef = ref(storage, folderPath);
      const res = await listAll(folderRef);

      // Si tiene subcarpetas dentro, explorarlas también
      for (const prefix of res.prefixes) {
        await exploreFolder(prefix.fullPath);
      }

      // Archivos en esta carpeta
      for (const itemRef of res.items) {
        try {
          const url = await getDownloadURL(itemRef);
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            photos.push({
              id: itemRef.name,
              url: url,
              name: itemRef.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              date: ''
            });
          }
        } catch (itemErr) {
          console.warn(`[Storage] Error al obtener URL de ${itemRef.fullPath}:`, itemErr.code || itemErr.message);
        }
      }
    } catch (err) {
      if (err.code === 'storage/unauthorized') {
        console.warn(`[Storage] Error 403 No Autorizado en "${folderPath}". Revisa las reglas de Storage (allow read: if true;).`);
      } else {
        console.log(`[Storage] Info carpeta "${folderPath}":`, err.code || err.message);
      }
    }
  }

  // 1. Explorar desde la raíz del Storage (encuentra todas las carpetas automáticamente)
  await exploreFolder("");

  // 2. Si por reglas no permite listar raíz, intentar nombres comunes directos
  if (photos.length === 0) {
    const knownNames = ["fotos rompecabezas", "fotos_rompecabezas", "rompecabezas", "fotos", "puzzle"];
    for (const name of knownNames) {
      await exploreFolder(name);
      if (photos.length > 0) break;
    }
  }

  console.log(`[Storage] Total fotos encontradas en Firebase Storage: ${photos.length}`);
  return photos;
}

export async function fetchAllPuzzlePhotos() {
  const photos = [];
  const seenUrls = new Set();

  // 1. Fotos personalizadas exclusivas del rompecabezas (guardadas localmente)
  try {
    const customPuzzlePhotos = JSON.parse(localStorage.getItem('lyoko_puzzle_custom_photos') || '[]');
    customPuzzlePhotos.forEach(p => {
      if (p && p.url && !seenUrls.has(p.url)) {
        seenUrls.add(p.url);
        photos.push(p);
      }
    });
  } catch (e) {
    console.warn("[Custom Puzzle Photos]:", e.message);
  }

  // 2. Fotos en Firebase Storage (carpeta fotos_rompecabezas)
  const knownStorageFiles = [
    "WhatsApp Image 2026-10-21 at 16.20.07.jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08 (1).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08 (2).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08 (3).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.08.jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (1).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (2).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (3).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09 (4).jpeg",
    "WhatsApp Image 2026-10-21 at 16.20.09.jpeg"
  ];

  knownStorageFiles.forEach((filename, idx) => {
    const fbUrl = `https://firebasestorage.googleapis.com/v0/b/raquel-5f8dc.firebasestorage.app/o/fotos_rompecabezas%2F${encodeURIComponent(filename)}?alt=media`;
    if (!seenUrls.has(fbUrl)) {
      seenUrls.add(fbUrl);
      photos.push({
        id: `storage-file-${idx}`,
        url: fbUrl,
        name: `Recuerdo Rompecabezas #${idx + 1}`,
        date: ''
      });
    }
  });

  // 3. Intento dinámico en Storage
  try {
    const storagePhotos = await fetchPuzzlePhotosFromStorage();
    if (storagePhotos && storagePhotos.length > 0) {
      storagePhotos.forEach(p => {
        if (!seenUrls.has(p.url)) {
          seenUrls.add(p.url);
          photos.push(p);
        }
      });
    }
  } catch (err) {
    console.warn("Intento Storage dinámico:", err);
  }

  // 4. Intento dinámico en Firestore
  try {
    const firestorePhotos = await fetchPuzzlePhotosFromFirestore();
    if (firestorePhotos && firestorePhotos.length > 0) {
      firestorePhotos.forEach(p => {
        if (!seenUrls.has(p.url)) {
          seenUrls.add(p.url);
          photos.push(p);
        }
      });
    }
  } catch (err) {
    console.warn("Intento Firestore:", err);
  }

  return photos;
}

/**
 * Obtiene las fotos de la colección "fotos rompecabezas" en Cloud Firestore
 * Busca campos: url, foto, imagen, titulo, nombre, fecha
 */
export async function fetchPuzzlePhotosFromFirestore() {
  const { db } = getFirebaseApp();
  if (!db) return [];

  const photos = [];
  const seenUrls = new Set();
  const collectionNames = ["fotos rompecabezas", "fotos_rompecabezas", "fotos-rompecabezas"];

  for (const colName of collectionNames) {
    try {
      const snap = await getDocs(collection(db, colName));
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const url = data.url || data.foto || data.imagen || data.image || data.link || data.src;
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          photos.push({
            id: docSnap.id,
            url: url,
            name: data.titulo || data.nombre || data.title || data.name || data.descripcion || 'Recuerdo Nuestro ♡',
            date: data.fecha || data.date || ''
          });
        }
      });
      if (photos.length > 0) break;
    } catch (err) {
      console.warn(`Consulta en colección "${colName}":`, err.message);
    }
  }

  return photos;
}

/**
 * Escucha en tiempo real la colección "fotos rompecabezas"
 * Cada vez que Jeremy añada una foto en Firebase Console, la web se actualiza sola!
 */
export function subscribeToPuzzlePhotos(callback) {
  const { db } = getFirebaseApp();
  if (!db) return () => {};

  try {
    const colRef = collection(db, "fotos rompecabezas");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      const photos = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const url = data.url || data.foto || data.imagen || data.image || data.link || data.src;
        if (url) {
          photos.push({
            id: docSnap.id,
            url: url,
            name: data.titulo || data.nombre || data.title || data.name || data.descripcion || 'Recuerdo Nuestro ♡',
            date: data.fecha || data.date || ''
          });
        }
      });
      if (photos.length > 0) {
        callback(photos);
      }
    }, (err) => {
      console.warn("Snapshot en 'fotos rompecabezas':", err.message);
    });

    return unsubscribe;
  } catch (e) {
    console.warn("Error suscribiendo a Firestore:", e);
    return () => {};
  }
}

/**
 * Busca la canción del bioma en Firebase Storage (bosque.mp3, desierto.mp3, hielo.mp3, carta.mp3)
 * @param {string} biomeKey - Identificador del bioma ('bosque', 'hielo', 'desierto', 'roca', 'carta')
 * @returns {Promise<{url: string, name: string}|null>}
 */
export async function fetchBiomeMusicUrl(biomeKey) {
  const { storage } = getFirebaseApp();
  if (!storage) return null;

  const targetBiome = (biomeKey || '').toLowerCase();

  // Nombres exactos de las canciones subidas por Jeremy a Firebase
  const EXACT_FILES = {
    bosque: 'bosque.mp3',
    desierto: 'desierto.mp3',
    hielo: 'hielo.mp3',
    carta: 'carta.mp3',
    roca: 'roca.mp3'
  };

  const fileName = EXACT_FILES[targetBiome] || `${targetBiome}.mp3`;

  // 1. Búsqueda directa por getDownloadURL (en raíz y en carpetas canciiones / canciones)
  const candidatePaths = [
    fileName,
    `canciiones/${fileName}`,
    `canciones/${fileName}`,
    `Canciiones/${fileName}`,
    `Canciones/${fileName}`
  ];

  for (const path of candidatePaths) {
    try {
      const fileRef = ref(storage, path);
      const url = await getDownloadURL(fileRef);
      if (url) {
        console.log(`[Firebase Music] ¡Éxito! Canción para ${targetBiome}: ${path}`);
        return { url, name: fileName };
      }
    } catch (e) {
      // Probar siguiente ruta
    }
  }

  // 2. Si no la encuentra por nombre directo, buscar en listAll EXCLUSIVAMENTE archivos que contengan el nombre del bioma
  const foldersToScan = ['', 'canciiones', 'canciones', 'Canciiones', 'Canciones'];
  for (const f of foldersToScan) {
    try {
      const folderRef = ref(storage, f);
      const res = await listAll(folderRef);
      for (const item of res.items) {
        const itemLower = item.name.toLowerCase();
        // Solo aceptar si coincide estrictamente con este bioma
        if (itemLower.includes(targetBiome)) {
          const url = await getDownloadURL(item);
          console.log(`[Firebase Music] Encontrada en ${f || 'raíz'}: ${item.name}`);
          return { url, name: item.name };
        }
      }
    } catch (e) {}
  }

  return null;
}
