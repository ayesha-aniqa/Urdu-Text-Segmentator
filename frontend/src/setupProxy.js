// setupProxy.js
// CRA automatically loads this file — no config needed.
// 1. Proxies /api/segment and /api/health to FastAPI backend (localhost:8000)
// 2. Provides a local /api/fetch-url endpoint that fetches external URLs
//    server-side, completely bypassing browser CORS restrictions.

const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');

/**
 * Fetch a URL with redirect support (up to 5 hops).
 * Uses only built-in Node.js modules.
 */
function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));

    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5,ur;q=0.3',
      },
    }, (response) => {
      // Follow redirects (301, 302, 307, 308)
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        let redirectUrl = response.headers.location;
        // Handle relative redirects
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        return resolve(fetchUrl(redirectUrl, redirectCount + 1));
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      response.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Request timed out after 20 seconds'));
    });
  });
}

module.exports = function (app) {
  // ── Proxy ML backend requests to FastAPI (localhost:8000) ──
  app.use(
    '/api/segment',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
  app.use(
    '/api/health',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );

  // ── Local URL-fetch proxy (existing handler) ──
  app.get('/api/fetch-url', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }

    // Basic validation
    if (!/^https?:\/\/.+/i.test(targetUrl)) {
      return res.status(400).json({ error: 'Invalid URL — must start with http:// or https://' });
    }

    console.log(`[Proxy] Fetching: ${targetUrl}`);

    try {
      const html = await fetchUrl(targetUrl);
      console.log(`[Proxy] ✅ Success — ${html.length} chars`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      console.error(`[Proxy] ❌ Error:`, err.message);
      res.status(502).json({ error: err.message });
    }
  });
};
