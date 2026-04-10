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
    id: 'jessica-szczuka', name: 'Dr. Jessica Szczuka',
    role_en: 'Head of Junior Research Group INTITEC, University of Duisburg-Essen',
    role_de: 'Leiterin der Nachwuchsforschungsgruppe INTITEC, Universität Duisburg-Essen',
    type: 'researcher', initials: 'JS',
    image: '/public/img/team/jessica-szczuka.jpg',
    bio_short_en: 'Dr. Szczuka leads the INTITEC research group at the University of Duisburg-Essen, investigating digitized intimacy through media, social, and communication psychology combined with Human-Computer Interaction.',
    bio_short_de: 'Dr. Szczuka leitet die Forschungsgruppe INTITEC an der Universität Duisburg-Essen und untersucht digitale Intimität aus Perspektive der Medien-, Sozial- und Kommunikationspsychologie sowie der Mensch-Computer-Interaktion.',
    bio_long_en: 'Dr. Jessica Szczuka is the head of the Junior Research Group INTITEC (Intimacy with and through Technologies) at the University of Duisburg-Essen. Her research integrates media, social, and communication psychology with Human-Computer Interaction to explore the impact of digitalisation on concepts of love and sexuality. She earned her PhD in Social Psychology at the University of Duisburg-Essen. Her research addresses two core directions: what makes humans unique in interaction with machines, and what ethical frameworks are needed for the responsible development of digital intimacy technologies.',
    bio_long_de: 'Dr. Jessica Szczuka leitet die Nachwuchsforschungsgruppe INTITEC (Intimität mit und durch Technologien) an der Universität Duisburg-Essen. Ihre Forschung verbindet Medien-, Sozial- und Kommunikationspsychologie mit Human-Computer Interaction, um die Auswirkungen der Digitalisierung auf Konzepte von Liebe und Sexualität zu untersuchen. Sie promovierte in Sozialpsychologie an der Universität Duisburg-Essen. Ihre Forschung verfolgt zwei Kernrichtungen: Was macht Menschen in der Interaktion mit Maschinen einzigartig, und welche ethischen Rahmenbedingungen werden für die verantwortungsvolle Entwicklung digitaler Intimitätstechnologien benötigt?'
  },
  {
    id: 'lisa-muehl', name: 'M.Sc. Lisa Mühl',
    role_en: 'Research Associate & PhD Candidate, University of Duisburg-Essen',
    role_de: 'Wissenschaftliche Mitarbeiterin & Doktorandin, Universität Duisburg-Essen',
    type: 'researcher', initials: 'LM',
    image: '/public/img/team/lisa-muehl.jpg',
    bio_short_en: 'Lisa Mühl is a research associate in SENTIMENT and PhD candidate in the INTITEC group, researching intimate communication with natural language dialogue systems and self-disclosure behaviour.',
    bio_short_de: 'Lisa Mühl ist wissenschaftliche Mitarbeiterin im SENTIMENT-Projekt und Doktorandin in der INTITEC-Gruppe. Sie erforscht intime Kommunikation mit natürlichsprachlichen Dialogsystemen und Selbstoffenbarungsverhalten.',
    bio_long_en: 'Lisa Mühl is a research associate in the SENTIMENT project and a PhD candidate in the INTITEC junior research group at the University of Duisburg-Essen. She holds degrees in Media and Business Psychology and Applied Cognitive and Media Science. Her doctoral research investigates intimate communication with natural language dialogue systems, focusing on self-disclosure across text and voice modalities and how interaction patterns evolve over time.',
    bio_long_de: 'Lisa Mühl ist wissenschaftliche Mitarbeiterin im SENTIMENT-Projekt und Doktorandin in der Nachwuchsforschungsgruppe INTITEC der Universität Duisburg-Essen. Sie hat Abschlüsse in Medien- und Wirtschaftspsychologie sowie in Angewandter Kognitions- und Medienwissenschaft. Ihre Doktorarbeit untersucht intime Kommunikation mit natürlichsprachlichen Dialogsystemen, mit Fokus auf Selbstoffenbarung in Text- und Sprachmodalitäten und die Entwicklung von Interaktionsmustern über die Zeit.'
  },
  {
    id: 'anna-straub', name: 'B.Sc. Anna Straub',
    role_en: 'Student Assistant, University of Duisburg-Essen',
    role_de: 'Studentische Hilfskraft, Universität Duisburg-Essen',
    type: 'researcher', initials: 'AS',
    image: '/public/img/team/anna-straub.jpg',
    bio_short_en: 'Anna Straub is a student assistant in the SENTIMENT project, currently pursuing her Bachelor\'s degree in Applied Cognitive and Media Sciences at the University of Duisburg-Essen.',
    bio_short_de: 'Anna Straub ist studentische Hilfskraft im SENTIMENT-Projekt und studiert derzeit Applied Cognitive and Media Sciences an der Universität Duisburg-Essen.',
    bio_long_en: 'Anna Straub is a student assistant in the SENTIMENT project and is currently pursuing a Bachelor\'s degree in Applied Cognitive and Media Sciences at the University of Duisburg-Essen.',
    bio_long_de: 'Anna Straub ist studentische Hilfskraft im SENTIMENT-Projekt und studiert derzeit Applied Cognitive and Media Sciences an der Universität Duisburg-Essen.'
  },
  {
    id: 'veelasha-moonsamy', name: 'Prof. Dr. Veelasha Moonsamy',
    role_en: 'Professor for Security and Privacy of Ubiquitous Systems, Ruhr University Bochum',
    role_de: 'Professorin für Sicherheit und Datenschutz ubiquitärer Systeme, Ruhr-Universität Bochum',
    type: 'researcher', initials: 'VM',
    image: '/public/img/team/veelasha-moonsamy.jpg',
    bio_short_en: 'Prof. Moonsamy leads the Chair for Security and Privacy of Ubiquitous Systems at Ruhr University Bochum and is a Principal Investigator in the Excellence Cluster CASA.',
    bio_short_de: 'Prof. Moonsamy leitet den Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme an der Ruhr-Universität Bochum und ist Principal Investigator im Exzellenzcluster CASA.',
    bio_long_en: 'Prof. Dr. Veelasha Moonsamy is a Professor in the Faculty of Computer Science at Ruhr University Bochum, where she leads the Chair for Security and Privacy of Ubiquitous Systems. She is a member of the Horst Görtz Institute for IT Security and a Principal Investigator in the Excellence Cluster CASA. Her research covers IoT, mobile and embedded systems, data privacy, and machine learning applications for security. She is the recipient of a Google Faculty Award and Meta Research Award.',
    bio_long_de: 'Prof. Dr. Veelasha Moonsamy ist Professorin an der Fakultät für Informatik der Ruhr-Universität Bochum, wo sie den Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme leitet. Sie ist Mitglied des Horst-Görtz-Instituts für IT-Sicherheit und Principal Investigator im Exzellenzcluster CASA. Ihre Forschung umfasst IoT-, Mobile- und Embedded-Systeme, Datenschutz sowie maschinelles Lernen für Sicherheitsanwendungen. Sie ist Trägerin des Google Faculty Award und des Meta Research Award.'
  },
  {
    id: 'ramya-kandula', name: 'M.Sc. Ramya Kandula',
    role_en: 'PhD Student, Chair for Security and Privacy of Ubiquitous Systems, Ruhr University Bochum',
    role_de: 'Doktorandin, Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme, Ruhr-Universität Bochum',
    type: 'researcher', initials: 'RK',
    image: '/public/img/team/ramya-kandula.jpg',
    bio_short_en: 'Ramya Kandula is a PhD student at Ruhr University Bochum researching self-disclosure in human-chatbot interactions using privacy-by-design mechanisms and HCI methods.',
    bio_short_de: 'Ramya Kandula ist Doktorandin an der Ruhr-Universität Bochum und erforscht Selbstoffenbarung in Mensch-Chatbot-Interaktionen mit Methoden aus Privacy-by-Design und HCI.',
    bio_long_en: 'Ramya Kandula is a PhD student at the Chair for Security and Privacy of Ubiquitous Systems at Ruhr University Bochum. She holds a Master\'s degree in Interactive Media Technologies from KTH Royal Institute of Technology. In SENTIMENT, she explores self-disclosure tendencies in human-chatbot interactions through privacy and user-centric lenses, combining computational and psychological approaches to develop secure self-disclosure strategies.',
    bio_long_de: 'Ramya Kandula ist Doktorandin am Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme der Ruhr-Universität Bochum. Sie hat einen Master in Interactive Media Technologies vom KTH Royal Institute of Technology. Im SENTIMENT-Projekt untersucht sie Selbstoffenbarungstendenzen in Mensch-Chatbot-Interaktionen aus Datenschutz- und nutzerzentrierter Perspektive, um sichere Strategien zur Selbstoffenbarung zu entwickeln.'
  },
  {
    id: 'joel-baumann', name: 'Prof. Joel Baumann',
    role_en: 'Professor of New Media, Kunsthochschule Kassel',
    role_de: 'Professor für Neue Medien, Kunsthochschule Kassel',
    type: 'artist', initials: 'JB',
    image: '/public/img/team/joel-baumann.jpg',
    bio_short_en: 'Prof. Baumann examines self-disclosure in human-machine interaction from a critical-artistic perspective, using exhibition formats as dialogical spaces that make scientific knowledge sensually accessible.',
    bio_short_de: 'Prof. Baumann untersucht Selbstoffenbarung in der Mensch-Maschine-Interaktion aus kritisch-künstlerischer Perspektive und nutzt Ausstellungsformate als dialogische Räume, die wissenschaftliches Wissen sinnlich zugänglich machen.',
    bio_long_en: 'Prof. Joel Baumann is Professor of New Media at the Kunsthochschule Kassel. In SENTIMENT, he examines processes of self-disclosure in human-machine interaction from a critical-artistic perspective, focusing on the societal and ethical implications of digital intimacy. His curatorial practice employs exhibition formats as dialogical spaces in which scientific knowledge becomes sensually and emotionally accessible, bridging technology, ethics, and aesthetics.',
    bio_long_de: 'Prof. Joel Baumann ist Professor für Neue Medien an der Kunsthochschule Kassel. Im SENTIMENT-Projekt untersucht er Prozesse der Selbstoffenbarung in der Mensch-Maschine-Interaktion aus kritisch-künstlerischer Perspektive, mit Fokus auf gesellschaftliche und ethische Implikationen digitaler Intimität. Seine kuratorische Praxis nutzt Ausstellungsformate als dialogische Räume, in denen wissenschaftliches Wissen sinnlich und emotional zugänglich wird und Technologie, Ethik und Ästhetik verbindet.'
  },
  {
    id: 'laura-daerr', name: 'Laura Därr',
    role_en: 'Artistic Research Associate in New Media, Kunsthochschule Kassel',
    role_de: 'Künstlerische Mitarbeiterin Neue Medien, Kunsthochschule Kassel',
    type: 'artist', initials: 'LD',
    image: '/public/img/team/laura-daerr.jpg',
    bio_short_en: 'Laura Därr\'s artistic research focuses on algorithmic intervention in AI-based systems, employing critical making methodologies to interrogate the sociopolitical implications of automated decision-making.',
    bio_short_de: 'Laura Därrs künstlerische Forschung konzentriert sich auf algorithmische Intervention in KI-basierten Systemen und nutzt Critical-Making-Methoden, um die gesellschaftspolitischen Implikationen automatisierter Entscheidungsprozesse zu hinterfragen.',
    bio_long_en: 'Laura Därr is an artistic research associate in New Media at Kunsthochschule Kassel and a member of the SENTIMENT project. Her artistic research focuses on algorithmic intervention in AI-based systems that autonomously structure and influence human interaction patterns. Her practice employs critical making methodologies to interrogate the sociopolitical implications of automated decision-making, developing experimental frameworks that expose the hidden logics embedded within computational systems.',
    bio_long_de: 'Laura Därr ist künstlerische Mitarbeiterin für Neue Medien an der Kunsthochschule Kassel und Mitglied des SENTIMENT-Projekts. Ihre künstlerische Forschung konzentriert sich auf algorithmische Intervention in KI-basierte Systeme, die menschliche Interaktionsmuster autonom strukturieren und beeinflussen. Ihre Praxis setzt Critical-Making-Methoden ein, um die gesellschaftspolitischen Implikationen automatisierter Entscheidungsprozesse zu hinterfragen und experimentelle Frameworks zu entwickeln, die die verborgenen Logiken computationaler Systeme freilegen.'
  },
  {
    id: 'maxi-nebel', name: 'Dr. Maxi Nebel',
    role_en: 'Researcher, Research Center for Information Systems Design (ITeG), University of Kassel',
    role_de: 'Wissenschaftlerin, Forschungszentrum für Informationssystemgestaltung (ITeG), Universität Kassel',
    type: 'researcher', initials: 'MN',
    image: '/public/img/team/maxi-nebel.jpg',
    bio_short_en: 'Dr. Nebel researches data protection law, technology law, and artificial intelligence at the University of Kassel\'s ITeG research center, with extensive experience in interdisciplinary research projects.',
    bio_short_de: 'Dr. Nebel forscht am ITeG der Universität Kassel zu Datenschutzrecht, Technologierecht und Künstlicher Intelligenz und verfügt über langjährige Erfahrung in interdisziplinären Forschungsprojekten.',
    bio_long_en: 'Dr. Maxi Nebel is a researcher at the Research Center for Information Systems Design (ITeG) at the University of Kassel. She completed her PhD on privacy protection in social networks. With many years of experience in interdisciplinary research, she conducts research on data protection law, technology law, and artificial intelligence, and is the author of numerous publications.',
    bio_long_de: 'Dr. Maxi Nebel ist Wissenschaftlerin am Forschungszentrum für Informationssystemgestaltung (ITeG) der Universität Kassel. Sie promovierte zum Thema Datenschutz in sozialen Netzwerken. Mit langjähriger Erfahrung in interdisziplinären Forschungsprojekten forscht sie zu Datenschutzrecht, Technologierecht und Künstlicher Intelligenz und ist Autorin zahlreicher Publikationen.'
  },
  {
    id: 'christian-geminn', name: 'PD Dr. Christian Geminn',
    role_en: 'Private Lecturer for Public Law and Law of the Digital Society, University of Kassel',
    role_de: 'Privatdozent für Öffentliches Recht und Recht der digitalen Gesellschaft, Universität Kassel',
    type: 'researcher', initials: 'CG',
    image: '/public/img/team/christian-geminn.jpg',
    bio_short_en: 'PD Dr. Geminn is a private lecturer at the University of Kassel and consultant for ministries and organisations, researching fundamental rights, data protection, and technology law.',
    bio_short_de: 'PD Dr. Geminn ist Privatdozent an der Universität Kassel und Berater für Ministerien und Organisationen, mit Forschungsschwerpunkten in Grundrechten, Datenschutz und Technologierecht.',
    bio_long_en: 'PD Dr. Christian Geminn is a private lecturer for Public Law and Law of the Digital Society at the University of Kassel. He is active as a consultant for ministries, non-profit organisations, and companies, and is a principal investigator in several third-party funded research projects. His research focuses on fundamental rights, comparative law, data protection, governance, and technology law.',
    bio_long_de: 'PD Dr. Christian Geminn ist Privatdozent für Öffentliches Recht und Recht der digitalen Gesellschaft an der Universität Kassel. Er ist als Berater für Ministerien, Non-Profit-Organisationen und Unternehmen tätig und Principal Investigator in mehreren drittmittelgeförderten Forschungsprojekten. Seine Forschungsschwerpunkte sind Grundrechte, Rechtsvergleichung, Datenschutz, Governance und Technologierecht.'
  }
];

/* ══ TEAM RENDERING ══ */
function renderTeam() {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;

  grid.innerHTML = TEAM.map(p => `
    <div class="person-card reveal" data-person="${p.id}">
      <div class="person-avatar"><img src="${p.image}" alt="${p.name}" onerror="this.replaceWith(document.createTextNode('${p.initials}'))"></div>
      <div class="person-name">${p.name}</div>
      <div class="person-role">${lang === 'de' ? p.role_de : p.role_en}</div>
      <div class="person-bio-short">${lang === 'de' ? p.bio_short_de : p.bio_short_en}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.person-card').forEach(card => {
    card.addEventListener('click', () => {
      const person = TEAM.find(p => p.id === card.dataset.person);
      if (person) openPersonModal(person);
    });
  });

  grid.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

function openPersonModal(p) {
  const modal = document.getElementById('person-modal');
  const body = document.getElementById('person-modal-body');
  body.innerHTML = `
    <div class="pm-avatar"><img src="${p.image}" alt="${p.name}" onerror="this.replaceWith(document.createTextNode('${p.initials}'))"></div>
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
    lecture:   'Lecture',
    other:     lang === 'de' ? 'Sonstiges' : 'Other'
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
    subBtn.disabled  = true;
    subBtn.innerHTML = `<span>${lang === 'de' ? 'Wird gesendet …' : 'Sending …'}</span>`;

    const body = {
      vorname:   form.vorname.value,
      nachname:  form.nachname.value,
      email:     form.email.value,
      event:     form.event.value,
      bereich:   form.bereich.value,
      personen:  form.personen.value,
      nachricht: form.nachricht.value,
      _gotcha:   form._gotcha.value
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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

/* ══ CUSTOM CURSOR ══ */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
if (cursorDot && cursorRing && window.matchMedia('(pointer:fine)').matches) {
  let rx = window.innerWidth/2, ry = window.innerHeight/2;
  let cmx = rx, cmy = ry;

  document.addEventListener('mousemove', e => {
    cmx = e.clientX; cmy = e.clientY;
    cursorDot.style.left = cmx+'px'; cursorDot.style.top = cmy+'px';
  });

  (function animRing() {
    rx += (cmx - rx) * 0.10;
    ry += (cmy - ry) * 0.10;
    cursorRing.style.left = Math.round(rx)+'px';
    cursorRing.style.top  = Math.round(ry)+'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .ev-card, .person-card, .chip, .reg-btn').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('link'); cursorRing.classList.add('link'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('link'); cursorRing.classList.remove('link'); });
  });
}

/* ══ p5.js STAGE ANIMATION ══ */
new p5(p => {
  let el, W, H, motif = null;
  const pts = [];
  const anchors = [];

  p.preload = () => {
    p.loadImage('/public/img/stage-motif.png',
      img => { motif = img; },
      () => { motif = null; }
    );
  };

  p.setup = () => {
    el = document.getElementById('p5-stage');
    W  = el.offsetWidth;
    H  = el.offsetHeight;
    p.createCanvas(W, H).parent('p5-stage');

    for (let i = 0; i < 75; i++) {
      pts.push({
        x: p.random(W), y: p.random(H),
        vx: p.random(-.4, .4), vy: p.random(-.4, .4),
        r: p.random(1.2, 3),
        col: [[229,92,44],[135,102,255],[102,255,226]][p.floor(p.random(3))],
        a: p.random(.18, .5),
        ph: p.random(p.TWO_PI)
      });
    }

    for (let i = 0; i < 3; i++) {
      anchors.push({
        x: p.random(W), y: p.random(H),
        vx: p.random(-.08, .08), vy: p.random(-.08, .08),
        r: p.random(8, 14),
        col: [[229,92,44],[135,102,255],[102,255,226]][i],
        ph: p.random(p.TWO_PI)
      });
    }
  };

  p.windowResized = () => {
    W = el.offsetWidth; H = el.offsetHeight;
    p.resizeCanvas(W, H);
  };

  p.draw = () => {
    const lt = document.body.classList.contains('light');
    p.clear();

    // motif base layer
    if (motif) {
      p.push();
      p.tint(255, 255 * 0.45);
      const scale = Math.max(W / motif.width, H / motif.height);
      const mw = motif.width * scale, mh = motif.height * scale;
      p.image(motif, (W - mw)/2, (H - mh)/2, mw, mh);
      p.pop();
    }

    // dot grid
    p.noStroke();
    p.fill(255, lt ? 8 : 15);
    for (let x = 0; x < W; x += 44) {
      for (let y = 0; y < H; y += 44) {
        p.circle(x, y, 1.6);
      }
    }

    // breathing center pulse
    const breath = 0.5 + 0.5 * Math.sin(p.frameCount * 0.015);
    const pulseR = 40 + breath * 40;
    const pulseA = (0.03 + breath * 0.03) * 255;
    p.noStroke();
    p.fill(135, 102, 255, pulseA);
    p.circle(W/2, H/2, pulseR * 2);

    const pmx = p.mouseX;
    const pmy = p.mouseY;
    const inc = pmx > 0 && pmx < W && pmy > 0 && pmy < H;

    // connection lines
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 88) {
          let baseA = (1 - d/88) * 20;
          if (inc) {
            const midX = (pts[i].x + pts[j].x) / 2;
            const midY = (pts[i].y + pts[j].y) / 2;
            const dm = Math.sqrt((midX-pmx)**2 + (midY-pmy)**2);
            if (dm < 100) baseA *= 3;
          }
          p.stroke(255, baseA);
          p.strokeWeight(.5);
          p.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
        }
      }
    }

    // particles
    pts.forEach(pt => {
      if (inc) {
        const dx = pmx - pt.x;
        const dy = pmy - pt.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90 && d > 1) {
          pt.vx -= dx / d * .04;
          pt.vy -= dy / d * .04;
        } else if (d >= 90 && d < 200 && d > 1) {
          pt.vx += dx / d * .02;
          pt.vy += dy / d * .02;
        }
      }
      pt.vx *= .965; pt.vy *= .965;
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < 0) pt.x = W; if (pt.x > W) pt.x = 0;
      if (pt.y < 0) pt.y = H; if (pt.y > H) pt.y = 0;

      const pl = .5 + .5 * Math.sin(p.frameCount * .022 + pt.ph);
      p.noStroke();
      p.fill(pt.col[0], pt.col[1], pt.col[2], (pt.a * (.55 + .45 * pl)) * 255);
      p.circle(pt.x, pt.y, pt.r * 2);
    });

    // anchor particles
    anchors.forEach(a => {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      const ap = .5 + .5 * Math.sin(p.frameCount * .01 + a.ph);
      p.noStroke();
      p.fill(a.col[0], a.col[1], a.col[2], 0.06 * 255 * (.7 + .3 * ap));
      p.circle(a.x, a.y, a.r * 2);
    });
  };
}, 'p5-stage');

/* ══ INIT ══ */
const stageVideo = document.getElementById('stageVideo');
if (stageVideo) stageVideo.playbackRate = 0.75;

renderTeam();
loadEvents();
