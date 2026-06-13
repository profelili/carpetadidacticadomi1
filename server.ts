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
  app.post('/api/download-single-html', async (req, res) => {
    try {
      const { students, activities } = req.body;
      const distIndex = path.join(process.cwd(), 'dist', 'index.html');

      // Always trigger a build on-demand to guarantee that any visual edits, code changes, or static asset modifications are compiled into the exported file
      console.log('Launching on-demand compilation to ensure the single HTML file has the latest visual changes...');
      await new Promise<void>((resolve, reject) => {
        exec('npx vite build', (err, stdout, stderr) => {
          if (err) {
            console.error('On-demand vite build failed:', stderr || err.message);
            // If development build fails but we have an old build as a fallback, we can use it, otherwise reject
            if (fs.existsSync(distIndex)) {
              console.warn('Vite build failed, falling back to existing dist file');
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log('On-demand build compiled successfully!');
            resolve();
          }
        });
      });

      // Read compiled single-file index.html
      let html = fs.readFileSync(distIndex, 'utf8');

      // Inject data payload if provided
      if (students || activities) {
        const escapedStudentsJSON = students ? JSON.stringify(students).replace(/<\/script>/g, '<\\/script>') : '[]';
        const escapedActivitiesJSON = activities ? JSON.stringify(activities).replace(/<\/script>/g, '<\\/script>') : '[]';
        const downloadId = String(Date.now());

        const payloadScript = `
<!-- AUTOMATIC DATA INJECTION IN SINGLE-FILE DEPLOYMENT -->
<script id="offline-data-payload">
  window.OFFLINE_STUDENTS = ${escapedStudentsJSON};
  window.OFFLINE_ACTIVITIES = ${escapedActivitiesJSON};
  window.OFFLINE_DOWNLOAD_ID = "${downloadId}";
  console.log('Datos offline embebidos listos para cargar en la carpeta didáctica.');
</script>
`;
        // Inject script inside <head> to run before page load
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${payloadScript}\n</head>`);
        } else {
          html = html.replace('<body>', `<body>\n${payloadScript}`);
        }
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="carpeta_didactica.html"');
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
