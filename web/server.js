const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;
const UPLOADS_DIR = path.join(ROOT, 'assets', 'hielo_uploads');
const MANIFEST_FILE = path.join(UPLOADS_DIR, 'manifest.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(MANIFEST_FILE)) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify({}));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime'
};

const server = http.createServer((req, res) => {
  const cleanUrl = req.url.split('?')[0];

  // API: Obtener todos los recuerdos multimedia guardados
  if (req.method === 'GET' && cleanUrl === '/api/hielo-media') {
    fs.readFile(MANIFEST_FILE, 'utf8', (err, data) => {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(err ? '{}' : data || '{}');
    });
    return;
  }

  // API: Subir foto o video directamente al servidor y guardarlo en disco
  if (req.method === 'POST' && cleanUrl === '/api/upload-media') {
    const milestoneId = req.headers['x-milestone-id'] || 'unknown';
    const rawFileName = decodeURIComponent(req.headers['x-file-name'] || 'recuerdo.jpg');
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const isVideo = contentType.startsWith('video/');
    const ext = path.extname(rawFileName) || (isVideo ? '.mp4' : '.jpg');
    const safeName = `${milestoneId}_${Date.now()}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFile(targetPath, buffer, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
          return;
        }

        const mediaItem = {
          url: `/assets/hielo_uploads/${safeName}`,
          type: isVideo ? 'video' : 'image',
          fileName: rawFileName,
          uploadedAt: new Date().toISOString()
        };

        // Actualizar manifest.json
        try {
          const current = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8') || '{}');
          current[milestoneId] = mediaItem;
          fs.writeFileSync(MANIFEST_FILE, JSON.stringify(current, null, 2));
        } catch (e) {
          console.error('[Manifest Error]:', e);
        }

        console.log(`[Upload Éxito] Hito: ${milestoneId} -> ${safeName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, media: mediaItem }));
      });
    });
    return;
  }

  let filePath = path.join(ROOT, cleanUrl === '/' ? 'index.html' : cleanUrl);

  // Si piden /src o /src/, servir src/index.html o index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Archivo no encontrado: ' + cleanUrl);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✨ Servidor Lyoko Pastel activo en: http://localhost:${PORT}`);
});
