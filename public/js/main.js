/* ══════════════════════════════════════════
   SENTIMENT — main.js
   Öffentliche Ausstellungsseite
   ══════════════════════════════════════════ */

/* ── STATE ── */
let allEvents     = [];
let currentFormat = 'all';
let lang          = 'de';

/* ══ ANIMATED CANVAS BACKGROUND ══ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const blobs = [];
  for (let i = 0; i < 5; i++) {
    blobs.push({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      r: 0.15 + Math.random() * 0.15,
      color: i % 2 === 0 ? [229, 92, 44] : [135, 102, 255],
      phase: Math.random() * Math.PI * 2
    });
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    const lt = document.body.classList.contains('light');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = lt ? '#f0ebe2' : '#0a0a08';
    ctx.fillRect(0, 0, W, H);

    const t = Date.now() * 0.0004;
    blobs.forEach(b => {
      b.x += b.vx + Math.sin(t + b.phase) * 0.00008;
      b.y += b.vy + Math.cos(t * 0.7 + b.phase) * 0.00006;
      if (b.x < -0.2) b.x = 1.2;
      if (b.x > 1.2) b.x = -0.2;
      if (b.y < -0.2) b.y = 1.2;
      if (b.y > 1.2) b.y = -0.2;

      const pulse = 1 + 0.15 * Math.sin(t * 1.2 + b.phase);
      const radius = b.r * Math.min(W, H) * pulse;
      const cx = b.x * W;
      const cy = b.y * H;
      const opacity = lt ? 0.05 : 0.08;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${opacity})`);
      grad.addColorStop(1, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══ TEAM DATA ══ */
const TEAM = [
  {
    id: 1, name: 'Dr. Anna Meier',
    role_de: 'Künstlerische Leitung', role_en: 'Artistic Director',
    type: 'artist', initials: 'AM',
    bio_short_de: 'Medienkünstlerin mit Fokus auf interaktive Installationen und KI-Ästhetik.',
    bio_short_en: 'Media artist focusing on interactive installations and AI aesthetics.',
    bio_long_de: 'Dr. Anna Meier ist Medienkünstlerin und Professorin für Digitale Kunst. Ihre Arbeiten untersuchen die Schnittstelle zwischen menschlicher Emotionalität und algorithmischen Systemen. Im Projekt SENTIMENT entwickelt sie die interaktiven Installationen für die Ausstellung im KunstWerk Köln.',
    bio_long_en: 'Dr. Anna Meier is a media artist and professor of Digital Art. Her work explores the intersection of human emotionality and algorithmic systems. In the SENTIMENT project, she develops the interactive installations for the exhibition at KunstWerk Cologne.',
    image: null
  },
  {
    id: 2, name: 'Prof. Lukas Weber',
    role_de: 'Privacy Research Lead', role_en: 'Privacy Research Lead',
    type: 'researcher', initials: 'LW',
    bio_short_de: 'Informatiker und Datenschutzforscher an der TU Köln.',
    bio_short_en: 'Computer scientist and privacy researcher at TU Cologne.',
    bio_long_de: 'Prof. Lukas Weber leitet die Forschungsgruppe für Privacy Engineering an der TU Köln. Seine Arbeit bei SENTIMENT konzentriert sich auf die technischen und ethischen Aspekte des Datenschutzes bei intimen Mensch-KI-Interaktionen, insbesondere auf sichere Dialogsysteme.',
    bio_long_en: 'Prof. Lukas Weber heads the Privacy Engineering research group at TU Cologne. His work at SENTIMENT focuses on the technical and ethical aspects of data protection in intimate human-AI interactions, particularly secure dialogue systems.',
    image: null
  },
  {
    id: 3, name: 'Yuki Tanaka',
    role_de: 'Sound & Installation', role_en: 'Sound & Installation',
    type: 'artist', initials: 'YT',
    bio_short_de: 'Klangkünstlerin, die immersive Räume zwischen Technologie und Intimität schafft.',
    bio_short_en: 'Sound artist creating immersive spaces between technology and intimacy.',
    bio_long_de: 'Yuki Tanaka arbeitet an der Grenze von Sound Art und Technologie. Für SENTIMENT gestaltet sie eine immersive Klanginstallation, die auf die emotionale Qualität von Chatbot-Dialogen reagiert und diese in räumliche Klangerlebnisse übersetzt.',
    bio_long_en: 'Yuki Tanaka works at the boundary of sound art and technology. For SENTIMENT, she creates an immersive sound installation that responds to the emotional quality of chatbot dialogues and translates them into spatial sound experiences.',
    image: null
  },
  {
    id: 4, name: 'Dr. Sarah Hoffmann',
    role_de: 'Psychologie & Ethik', role_en: 'Psychology & Ethics',
    type: 'researcher', initials: 'SH',
    bio_short_de: 'Forscherin für digitale Psychologie und ethische KI-Gestaltung.',
    bio_short_en: 'Researcher in digital psychology and ethical AI design.',
    bio_long_de: 'Dr. Sarah Hoffmann erforscht die psychologischen Auswirkungen intimer Mensch-KI-Beziehungen. Im Rahmen von SENTIMENT untersucht sie, wie Vertrauen und emotionale Bindung in Chatbot-Interaktionen entstehen und welche ethischen Leitlinien für deren Gestaltung notwendig sind.',
    bio_long_en: 'Dr. Sarah Hoffmann studies the psychological effects of intimate human-AI relationships. Within SENTIMENT, she examines how trust and emotional attachment form in chatbot interactions and what ethical guidelines are needed for their design.',
    image: null
  },
  {
    id: 5, name: 'Marco da Silva',
    role_de: 'Interaktive Medien', role_en: 'Interactive Media',
    type: 'artist', initials: 'MS',
    bio_short_de: 'Interaction Designer und Creative Technologist aus Brüssel.',
    bio_short_en: 'Interaction designer and creative technologist from Brussels.',
    bio_long_de: 'Marco da Silva entwickelt interaktive Medieninstallationen, die physische und digitale Räume verbinden. Bei SENTIMENT ist er verantwortlich für die technische Umsetzung der Pop-up-Ausstellung bei der CPDP-Konferenz in Brüssel und die digitale Plattform des Projekts.',
    bio_long_en: 'Marco da Silva develops interactive media installations that connect physical and digital spaces. At SENTIMENT, he is responsible for the technical implementation of the pop-up exhibition at the CPDP conference in Brussels and the project\'s digital platform.',
    image: null
  },
  {
    id: 6, name: 'Dr. Elena Petrov',
    role_de: 'Kommunikationswissenschaft', role_en: 'Communication Science',
    type: 'researcher', initials: 'EP',
    bio_short_de: 'Medienforscherin mit Schwerpunkt auf KI-vermittelte Kommunikation.',
    bio_short_en: 'Media researcher specializing in AI-mediated communication.',
    bio_long_de: 'Dr. Elena Petrov analysiert die kommunikativen Dynamiken in Mensch-Chatbot-Interaktionen. Ihre Forschung bei SENTIMENT untersucht, wie Intimität und emotionale Nähe in digitalen Dialogsystemen sprachlich konstruiert werden und welche gesellschaftlichen Implikationen sich daraus ergeben.',
    bio_long_en: 'Dr. Elena Petrov analyzes the communicative dynamics in human-chatbot interactions. Her research at SENTIMENT examines how intimacy and emotional closeness are linguistically constructed in digital dialogue systems and the resulting societal implications.',
    image: null
  }
];

/* ══ TEAM RENDERING ══ */
function renderTeam() {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;
  grid.innerHTML = TEAM.map(p => `
    <div class="person-card reveal" data-person="${p.id}">
      <div class="person-avatar">${p.image ? `<img src="${p.image}" alt="${p.name}">` : p.initials}</div>
      <div class="person-name">${p.name}</div>
      <div class="person-role">${lang === 'de' ? p.role_de : p.role_en}</div>
      <div class="person-bio-short">${lang === 'de' ? p.bio_short_de : p.bio_short_en}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.person-card').forEach(card => {
    card.addEventListener('click', () => {
      const person = TEAM.find(p => p.id === parseInt(card.dataset.person));
      if (person) openPersonModal(person);
    });
  });

  // re-observe reveals
  grid.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

function openPersonModal(p) {
  const modal = document.getElementById('person-modal');
  const body = document.getElementById('person-modal-body');
  body.innerHTML = `
    <div class="pm-avatar">${p.image ? `<img src="${p.image}" alt="${p.name}">` : p.initials}</div>
    <div class="pm-name">${p.name}</div>
    <div class="pm-role">${lang === 'de' ? p.role_de : p.role_en}</div>
    <div class="pm-bio">${lang === 'de' ? p.bio_long_de : p.bio_long_en}</div>
  `;
  modal.classList.add('open');
}

document.getElementById('person-modal-close').addEventListener('click', () => {
  document.getElementById('person-modal').classList.remove('open');
});
document.getElementById('person-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

/* ══ EVENTS: laden & rendern ══ */

async function loadEvents() {
  try {
    const res  = await fetch('/api/events');
    const data = await res.json();
    // Nur veröffentlichte Events anzeigen
    const list = Array.isArray(data) ? data : (data.events || []);
    const INTERNAL = ['pub', 'pr', 'other'];
    allEvents = list.filter(e => e.published && INTERNAL.indexOf(e.category) === -1);
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
          <div class="ev-date">${e.dateFrom || e.date || ''}</div>
          <div class="ev-time">${e.time || ''}${e.timeEnd ? ' – ' + e.timeEnd : ''}</div>
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
    renderTeam();
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

    p.stroke(255, lt ? 5 : 16);
    p.strokeWeight(.5);
    for (let x = 0; x < W; x += 42) p.line(x, 0, x, H);
    for (let y = 0; y < H; y += 42) p.line(0, y, W, y);

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

    if (inc) {
      p.noStroke(); p.fill(204, 43, 29, 210); p.circle(mx, my, 6);
      p.stroke(204, 43, 29, 40); p.strokeWeight(1); p.noFill(); p.circle(mx, my, 80);
    }
  };
}, 'p5-stage');

/* ══ INIT ══ */
renderTeam();
loadEvents();
