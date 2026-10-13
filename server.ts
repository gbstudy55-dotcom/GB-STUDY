import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPSTREAM_BASE = 'https://nt.studybeepro.site';
const OLD_UPSTREAM_BASE = 'https://old-nt.studybeepro.site';

// In-memory cache for fast repeated folder navigation
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCached(key: string): unknown | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: unknown): void {
  if (apiCache.size > 800) {
    const firstKey = apiCache.keys().next().value;
    if (firstKey) apiCache.delete(firstKey);
  }
  apiCache.set(key, { timestamp: Date.now(), data });
}

async function fetchUpstreamJson(urls: string[], timeoutMs = 12000): Promise<unknown> {
  let lastError: Error | null = null;
  for (const url of urls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          Referer: `${UPSTREAM_BASE}/`,
        },
      });
      clearTimeout(timer);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || contentType.includes('text/html')) {
        throw new Error(`Upstream HTTP ${response.status} from ${url}`);
      }
      const data = await response.json();
      if (data && typeof data === 'object' && (data as { success?: boolean }).success !== false) {
        return data;
      }
      // If it returned { success: false }, try next endpoint
      lastError = new Error((data as { message?: string })?.message || 'Upstream returned failure');
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError || new Error('All upstream endpoints failed');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Batches endpoint: merges new 2026-27 and old 2025-26 batches
  app.get('/api/batches', async (_req, res) => {
    const cacheKey = 'batches_combined';
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const [newRes, oldRes] = await Promise.allSettled([
        fetchUpstreamJson([`${UPSTREAM_BASE}/batches.json`], 8000),
        fetchUpstreamJson([`${OLD_UPSTREAM_BASE}/batches.json`], 8000),
      ]);

      const newList =
        newRes.status === 'fulfilled' &&
        newRes.value &&
        typeof newRes.value === 'object' &&
        'new' in newRes.value &&
        Array.isArray((newRes.value as { new: unknown[] }).new)
          ? (newRes.value as { new: unknown[] }).new
          : [];

      const oldList =
        oldRes.status === 'fulfilled' &&
        oldRes.value &&
        typeof oldRes.value === 'object' &&
        'new' in oldRes.value &&
        Array.isArray((oldRes.value as { new: unknown[] }).new)
          ? (oldRes.value as { new: unknown[] }).new
          : [];

      const payload = { success: true, new: newList, old: oldList };
      if (newList.length > 0 || oldList.length > 0) {
        setCached(cacheKey, payload);
      }
      res.json(payload);
    } catch (error) {
      res.status(502).json({
        success: false,
        message: 'Using built-in batch catalog fallback',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // 2. Course overview & folder contents proxy (/api/nig & /api/prince)
  const handleContentProxy = async (req: express.Request, res: express.Response) => {
    const urlObj = new URL(req.originalUrl, `http://localhost:${PORT}`);
    const cleanParams = new URLSearchParams(urlObj.searchParams);
    cleanParams.delete('_t');
    const queryStr = cleanParams.toString();
    const cacheKey = `content:${queryStr}`;

    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const upstreamQuery = urlObj.search || '';
    try {
      const data = await fetchUpstreamJson([
        `${UPSTREAM_BASE}/api/nig${upstreamQuery}`,
        `${UPSTREAM_BASE}/api/prince${upstreamQuery}`,
        `${OLD_UPSTREAM_BASE}/api/nig${upstreamQuery}`,
        `${OLD_UPSTREAM_BASE}/api/prince${upstreamQuery}`,
      ]);
      setCached(cacheKey, data);
      res.json(data);
    } catch (error) {
      res.status(502).json({
        success: false,
        message: 'Failed to fetch course content from upstream',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  app.get('/api/nig', handleContentProxy);
  app.get('/api/prince', handleContentProxy);

  // 3. Media stream & live classes resolver (/api/god & /api/play)
  const handleMediaProxy = async (req: express.Request, res: express.Response) => {
    const urlObj = new URL(req.originalUrl, `http://localhost:${PORT}`);
    const cleanParams = new URLSearchParams(urlObj.searchParams);
    cleanParams.delete('_t');
    const queryStr = cleanParams.toString();
    const cacheKey = `media:${queryStr}`;

    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const upstreamQuery = urlObj.search || '';
    const isClassesAction = urlObj.searchParams.get('action') === 'classes';

    const candidateUrls = isClassesAction
      ? [
          `${UPSTREAM_BASE}/api/play${upstreamQuery}`,
          `${UPSTREAM_BASE}/api/god${upstreamQuery}`,
          `${OLD_UPSTREAM_BASE}/api/play${upstreamQuery}`,
        ]
      : [
          `${UPSTREAM_BASE}/api/god${upstreamQuery}`,
          `${UPSTREAM_BASE}/api/play${upstreamQuery}`,
          `${OLD_UPSTREAM_BASE}/api/god${upstreamQuery}`,
          `${OLD_UPSTREAM_BASE}/api/play${upstreamQuery}`,
        ];

    try {
      const data = await fetchUpstreamJson(candidateUrls);
      setCached(cacheKey, data);
      res.json(data);
    } catch (error) {
      res.status(502).json({
        success: false,
        message: 'Failed to resolve media stream from upstream',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  app.get('/api/god', handleMediaProxy);
  app.get('/api/play', handleMediaProxy);

  // 4. Guaranteed PDF stream proxy to bypass any iframe X-Frame-Options or CORS issues
  app.get('/api/pdf-stream', async (req, res) => {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      res.status(400).send('Missing url parameter');
      return;
    }

    try {
      const response = await fetch(rawUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Referer: `${UPSTREAM_BASE}/`,
        },
      });

      if (!response.ok) {
        res.status(response.status).send('Unable to load PDF from source');
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const cl = response.headers.get('content-length');
      if (cl) {
        res.setHeader('Content-Length', cl);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      res.status(500).send('Error streaming PDF');
    }
  });

  // Vite middleware for dev / static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GB STUDY Web Portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
