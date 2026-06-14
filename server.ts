import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large JSON payloads for offline base64 image data-URLs in activities
  app.use(express.json({ limit: '100mb' }));

  // API Route - Generates and downloads the single-file compiled HTML
  app.all('/api/download-single-html', async (req, res) => {
    try {
      const { students, activities } = req.body || {};
      const distIndex = path.join(process.cwd(), 'dist', 'index.html');

      // Check if pre-built file exists
      if (!fs.existsSync(distIndex)) {
        console.log('dist/index.html not found. Building on-demand...');
        await new Promise<void>((resolve, reject) => {
          exec('npx vite build', (err, stdout, stderr) => {
            if (err) {
              console.error('On-demand vite build failed:', stderr || err.message);
              reject(err);
            } else {
              console.log('On-demand build compiled successfully!');
              resolve();
            }
          });
        });
      }

      // Read compiled single-file index.html
      let html = fs.readFileSync(distIndex, 'utf8');

      // Inject data payload if provided
      if (students || activities) {
        const escapedStudentsJSON = students ? JSON.stringify(students).replace(new RegExp('</' + 'script>', 'g'), '<\\/script>') : '[]';
        const escapedActivitiesJSON = activities ? JSON.stringify(activities).replace(new RegExp('</' + 'script>', 'g'), '<\\/script>') : '[]';
        const downloadId = String(Date.now());

        const closeScriptTag = String.fromCharCode(60, 47, 115, 99, 114, 105, 112, 116, 62);

        const payloadScript = `
<!-- AUTOMATIC DATA INJECTION IN SINGLE-FILE DEPLOYMENT -->
<script id="offline-data-payload">
  window.OFFLINE_STUDENTS = ${escapedStudentsJSON};
  window.OFFLINE_ACTIVITIES = ${escapedActivitiesJSON};
  window.OFFLINE_DOWNLOAD_ID = "${downloadId}";
  console.log('Datos offline embebidos listos para cargar en la carpeta didáctica.');
` + closeScriptTag + `\n`;

        // Inject script inside <head> securely at the very beginning of the head using split-literal to avoid JS inlining
        const headTagName = ['<', 'head', '>'].join('');
        const headOpenIndex = html.indexOf(headTagName);
        if (headOpenIndex !== -1) {
          html = html.substring(0, headOpenIndex + headTagName.length) + '\n' + payloadScript + html.substring(headOpenIndex + headTagName.length);
        } else {
          html = payloadScript + html;
        }
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="carpeta_didactica.html"');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(html);
    } catch (err: any) {
      console.error('Error in single-file HTML generation route:', err);
      res.status(500).send(`Error al empaquetar el sitio: ${err.message}`);
    }
  });

  // Vite development middleware vs Static Production server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
