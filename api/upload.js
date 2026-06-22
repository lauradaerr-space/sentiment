const https = require('https');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;

function githubRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${path}`,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'sentiment-app',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  try {
    const body = req.body || {};
    let filename = String(body.filename || '').trim();
    const base64 = String(body.contentBase64 || '');

    if (!filename || !base64) {
      return res.status(400).json({ error: 'missing filename or content' });
    }

    // Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);

    // Extension check
    const m = filename.match(/\.([^.]+)$/);
    const ext = m ? m[1].toLowerCase() : '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].indexOf(ext) === -1) {
      return res.status(400).json({ error: 'invalid file type (jpg, png, webp, gif, svg)' });
    }

    // Size check (base64 ≈ 4/3 of actual; 5.5MB base64 ≈ 4MB file)
    if (base64.length > 5.5 * 1024 * 1024) {
      return res.status(413).json({ error: 'file too large (max ~4MB)' });
    }

    const timestamp = Date.now();
    const path = `public/img/uploads/${timestamp}-${filename}`;

    const result = await githubRequest('PUT', path, {
      message: 'upload: ' + filename,
      content: base64
    });

    if (result.status !== 200 && result.status !== 201) {
      const detail = (result.body && (result.body.message || JSON.stringify(result.body))) || '';
      return res.status(500).json({ error: 'upload failed', detail: String(detail).substring(0, 200) });
    }

    return res.status(200).json({ ok: true, path: path });
  } catch (e) {
    console.error('POST /api/upload error:', e.message || e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
};
