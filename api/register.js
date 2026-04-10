const https = require('https');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const PATH  = 'data/registrations.json';
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@project-sentiment.org';

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

function sendConfirmationEmail(to, vorname, eventName, personen) {
  if (!RESEND_KEY) return Promise.resolve();

  const html = `
    <div style="font-family:'Space Grotesk',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#ede8df;background:#0a0a08;border-radius:16px;">
      <div style="font-size:14px;font-weight:700;letter-spacing:.05em;margin-bottom:24px;color:#ede8df;">SENTIMENT</div>
      <p style="font-size:15px;line-height:1.7;color:#ede8df;margin:0 0 16px;">
        Hallo ${vorname},
      </p>
      <p style="font-size:15px;line-height:1.7;color:rgba(237,232,223,0.7);margin:0 0 16px;">
        vielen Dank f&uuml;r deine Anmeldung! Wir best&auml;tigen hiermit deine Registrierung:
      </p>
      <div style="padding:16px;border:1px solid rgba(255,255,255,0.09);border-radius:10px;background:rgba(255,255,255,0.04);margin:0 0 20px;">
        <p style="margin:0 0 6px;font-size:13px;color:rgba(237,232,223,0.5);text-transform:uppercase;letter-spacing:.12em;font-size:9px;">Veranstaltung</p>
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#ede8df;">${eventName}</p>
        <p style="margin:0;font-size:13px;color:rgba(237,232,223,0.5);text-transform:uppercase;letter-spacing:.12em;font-size:9px;">Personen</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#ede8df;">${personen}</p>
      </div>
      <p style="font-size:15px;line-height:1.7;color:rgba(237,232,223,0.7);margin:0 0 16px;">
        Wir freuen uns auf dich!
      </p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.09);margin:24px 0 16px;">
      <p style="font-size:10px;color:rgba(237,232,223,0.35);letter-spacing:.06em;line-height:1.7;margin:0;">
        SENTIMENT &mdash; Creating Safe &amp; Supportive Spaces for Intimate Communication<br>
        KunstWerk e.V. &middot; Deutz-M&uuml;lheimer Str. 115 &middot; 51063 K&ouml;ln<br>
        <a href="https://sentiment-exhibition.vercel.app" style="color:rgba(237,232,223,0.35);">sentiment-exhibition.vercel.app</a>
      </p>
    </div>
  `;

  const payload = JSON.stringify({
    from: FROM_EMAIL,
    to: [to],
    subject: 'Anmeldung bestätigt — SENTIMENT',
    html: html
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (r) => {
      let raw = '';
      r.on('data', c => raw += c);
      r.on('end', () => resolve(raw));
    });
    req.on('error', () => resolve());
    req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    const { vorname, nachname, email, event, bereich, personen, nachricht, _gotcha } = req.body || {};

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
        personen: personen || '1',
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

      // send confirmation email (non-blocking, don't fail if email fails)
      sendConfirmationEmail(email, vorname, event, personen || '1').catch(() => {});

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save registration' });
    }
  }

  // DELETE — admin overwrites registrations list
  if (req.method === 'DELETE') {
    if (req.headers['x-admin-token'] !== 'sentiment2026') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { registrations } = req.body || {};
      if (!Array.isArray(registrations)) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const current = await githubRequest('GET', PATH);
      const sha = current.body.sha;
      const content = Buffer.from(JSON.stringify(registrations, null, 2)).toString('base64');
      await githubRequest('PUT', PATH, {
        message: 'admin: update registrations',
        content,
        sha
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update registrations' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
