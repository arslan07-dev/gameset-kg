import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Search Engine SEO files (sitemap.xml & robots.txt fallback routes)
app.get('/robots.txt', (_req: Request, res: Response) => {
  const robotsPath = isProd
    ? path.resolve(__dirname, 'dist', 'robots.txt')
    : path.resolve(__dirname, 'public', 'robots.txt');
  res.type('text/plain').sendFile(robotsPath);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const sitemapPath = isProd
    ? path.resolve(__dirname, 'dist', 'sitemap.xml')
    : path.resolve(__dirname, 'public', 'sitemap.xml');
  res.type('application/xml').sendFile(sitemapPath);
});

// -------------------------------------------------------------
// Vite Dev Server / Static Production Server Mounting
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`GAMESET KG Full-Stack Server running on port ${PORT} (isProd: ${isProd})`);
  });
}

// Only launch standalone Express HTTP listener when running standalone (Cloud Run / Docker / dev server)
// In Netlify Functions / AWS Lambda, the serverless handler manages request execution
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export { app };
