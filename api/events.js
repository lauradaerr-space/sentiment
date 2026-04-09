const https = require('https');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const PATH  = 'data/events.json';

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
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — alle Events lesen
  if (req.method === 'GET') {
    const r = await githubRequest('GET', PATH);
    const events = JSON.parse(Buffer.from(r.body.content, 'base64').toString());
    return res.status(200).json(events);
  }

  // POST — Events speichern
  if (req.method === 'POST') {
    const { events } = req.body;

    // aktuelle SHA holen
    const current = await githubRequest('GET', PATH);
    const sha = current.body.sha;

    const content = Buffer.from(JSON.stringify(events, null, 2)).toString('base64');
    await githubRequest('PUT', PATH, {
      message: 'update: events via admin',
      content,
      sha
    });

    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};