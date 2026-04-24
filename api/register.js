const https = require('https');
const nodemailer = require('nodemailer');

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const PATH  = 'data/registrations.json';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const SITE_URL  = process.env.SITE_URL || 'https://project-sentiment.org/exhibition';

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  return transporter;
}

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

async function sendConfirmationEmail(to, vorname, eventName, personen) {
  const t = getTransporter();
  if (!t) {
    console.log('SMTP not configured — skipping email');
    return;
  }

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
        <p style="margin:0 0 6px;font-size:9px;color:rgba(237,232,223,0.5);text-transform:uppercase;letter-spacing:.12em;">Veranstaltung</p>
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#ede8df;">${eventName}</p>
        <p style="margin:0 0 6px;font-size:9px;color:rgba(237,232,223,0.5);text-transform:uppercase;letter-spacing:.12em;">Personen</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#ede8df;">${personen}</p>
      </div>
      <p style="font-size:15px;line-height:1.7;color:rgba(237,232,223,0.7);margin:0 0 20px;">
        Wir freuen uns auf dich!
      </p>
      <a href="${SITE_URL}" style="display:inline-block;padding:11px 22px;background:#8766ff;color:#fff;text-decoration:none;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">Zur Website →</a>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.09);margin:28px 0 16px;">
      <p style="font-size:10px;color:rgba(237,232,223,0.35);letter-spacing:.06em;line-height:1.7;margin:0;">
        SENTIMENT &mdash; Creating Safe &amp; Supportive Spaces for Intimate Communication<br>
        KunstWerk e.V. &middot; Deutz-M&uuml;lheimer Str. 115 &middot; 51063 K&ouml;ln<br>
        <a href="${SITE_URL}" style="color:rgba(237,232,223,0.35);">project-sentiment.org/exhibition</a>
      </p>
    </div>
  `;

  const text = [
    'Hallo ' + vorname + ',',
    '',
    'vielen Dank für deine Anmeldung!',
    '',
    'Veranstaltung: ' + eventName,
    'Personen: ' + personen,
    '',
    'Wir freuen uns auf dich!',
    '',
    '—',
    'SENTIMENT — KunstWerk e.V.',
    'Deutz-Mülheimer Str. 115, 51063 Köln',
    SITE_URL
  ].join('\n');

  await t.sendMail({
    from: '"SENTIMENT" <' + FROM_EMAIL + '>',
    to: to,
    subject: 'Anmeldung bestätigt — SENTIMENT',
    text: text,
    html: html
  });
  console.log('Confirmation email sent to', to);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — public count or admin full list
  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const countOnly = url.searchParams.get('count') === 'true';
    const eventFilter = url.searchParams.get('event');

    // public count endpoint — no auth needed
    if (countOnly && eventFilter) {
      try {
        const r = await githubRequest('GET', PATH);
        const registrations = JSON.parse(Buffer.from(r.body.content, 'base64').toString());
        const filtered = registrations.filter(reg =>
          reg.event && reg.event.toLowerCase() === eventFilter.toLowerCase()
        );
        const totalPersons = filtered.reduce((s, r) => s + parseInt(r.personen || '1', 10), 0);
        return res.status(200).json({ count: filtered.length, persons: totalPersons });
      } catch (e) {
        return res.status(200).json({ count: 0, persons: 0 });
      }
    }

    // admin full list
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
