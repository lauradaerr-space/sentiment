/* ══════════════════════════════════════════
   SENTIMENT — main.js
   Öffentliche Ausstellungsseite
   ══════════════════════════════════════════ */

/* ── STATE ── */
let allEvents     = [];
let currentFormat = 'all';
let lang          = 'de';

/* ══ EVENTS: laden & rendern ══ */

async function loadEvents() {
  try {
    const res  = await fetch('/api/events');
    const data = await res.json();
    // Nur veröffentlichte Events anzeigen
    allEvents = Array.isArray(data) ? data.filter(e => e.published) : [];
  } catch (e) {
    allEvents = [];
  }
  renderSchedule();
  renderSelect();
}

function renderSchedule() {
  const list     = document.getElementById('scheduleList');
  const filtered = allEvents.filter(e => currentFormat === 'all' || e.format === currentFormat);

  if (!filtered.length) {
    list.innerHTML = `<div class="no-results">${
      lang === 'de'
        ? 'Noch keine Programmpunkte veröffentlicht.'
        : 'No programme events published yet.'
    }</div>`;
    return;
  }

  const fmtLabels = {
    talk:      'Talk',
    workshop:  'Workshop',
    tour:      lang === 'de' ? 'Führung' : 'Tour',
    screening: 'Screening',
    lecture:   'Lecture'
  };

  list.innerHTML = filtered.map(e => {
    const title = lang === 'de' ? (e.titleDE || e.title) : e.title;
    const desc  = lang === 'de' ? (e.descDE  || e.desc  || '') : (e.desc || '');
    const full  = e.capacity > 0 && e.registered >= e.capacity;

    return `<article class="ev-card">
      <div class="ev-header">
        <span class="ev-format ${e.format}">${fmtLabels[e.format] || e.format}</span>
      </div>
      <div class="ev-title">${title}</div>
      ${desc ? `<p class="ev-desc">${desc}</p>` : ''}
      <div class="ev-meta">
        ${e.location ? `<span>${e.location}</span>` : ''}
        ${e.language ? `<span>${e.language}</span>` : ''}
        ${e.capacity ? `<span>Max. ${e.capacity}</span>` : ''}
      </div>
      <div class="ev-footer">
        <div class="ev-date-block">
          <div class="ev-date">${e.date || ''}</div>
          <div class="ev-time">${e.time || ''}</div>
        </div>
        <button class="reg-btn inline-register" data-event="${e.title}" ${full ? 'disabled' : ''}>
          ${full
            ? (lang === 'de' ? 'Ausgebucht' : 'Full')
            : (lang === 'de' ? 'Anmelden →' : 'Register →')
          }
        </button>
      </div>
    </article>`;
  }).join('');

  // Inline-Anmelden → scrollt zum Formular
  document.querySelectorAll('.inline-register').forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = document.getElementById('registerSelect');
      if (sel) sel.value = btn.dataset.event;
      document.getElementById('register').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const f = document.getElementById('inp-fn');
        if (f) f.focus();
      }, 500);
    });
  });
}

function renderSelect() {
  const sel = document.getElementById('registerSelect');
  if (!sel) return;
  const ph = lang === 'de' ? 'Veranstaltung wählen …' : 'Choose event …';
  sel.innerHTML = `<option value="">${ph}</option>` +
    allEvents.map(e =>
      `<option value="${e.title}">${lang === 'de' ? (e.titleDE || e.title) : e.title}</option>`
    ).join('');
}

/* ══ FORMAT FILTER ══ */
document.querySelectorAll('#formatFilters .chip[data-format]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFormat = btn.dataset.format;
    document.querySelectorAll('#formatFilters .chip[data-format]').forEach(b =>
      b.classList.toggle('active', b.dataset.format === currentFormat)
    );
    renderSchedule();
  });
});

/* ══ HAMBURGER ══ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

function closeMenu() {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) closeMenu();
});

/* ══ THEME ══ */
const swTrack = document.getElementById('sw-track');
let isDark    = true;

function setTheme(dark) {
  isDark = dark;
  document.body.classList.toggle('light', !dark);
  document.querySelectorAll('.sw-lbl').forEach(el => {
    const t = el.textContent.trim().toLowerCase();
    el.classList.toggle('on', dark
      ? (t === 'dunkel' || t === 'dark')
      : (t === 'hell'   || t === 'light')
    );
  });
  try { localStorage.setItem('sn-theme', dark ? 'dark' : 'light'); } catch (e) {}
}

try { setTheme(localStorage.getItem('sn-theme') !== 'light'); }
catch (e) { setTheme(true); }

swTrack.addEventListener('click', () => setTheme(!isDark));
swTrack.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setTheme(!isDark); }
});

/* ══ LANGUAGE ══ */
document.querySelectorAll('.lang-b').forEach(btn => {
  btn.addEventListener('click', () => {
    lang = btn.dataset.l;
    document.body.className =
      document.body.className.replace(/\blang-\w+/g, '').trim() + ' lang-' + lang;
    document.querySelectorAll('.lang-b').forEach(b =>
      b.classList.toggle('on', b.dataset.l === lang)
    );
    renderSchedule();
    renderSelect();
    try { localStorage.setItem('sn-lang', lang); } catch (e) {}
  });
});

try {
  lang = localStorage.getItem('sn-lang') || 'de';
  document.body.classList.add('lang-' + lang);
  document.querySelectorAll('.lang-b').forEach(b =>
    b.classList.toggle('on', b.dataset.l === lang)
  );
} catch (e) {
  document.body.classList.add('lang-de');
}

/* ══ REVEAL ON SCROLL ══ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ══ ANMELDEFORMULAR ══ */
const form   = document.getElementById('reg-form');
const subBtn = document.getElementById('sub-btn');
const okBox  = document.getElementById('ok-box');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    subBtn.disabled    = true;
    subBtn.innerHTML   = `<span>${lang === 'de' ? 'Wird gesendet …' : 'Sending …'}</span>`;

    // Demo-Modus wenn Formspree noch nicht eingerichtet
    if (form.action.includes('YOUR_FORM_ID')) {
      await new Promise(r => setTimeout(r, 900));
      form.style.display = 'none';
      okBox.style.display = 'block';
      return;
    }

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.style.display = 'none';
        okBox.style.display = 'block';
      } else throw new Error();
    } catch {
      subBtn.disabled  = false;
      subBtn.innerHTML = `<span>${lang === 'de' ? 'Fehler — bitte erneut →' : 'Error — try again →'}</span>`;
    }
  });
}

/* ══ p5.js STAGE ANIMATION ══ */
new p5(p => {
  let el, W, H;
  const pts = [];

  p.setup = () => {
    el = document.getElementById('p5-stage');
    W  = el.offsetWidth;
    H  = el.offsetHeight;
    p.createCanvas(W, H).parent('p5-stage');
    for (let i = 0; i < 55; i++) {
      pts.push({
        x:   p.random(W),
        y:   p.random(H),
        vx:  p.random(-.4, .4),
        vy:  p.random(-.4, .4),
        r:   p.random(1.2, 3),
        col: [[229,92,44],[135,102,255],[102,255,226]][p.floor(p.random(3))],
        a:   p.random(.18, .5),
        ph:  p.random(p.TWO_PI)
      });
    }
  };

  p.windowResized = () => {
    W = el.offsetWidth;
    H = el.offsetHeight;
    p.resizeCanvas(W, H);
  };

  p.draw = () => {
    const lt = document.body.classList.contains('light');
    p.background(lt ? 240 : 10, lt ? 10 : 12);

    // Grid
    p.stroke(255, lt ? 5 : 16);
    p.strokeWeight(.5);
    for (let x = 0; x < W; x += 42) p.line(x, 0, x, H);
    for (let y = 0; y < H; y += 42) p.line(0, y, W, y);

    // Verbindungslinien
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 88) {
          p.stroke(255, (1 - d/88) * 20);
          p.strokeWeight(.5);
          p.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
        }
      }
    }

    const mx  = p.mouseX;
    const my  = p.mouseY;
    const inc = mx > 0 && mx < W && my > 0 && my < H;

    pts.forEach(pt => {
      if (inc) {
        const dx = mx - pt.x;
        const dy = my - pt.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 130 && d > 1) {
          pt.vx += dx / d * .06;
          pt.vy += dy / d * .06;
        }
      }
      pt.vx *= .965; pt.vy *= .965;
      pt.x  += pt.vx; pt.y  += pt.vy;
      if (pt.x < 0)  pt.x = W;
      if (pt.x > W)  pt.x = 0;
      if (pt.y < 0)  pt.y = H;
      if (pt.y > H)  pt.y = 0;

      const pl = .5 + .5 * Math.sin(p.frameCount * .022 + pt.ph);
      p.noStroke();
      p.fill(pt.col[0], pt.col[1], pt.col[2], (pt.a * (.55 + .45 * pl)) * 255);
      p.circle(pt.x, pt.y, pt.r * 2);
    });

    // Maus-Cursor
    if (inc) {
      p.noStroke(); p.fill(204, 43, 29, 210); p.circle(mx, my, 6);
      p.stroke(204, 43, 29, 40); p.strokeWeight(1); p.noFill(); p.circle(mx, my, 80);
    }
  };
}, 'p5-stage');

/* ══ INIT ══ */
loadEvents();
