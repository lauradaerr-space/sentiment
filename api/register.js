const https = require('https');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const PATH  = 'data/registrations.json';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — admin only
  if (req.method === 'GET') {
    if (req.headers['x-admin-token'] !== 'sentiment2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const r = await githubRequest('GET', PATH);
      const registrations = JSON.parse(Buffer.from(r.body.content, 'base64').toString());
      return res.status(200).json(registrations);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load registrations' });
    }
  }

  // POST — public registration
  if (req.method === 'POST') {
    const { vorname, nachname, email, event, bereich, nachricht, _gotcha } = req.body || {};

    // honeypot check
    if (_gotcha) return res.status(200).json({ ok: true });

    // validate required fields
    if (!vorname || !nachname || !email || !event || !bereich) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // load current registrations
      const current = await githubRequest('GET', PATH);
      const sha = current.body.sha;
      const registrations = JSON.parse(Buffer.from(current.body.content, 'base64').toString());

      // add new registration
      registrations.push({
        id: 'reg-' + Date.now(),
        vorname,
        nachname,
        email,
        event,
        bereich,
        nachricht: nachricht || '',
        timestamp: new Date().toISOString()
      });

      // save back
      const content = Buffer.from(JSON.stringify(registrations, null, 2)).toString('base64');
      await githubRequest('PUT', PATH, {
        message: 'registration: ' + vorname + ' ' + nachname,
        content,
        sha
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save registration' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
