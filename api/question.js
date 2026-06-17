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
    const text = String(body.question || '').trim();
    if (!text) return res.status(400).json({ error: 'empty question' });
    if (text.length > 800) return res.status(400).json({ error: 'too long' });

    const current = await githubRequest('GET', PATH);
    if (!current.body || !current.body.sha) {
      return res.status(500).json({ error: 'could not read data file' });
    }
    const sha = current.body.sha;
    const raw = JSON.parse(Buffer.from(current.body.content, 'base64').toString());

    if (!Array.isArray(raw.questions)) raw.questions = [];
    raw.questions.push({
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      text: text,
      answer: '',
      published: false,
      createdAt: new Date().toISOString()
    });

    const content = Buffer.from(JSON.stringify(raw, null, 2)).toString('base64');
    const result = await githubRequest('PUT', PATH, {
      message: 'community: new question',
      content, sha
    });

    if (result.status !== 200 && result.status !== 201) {
      return res.status(500).json({ error: 'github write failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('POST /api/question error:', e.message || e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
};
