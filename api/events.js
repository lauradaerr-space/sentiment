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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — read events + tasks
  if (req.method === 'GET') {
    try {
      const r = await githubRequest('GET', PATH);
      const raw = JSON.parse(Buffer.from(r.body.content, 'base64').toString());
      // Support both old format (plain array) and new format ({events, tasks})
      if (Array.isArray(raw)) {
        return res.status(200).json({ events: raw, tasks: [], seeded: false });
      }
      return res.status(200).json({
        events: raw.events || [],
        tasks: raw.tasks || [],
        seeded: raw.seeded || false
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load data' });
    }
  }

  // POST — save events + tasks
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      console.log('POST /api/events — body keys:', Object.keys(body));

      // Accept both { events: {events,tasks} } (legacy) and { events, tasks } (new)
      let events, tasks;
      if (body.events && Array.isArray(body.events.events)) {
        events = body.events.events;
        tasks = body.events.tasks || [];
      } else {
        events = body.events || [];
        tasks = body.tasks || [];
      }

      console.log('Saving events:', events.length, 'tasks:', tasks.length);

      const current = await githubRequest('GET', PATH);
      if (!current.body || !current.body.sha) {
        throw new Error('Could not get SHA: ' + JSON.stringify(current.body).substring(0, 200));
      }
      const sha = current.body.sha;

      const seeded = body.seeded || false;
      const payload = { events: events, tasks: tasks, seeded: seeded };
      const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
      const result = await githubRequest('PUT', PATH, {
        message: 'update: admin save ' + new Date().toISOString(),
        content,
        sha
      });

      console.log('GitHub PUT status:', result.status);
      if (result.status !== 200 && result.status !== 201) {
        throw new Error('GitHub PUT failed: ' + JSON.stringify(result.body).substring(0, 200));
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST /api/events error:', e.message || e);
      return res.status(500).json({ ok: false, error: e.message || String(e) });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
