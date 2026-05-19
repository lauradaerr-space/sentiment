// CPDP panel Q&A — GitHub-backed storage.
// Reuses the existing GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN env vars
// already configured for api/events.js. Commits use [skip ci] so Vercel
// does not redeploy on every question.

const https = require('https');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const FILE  = 'data/cpdp-questions.json';
const MAX_RETRIES = 4;

function githubRequest(method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${FILE}`,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'sentiment-cpdp',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: { raw } }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function readState() {
  const r = await githubRequest('GET');
  if (r.status === 404) return { sha: null, questions: [] };
  if (r.status !== 200) throw new Error('GitHub GET failed: ' + r.status);
  const decoded = Buffer.from(r.body.content, 'base64').toString();
  let parsed = [];
  try { parsed = JSON.parse(decoded); } catch (_) { parsed = []; }
  return { sha: r.body.sha, questions: Array.isArray(parsed) ? parsed : [] };
}

async function writeState(questions, sha, action) {
  const content = Buffer.from(JSON.stringify(questions, null, 2)).toString('base64');
  const payload = {
    message: `[skip ci] cpdp: ${action}`,
    content
  };
  if (sha) payload.sha = sha;
  return githubRequest('PUT', payload);
}

function sanitize(text, max) {
  return String(text == null ? '' : text).slice(0, max).trim();
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!OWNER || !REPO || !TOKEN) {
    return res.status(500).json({ error: 'GitHub env vars not configured' });
  }

  try {
    if (req.method === 'GET') {
      const { questions } = await readState();
      return res.status(200).json({ questions });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const text = sanitize(body.text, 500);
      const name = sanitize(body.name, 60);
      if (!text) return res.status(400).json({ error: 'Empty question' });

      const newQ = { id: makeId(), text, name, timestamp: Date.now() };

      for (let i = 0; i < MAX_RETRIES; i++) {
        const { sha, questions } = await readState();
        const next = questions.concat([newQ]);
        const r = await writeState(next, sha, `add ${newQ.id}`);
        if (r.status === 200 || r.status === 201) {
          return res.status(200).json({ ok: true, question: newQ });
        }
        if (r.status === 409 || r.status === 422) {
          // SHA mismatch — somebody else wrote in between, retry
          await new Promise(ok => setTimeout(ok, 150 * (i + 1)));
          continue;
        }
        throw new Error('GitHub PUT failed: ' + r.status + ' ' + JSON.stringify(r.body).slice(0, 200));
      }
      return res.status(503).json({ error: 'Could not persist after retries' });
    }

    if (req.method === 'DELETE') {
      const id = (req.query && req.query.id)
        || (req.body && req.body.id)
        || (req.url && new URL(req.url, 'http://x').searchParams.get('id'));
      if (!id) return res.status(400).json({ error: 'Missing id' });

      for (let i = 0; i < MAX_RETRIES; i++) {
        const { sha, questions } = await readState();
        const next = questions.filter(q => q.id !== id);
        if (next.length === questions.length) {
          return res.status(200).json({ ok: true, note: 'already absent' });
        }
        const r = await writeState(next, sha, `remove ${id}`);
        if (r.status === 200 || r.status === 201) {
          return res.status(200).json({ ok: true });
        }
        if (r.status === 409 || r.status === 422) {
          await new Promise(ok => setTimeout(ok, 150 * (i + 1)));
          continue;
        }
        throw new Error('GitHub PUT failed: ' + r.status);
      }
      return res.status(503).json({ error: 'Could not persist after retries' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[cpdp-questions]', e.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};
