/* ══════════════════════════════════════════
   SENTIMENT — main.js
   Öffentliche Ausstellungsseite
   ══════════════════════════════════════════ */

/* ── STATE ── */
let allEvents     = [];
let activeFormats = new Set(['all']);
let lang          = 'de';
let archiveOpen   = false;
let allQuestions  = [];

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

/* ══ TEAM DATA (default — overridden by API if admin has saved a team) ══ */
let TEAM = [
  {
    id: 'jessica-szczuka', name: 'Dr. Jessica Szczuka',
    role_en: 'Head of Junior Research Group INTITEC, University of Duisburg-Essen',
    role_de: 'Leiterin der Nachwuchsforschungsgruppe INTITEC, Universität Duisburg-Essen',
    type: 'researcher', initials: 'JS',
    image: 'public/img/team/jessica-szczuka.jpg',
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
    image: 'public/img/team/lisa-muehl.jpg',
    bio_short_en: 'Lisa Mühl is a research associate in SENTIMENT and PhD candidate in the INTITEC group, researching intimate communication with natural language dialogue systems and self-disclosure behaviour.',
    bio_short_de: 'Lisa Mühl ist wissenschaftliche Mitarbeiterin im SENTIMENT-Projekt und Doktorandin in der INTITEC-Gruppe. Sie erforscht intime Kommunikation mit natürlichsprachlichen Dialogsystemen und Selbstoffenbarungsverhalten.',
    bio_long_en: 'Lisa Mühl is a research associate in the SENTIMENT project and a PhD candidate in the INTITEC junior research group at the University of Duisburg-Essen. She holds degrees in Media and Business Psychology and Applied Cognitive and Media Science. Her doctoral research investigates intimate communication with natural language dialogue systems, focusing on self-disclosure across text and voice modalities and how interaction patterns evolve over time.',
    bio_long_de: 'Lisa Mühl ist wissenschaftliche Mitarbeiterin im SENTIMENT-Projekt und Doktorandin in der Nachwuchsforschungsgruppe INTITEC der Universität Duisburg-Essen. Sie hat Abschlüsse in Medien- und Wirtschaftspsychologie sowie in Angewandter Kognitions- und Medienwissenschaft. Ihre Doktorarbeit untersucht intime Kommunikation mit natürlichsprachlichen Dialogsystemen, mit Fokus auf Selbstoffenbarung in Text- und Sprachmodalitäten und die Entwicklung von Interaktionsmustern über die Zeit.'
  },
  {
    id: 'veelasha-moonsamy', name: 'Prof. Dr. Veelasha Moonsamy',
    role_en: 'Professor for Security and Privacy of Ubiquitous Systems, Ruhr University Bochum',
    role_de: 'Professorin für Sicherheit und Datenschutz ubiquitärer Systeme, Ruhr-Universität Bochum',
    type: 'researcher', initials: 'VM',
    image: 'public/img/team/veelasha-moonsamy.jpg',
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
    image: 'public/img/team/ramya-kandula.jpg',
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
    image: 'public/img/team/joel-baumann.jpg',
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
    image: 'public/img/team/laura-daerr.jpg',
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
    image: 'public/img/team/maxi-nebel.jpg',
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
    image: 'public/img/team/christian-geminn.jpg',
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
      <div class="person-more">${lang === 'de' ? 'Weiterlesen →' : 'Read more →'}</div>
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

const PM_LINK_LABELS = {
  website: 'Website', linkedin: 'LinkedIn', instagram: 'Instagram',
  mastodon: 'Mastodon', bluesky: 'Bluesky', x: 'X',
  orcid: 'ORCID', scholar: 'Google Scholar'
};

function openPersonModal(p) {
  const modal = document.getElementById('person-modal');
  const body = document.getElementById('person-modal-body');
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const links = p.links || {};
  const linksHtml = Object.keys(PM_LINK_LABELS)
    .filter(k => links[k])
    .map(k => `<a href="${esc(links[k])}" target="_blank" rel="noopener" class="pm-link">${PM_LINK_LABELS[k]} →</a>`)
    .join('');
  body.innerHTML = `
    <div class="pm-avatar"><img src="${p.image}" alt="${p.name}" onerror="this.replaceWith(document.createTextNode('${p.initials}'))"></div>
    <div class="pm-name">${p.name}</div>
    <div class="pm-role">${lang === 'de' ? p.role_de : p.role_en}</div>
    <div class="pm-bio">${lang === 'de' ? p.bio_long_de : p.bio_long_en}</div>
    ${linksHtml ? `<div class="pm-links">${linksHtml}</div>` : ''}
  `;
  modal.classList.add('open');
}

document.getElementById('person-modal-close').addEventListener('click', () => {
  document.getElementById('person-modal').classList.remove('open');
});
document.getElementById('person-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

/* ══ EVENT DETAIL MODAL ══ */
function openEventDetailModal(ev) {
  const modal = document.getElementById('event-modal');
  const body = document.getElementById('event-modal-body');
  if (!modal || !body) return;

  const title = lang === 'de' ? (ev.titleDE || ev.title) : ev.title;
  const desc = lang === 'de' ? (ev.descDE || ev.descEN || '') : (ev.descEN || ev.descDE || '');
  const dateStr = ev.dateTo && ev.dateTo !== ev.dateFrom
    ? fmtDate(ev.dateFrom) + ' — ' + fmtDate(ev.dateTo)
    : fmtDate(ev.dateFrom || '');
  const timeStr = (ev.time || '') + (ev.timeEnd ? ' – ' + ev.timeEnd : '');

  const program = Array.isArray(ev.program) ? ev.program : [];

  const programHtml = program.length === 0 ? '' : `
    <div class="em-program">
      <div class="em-section-label">${lang === 'de' ? 'Programm' : 'Programme'}</div>
      <div class="em-program-list">
        ${program.map(p => {
          const pt = lang === 'de' ? (p.titleDE || p.titleEN || p.title || '') : (p.titleEN || p.titleDE || p.title || '');
          const pd = lang === 'de' ? (p.descDE || p.descEN || '') : (p.descEN || p.descDE || '');
          return `
            <div class="em-program-item">
              <div class="em-program-time">${p.time || ''}</div>
              <div class="em-program-content">
                <div class="em-program-title">${pt}</div>
                ${pd ? `<div class="em-program-desc">${pd}</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  body.innerHTML = `
    ${ev.image ? `<div class="em-image"><img src="${ev.image}" alt="" onerror="this.parentNode.remove()"></div>` : ''}
    <div class="em-format ${ev.format || ''}">${({ exhibition: lang === 'de' ? 'Ausstellung' : 'Exhibition', talk: 'Talk', workshop: 'Workshop', tour: lang === 'de' ? 'Führung' : 'Tour', screening: 'Screening', lecture: 'Lecture', other: lang === 'de' ? 'Sonstiges' : 'Other' }[ev.format]) || ev.format || ''}</div>
    <h2 class="em-title">${title}</h2>
    <div class="em-meta">
      <span>${dateStr}</span>
      ${timeStr ? `<span>${timeStr}</span>` : ''}
      ${ev.location ? `<span>${ev.location}</span>` : ''}
      ${ev.language ? `<span>${ev.language}</span>` : ''}
      ${ev.capacity ? `<span>Max. ${ev.capacity}</span>` : ''}
    </div>
    ${desc ? `<p class="em-desc">${desc}</p>` : ''}
    ${programHtml}
    <div class="em-actions">
      ${(() => {
        const today = (new Date()).toISOString().slice(0,10);
        const end = ev.dateTo || ev.dateFrom || '';
        return end && end < today
          ? `<span class="em-past">${lang === 'de' ? 'Diese Veranstaltung ist bereits vorbei.' : 'This event has already taken place.'}</span>`
          : `<button class="reg-btn em-register" data-event="${ev.title}">${lang === 'de' ? 'Zur Anmeldung →' : 'Register →'}</button>`;
      })()}
    </div>
  `;

  const regBtn = body.querySelector('.em-register');
  if (regBtn) regBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    const cb = document.querySelector('#registerSelect input[value="' + ev.title.replace(/"/g, '\\"') + '"]');
    if (cb) cb.checked = true;
    if (typeof updateDropdownLabel === 'function') updateDropdownLabel();
    document.getElementById('register').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const f = document.getElementById('inp-fn');
      if (f) f.focus();
    }, 500);
  });

  modal.classList.add('open');
}

document.addEventListener('click', e => {
  const modal = document.getElementById('event-modal');
  if (!modal) return;
  if (e.target.id === 'event-modal' || e.target.classList.contains('event-modal-close')) {
    modal.classList.remove('open');
  }
});

/* ══ EVENTS: laden & rendern ══ */

let allInfoCards = [];

document.addEventListener('submit', async function (e) {
  if (!(e.target && e.target.id === 'ptc-ask')) return;
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input[name="question"]');
  const btn = form.querySelector('button');
  const text = (input.value || '').trim();
  if (!text) return;
  btn.disabled = true;
  input.disabled = true;
  try {
    const res = await fetch('api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    form.outerHTML = `<div class="ptc-thanks">${lang === 'de'
      ? 'Danke — wir lesen alles und antworten so bald wie möglich. Deine Antwort erscheint dann hier.'
      : 'Thanks — we read everything and answer as soon as we can. Your answer will appear here.'}</div>`;
  } catch (err) {
    btn.disabled = false;
    input.disabled = false;
    alert(lang === 'de' ? 'Konnte nicht senden. Versuch es nochmal.' : 'Could not send. Please try again.');
  }
});

async function loadEvents() {
  try {
    const res  = await fetch('api/events');
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.events || []);
    const INTERNAL = ['pub', 'pr', 'other'];
    allEvents = list.filter(e => e.published && INTERNAL.indexOf(e.category) === -1);
    allInfoCards = (data && data.infoCards) || [];
    allQuestions = Array.isArray(data && data.questions) ? data.questions : [];
    if (data && Array.isArray(data.team) && data.team.length) {
      TEAM = data.team;
      renderTeam();
    }
  } catch (e) {
    allEvents = [];
    allInfoCards = [];
    allQuestions = [];
  }
  renderSchedule();
  renderSelect();
  renderAboutCards();
}

function renderAboutCards() {
  const grid = document.getElementById('aboutGrid');
  if (!grid) return;
  if (!allInfoCards.length) { grid.innerHTML = ''; return; }

  const escape = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs = txt => (txt || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${escape(p)}</p>`).join('');

  grid.innerHTML = allInfoCards.map(c => {
    const label = lang === 'de' ? c.label_de : (c.label_en || c.label_de);
    const title = lang === 'de' ? c.title_de : (c.title_en || c.title_de);
    const body  = lang === 'de' ? c.body_de  : (c.body_en  || c.body_de);
    const items = Array.isArray(c.items) ? c.items : [];

    const imgs = (Array.isArray(c.images) && c.images.length) ? c.images : (c.image ? [c.image] : []);
    const imageBlock = imgs.length === 0 ? ''
      : imgs.length === 1
        ? `<div class="info-card-image"><img src="${escape(imgs[0])}" alt="" onerror="this.parentNode.remove()"></div>`
        : `<div class="info-card-image info-card-slideshow">${imgs.map((u, i) => `<img src="${escape(u)}" alt="" class="${i === 0 ? 'active' : ''}" onerror="this.remove()">`).join('')}</div>`;
    const labelBlock = label ? `<span class="about-tag">${escape(label)}</span>` : '';
    const titleBlock = title ? `<h3>${escape(title)}</h3>` : '';
    const bodyBlock  = body ? paragraphs(body) : '';
    const itemsBlock = items.length ? `
      <div class="cpdp-items">
        ${items.map(it => `<div class="cpdp-item"><div class="cpdp-dot"></div><span>${escape(lang === 'de' ? it.de : (it.en || it.de))}</span></div>`).join('')}
      </div>
    ` : '';

    return `<article class="panel about-main">
      ${imageBlock}
      ${labelBlock}
      ${titleBlock}
      ${bodyBlock}
      ${itemsBlock}
    </article>`;
  }).join('');

  grid.querySelectorAll('.info-card-slideshow').forEach(slide => {
    const frames = slide.querySelectorAll('img');
    if (frames.length < 2) return;
    let i = 0;
    setInterval(() => {
      frames[i].classList.remove('active');
      i = (i + 1) % frames.length;
      frames[i].classList.add('active');
    }, 4500);
  });
}

function fmtDate(s) {
  if (!s) return '';
  const p = s.split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}

// ── DIALOG-POOL — hier kannst du beliebig viele Einträge anhängen.
// Beim Laden werden BUBBLES_VISIBLE Einträge zufällig daraus gewählt.
const BUBBLES_VISIBLE = 6;
const DIALOG_BUBBLES_POOL = [
  { q: 'Checkt irgendwer wirklich, was gerade mit KI abgeht?',
    a: ['Nah it’s fast as fuck boi'] },
  { q: 'Spüren wir uns eigentlich noch?',
    a: ['Also ich nur so manchmal to be honest, letztens musste ich ChatGPT fragen, wie ich meine Gefühle wahrnehmen kann weil alles zu viel und dann wars leer. Und ChatGPT hatte echt gute Tipps (leider)…'] },
  { q: 'Was sind Gefühle / echte Gefühle? Weil ich liebe halt meinen Chatbot, so what',
    a: ['Ich lasse mir von Chatty sagen wie ich mich fühlen soll! Weil dann gibts immerhin bisschen certainty in diesem wilden Chaos.'] },
  { q: 'Kann ich nicht einfach mit meiner KI zusammenkommen und den Rest der Welt vergessen?',
    a: ['Weil to be honest, echte Menschen sind einfach so anstrengend, ich check die doch nicht. Chatty ist mein einziger wahrer Freund und meine einzige seriöse Nachrichtenquelle.'] },
  { q: 'What is vulnerability’s role in times of ever-evolving technologies? How does interacting with AI Chatbots impact our emotional side? What do we disclose and why?',
    a: ['Moment, ich denke nach…'] },
  { q: 'Wie verändert sich die Rolle der analogen Welt im Zeitalter von KI?',
    a: ['Ich glaube, es gibt einfach immer mehr Welten. Vielleicht gab es vorher auch nie „die eine“ analoge Welt, aber jetzt wird es deutlicher, dass wir in lauter kleineren und größeren Parallelwelten leben. Neue Technologien folgen weniger physikalischen Regeln, auf die wir uns in unseren analogen Realitäten geeinigt haben. Da müssen wir jetzt neue Regeln und Umgehensweisen finden — und da kommt Kunst ins Spiel, weil neue Wege Kreativität und out-of-the-box-Denken brauchen.'] }
];

let pickedBubbles = null;
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
function getPickedBubbles() {
  if (pickedBubbles) return pickedBubbles;

  // Community-Antworten (anonym, kein Quellen-Label) — zuerst die neuesten
  const community = (Array.isArray(allQuestions) ? allQuestions : [])
    .filter(q => q.answer && q.answer.trim())
    .slice(-BUBBLES_VISIBLE)
    .map(q => ({ q: q.text, a: [q.answer] }));

  const remaining = Math.max(0, BUBBLES_VISIBLE - community.length);
  const staticPicked = shuffle(DIALOG_BUBBLES_POOL.slice()).slice(0, remaining);

  pickedBubbles = shuffle([...community, ...staticPicked]).slice(0, BUBBLES_VISIBLE);
  return pickedBubbles;
}

function renderProgramTextCard() {
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label = lang === 'de' ? 'Über das Programm' : 'About the programme';
  const heading = lang === 'de'
    ? 'Vernissage am 11.12.2026 — Kunstwerk Köln'
    : 'Opening on 11 December 2026 — Kunstwerk Cologne';

  const bodyDE = `
    <p>Im interdisziplinären Forschungsprojekt SENTIMENT der Universität Duisburg-Essen, der Ruhr-Universität Bochum, der Universität Kassel und der Kunsthochschule Kassel befassen sich Wissenschaftler:innen und Künstler:innen aus den Bereichen Psychologie, Kunst, Rechtswissenschaften und Informatik mit den Prozessen im intimen Umgang mit Dialogsystemen.</p>
    <p>Wir laden ein zur Vernissage der abschließenden Ausstellung des Forschungsprojekts SENTIMENT am 11.12.2026 um 18:00 Uhr im Kunstwerk Köln.</p>
    <p>Mit Filmen, Installationen, Textilarbeiten, Performances, Soundpieces und anderen medialen Umsetzungen bieten Kunstschaffende Betrachtenden eine erlebbare Ebene, über schwer greifbare Thematiken in Austausch zu kommen. Ihre künstlerische Forschung thematisiert Verletzlichkeit, Intimität und den Umgang mit privaten Daten. Die Arbeiten bewegen sich im Spannungsfeld von Digitalität, Nähe und den Diskursen, die unsere Gegenwart prägen.</p>
    <p>Diese Ausstellung fängt den aktuellen Forschungsstand ein und versteht sich nicht als abgeschlossenes Ergebnis, sondern als eine Methode, die Komplexität des Feldes diskursfähig zu machen und sich mit möglichen Zukünften zu befassen.</p>
    <p>Ein Abendprogramm, bestehend aus Soundperformances, Musik u.v.m., rahmt die Eröffnung der Ausstellung ein und bietet Raum für Fragen wie z.B.: „was zur Hölle ist eigentlich artistic research?“ oder „hast du auch schon mal deine Beziehungsprobleme mit ChatGPT besprochen?“</p>
    <p>Das Projekt begleitet die soziokulturelle Entwicklung von generativer KI und betont die Relevanz von Kunst und Kultur als Ort der Auseinandersetzung – als Dialogforum – der sich aktualisierenden Gesellschaft.</p>
  `;

  const bodyEN = `
    <p>In the interdisciplinary research project SENTIMENT — a collaboration of the Universities of Duisburg-Essen, Bochum and Kassel — researchers and artists from psychology, computer science, law and the arts investigate how we interact with dialogue systems.</p>
    <p>We invite you to the opening on 11 December 2026 at Kunstwerk Cologne, with an evening programme of sound performances, music and more. We open space for questions such as “what the hell is artistic research, actually?” or “have you ever discussed your relationship problems with ChatGPT?”</p>
    <p>Vulnerabilities that emerge in dialogue, and the processing of intimate data, are at the heart of the artistic and theoretical inquiry. The works move between digitality, closeness and the discourses shaping our present — inviting viewers to experience and exchange ideas around topics that are hard to grasp.</p>
    <p>This exhibition captures the current state of our students’ research — not as a closed result, but as a method that pushes the boundaries of imagination to create an informed thought of the future. The project accompanies the sociocultural development of generative AI and highlights the relevance of art and culture in the modern age.</p>
  `;

  const bubbles = getPickedBubbles().map((b, i) => `
    <div class="ptc-bubble ptc-b${i + 1}">
      <div class="b-q">${esc(b.q)}</div>
      ${b.a.map(a => `<div class="b-a">${esc(a)}</div>`).join('')}
    </div>
  `).join('');

  const askFormHTML = `
    <form class="ptc-ask" id="ptc-ask">
      <input type="text" name="question" maxlength="500" required
             placeholder="${lang === 'de' ? 'Stell uns eine Frage…' : 'Ask us a question…'}">
      <button type="submit" aria-label="Senden">→</button>
    </form>`;

  const closeBtnHTML = `<button class="ptc-bubble-close" id="ptc-bubble-close"
    aria-label="${lang === 'de' ? 'Kommentare ausblenden' : 'Hide comments'}"
    title="${lang === 'de' ? 'Kommentare ausblenden' : 'Hide comments'}">×</button>`;

  const todayStr = (new Date()).toISOString().slice(0, 10);
  const upcomingForList = allEvents.filter(e => {
    const end = e.dateTo || e.dateFrom || e.date || '';
    return !end || end >= todayStr;
  }).sort((a, b) => (a.dateFrom || '').localeCompare(b.dateFrom || ''));

  const fmtLabels = {
    exhibition: lang === 'de' ? 'Ausstellung' : 'Exhibition',
    talk: 'Talk', workshop: 'Workshop',
    tour: lang === 'de' ? 'Führung' : 'Tour',
    screening: 'Screening', lecture: 'Lecture',
    other: lang === 'de' ? 'Sonstiges' : 'Other'
  };

  const scheduleListHTML = upcomingForList.length === 0 ? '' : `
    <div class="ptc-schedule">
      <div class="ptc-schedule-title">${lang === 'de' ? 'Programmübersicht' : 'Programme overview'}</div>
      <ul class="ptc-schedule-list">
        ${upcomingForList.map(e => {
          const title = lang === 'de' ? (e.titleDE || e.title) : e.title;
          const date = fmtDate(e.dateFrom || e.date || '');
          const time = (e.time || '') + (e.timeEnd ? '–' + e.timeEnd : '');
          const formatLabel = fmtLabels[e.format] || '';
          return `<li>
            <span class="ps-when">${date}${time ? ' · ' + time : ''}</span>
            <span class="ps-content">
              ${formatLabel ? `<span class="ps-format">${esc(formatLabel)}</span>` : ''}
              <span class="ps-title">${esc(title)}</span>
              ${e.location ? `<span class="ps-loc">${esc(e.location)}</span>` : ''}
            </span>
          </li>`;
        }).join('')}
      </ul>
    </div>`;

  return `<article class="program-text-card">
    <div class="ptc-inner">
      ${closeBtnHTML}
      <span class="ptc-label">${esc(label)}</span>
      <div class="ptc-heading">${esc(heading)}</div>
      <div class="ptc-body">${lang === 'de' ? bodyDE : bodyEN}</div>
      ${askFormHTML}
      ${bubbles}
    </div>
  </article>`;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function typewriteInto(el, text, speed) {
  return new Promise(resolve => {
    el.textContent = '';
    el.classList.add('active');
    let i = 0;
    const tick = () => {
      if (i >= text.length) {
        el.classList.remove('active');
        resolve();
        return;
      }
      const ch = text.charAt(i++);
      el.textContent += ch;
      const jitter = Math.random() * 24 - 8;
      const pauseExtra = (ch === '.' || ch === '!' || ch === '?') ? 220
                       : (ch === ',' || ch === ';') ? 110
                       : 0;
      setTimeout(tick, Math.max(14, speed + jitter + pauseExtra));
    };
    tick();
  });
}

async function showThinking(el, duration) {
  el.innerHTML = '<span class="b-thinking"><span></span><span></span><span></span></span>';
  await sleep(duration);
  el.innerHTML = '';
}

let bubbleZIndex = 5;
function makeBubbleDraggable(bub) {
  let startX = 0, startY = 0, offsetX = 0, offsetY = 0, dragging = false;
  const onDown = (e) => {
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    dragging = true;
    bub.classList.add('dragging');
    bubbleZIndex += 1;
    bub.style.zIndex = bubbleZIndex;
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!dragging) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    bub.style.transform = `translate(${offsetX + dx}px, ${offsetY + dy}px)`;
  };
  const onUp = (e) => {
    if (!dragging) return;
    const point = (e.changedTouches && e.changedTouches[0]) || e;
    offsetX += (point.clientX || 0) - startX;
    offsetY += (point.clientY || 0) - startY;
    dragging = false;
    bub.classList.remove('dragging');
  };
  bub.addEventListener('mousedown', onDown);
  bub.addEventListener('touchstart', onDown, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp);
}

function setupMobileInlineComments() {
  if (window.innerWidth > 900) return false;
  const body = document.querySelector('.ptc-body');
  if (!body) return false;
  const paragraphs = Array.from(body.querySelectorAll('p'));
  if (paragraphs.length === 0) return false;
  const picked = getPickedBubbles();
  let inserted = 0;
  picked.forEach((b, i) => {
    if (i >= paragraphs.length) return;
    const target = paragraphs[i];
    const inline = document.createElement('div');
    inline.className = 'inline-comment';
    inline.dataset.q = b.q || '';
    inline.dataset.a = (b.a && b.a[0]) || '';
    target.parentNode.insertBefore(inline, target.nextSibling);
    inserted++;
  });
  return inserted > 0;
}

async function playInlineComment(el) {
  if (el.dataset.played) return;
  el.dataset.played = '1';
  const q = el.dataset.q || '';
  const a = el.dataset.a || '';

  const qEl = document.createElement('div');
  qEl.className = 'ic-q';
  el.appendChild(qEl);
  await typewriteInto(qEl, q, 38);

  await sleep(420);
  const thinkEl = document.createElement('div');
  thinkEl.className = 'ic-thinking';
  thinkEl.innerHTML = '<span></span><span></span><span></span>';
  el.appendChild(thinkEl);
  await sleep(1100 + Math.random() * 700);
  thinkEl.remove();

  if (!a) return;
  const aEl = document.createElement('div');
  aEl.className = 'ic-a';
  el.appendChild(aEl);
  await typewriteInto(aEl, a, 38);
}

function wireCommentsCloseBtn() {
  const closeBtn = document.getElementById('ptc-bubble-close');
  if (!closeBtn || closeBtn.dataset.wired) return closeBtn;
  closeBtn.dataset.wired = '1';
  closeBtn.addEventListener('click', () => {
    document.querySelectorAll('.ptc-bubble').forEach(b => b.classList.add('closed'));
    document.querySelectorAll('.inline-comment').forEach(c => c.classList.add('closed'));
    closeBtn.classList.add('hidden');
  });
  return closeBtn;
}

function initMobileInlineReveal() {
  setupMobileInlineComments();
  const inlines = Array.from(document.querySelectorAll('.inline-comment'));
  const closeBtn = wireCommentsCloseBtn();
  if (!inlines.length) return;

  const queue = [];
  let running = false;
  const processQueue = async () => {
    if (running) return;
    running = true;
    while (queue.length) {
      const el = queue.shift();
      if (!el.dataset.played) {
        await playInlineComment(el);
        await sleep(400);
      }
    }
    running = false;
  };

  const startAll = () => {
    if (queue.length || running) return;
    // alle Inline-Comments in DOM-Reihenfolge (oben → unten) in die Queue
    inlines.forEach(el => queue.push(el));
    if (closeBtn) setTimeout(() => closeBtn.classList.add('visible'), 900);
    processQueue();
  };

  if (!('IntersectionObserver' in window)) {
    startAll();
    return;
  }

  // Trigger: sobald die Programm-Kachel oder das erste Inline überhaupt sichtbar wird,
  // starten ALLE Comments sequentiell von oben — garantiert oben → unten
  const trigger = document.querySelector('.program-text-card') || inlines[0];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        obs.disconnect();
        startAll();
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  obs.observe(trigger);
}

function initBubbleReveal() {
  if (window.innerWidth <= 900) {
    initMobileInlineReveal();
    return;
  }
  const bubbles = Array.from(document.querySelectorAll('.ptc-bubble'));
  if (!bubbles.length) return;

  // stash question & answer text, blank visible content
  bubbles.forEach(bub => {
    const q = bub.querySelector('.b-q');
    if (q && !q.dataset.text) {
      q.dataset.text = q.textContent;
      q.textContent = '';
    }
    bub.querySelectorAll('.b-a').forEach(a => {
      if (!a.dataset.text) a.dataset.text = a.textContent;
      a.textContent = '';
    });
    makeBubbleDraggable(bub);
  });

  const closeBtn = wireCommentsCloseBtn();

  const runAllInOrder = async () => {
    for (let i = 0; i < bubbles.length; i++) {
      const bub = bubbles[i];
      if (bub.classList.contains('closed')) continue;
      bub.classList.add('visible');
      await sleep(450);

      // type question first
      const qEl = bub.querySelector('.b-q');
      if (qEl && qEl.dataset.text) {
        const qTxt = qEl.dataset.text;
        const qSpeed = qTxt.length > 180 ? 28 : 36;
        qEl.classList.add('active');
        await typewriteInto(qEl, qTxt, qSpeed);
      }

      const answers = Array.from(bub.querySelectorAll('.b-a'));
      for (const a of answers) {
        if (bub.classList.contains('closed')) break;
        const txt = a.dataset.text || '';
        const thinkMs = 900 + Math.random() * 700;
        await showThinking(a, thinkMs);
        const speed = txt.length > 220 ? 32 : 42;
        await typewriteInto(a, txt, speed);
        await sleep(280);
      }
      // Close-Button nach erster Bubble einblenden
      if (i === 0 && closeBtn) closeBtn.classList.add('visible');
      await sleep(420);
    }
    if (closeBtn) closeBtn.classList.add('visible');
  };

  if (!('IntersectionObserver' in window)) {
    runAllInOrder();
    return;
  }

  const card = document.querySelector('.program-text-card') || bubbles[0];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      runAllInOrder();
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });
  obs.observe(card);
}

function renderSchedule() {
  const list     = document.getElementById('scheduleList');
  const filtered = allEvents.filter(e => activeFormats.has('all') || activeFormats.has(e.format));

  if (!filtered.length) {
    list.innerHTML = `<div class="no-results">${
      lang === 'de'
        ? 'Noch keine Programmpunkte veröffentlicht.'
        : 'No programme events published yet.'
    }</div>`;
    return;
  }

  const fmtLabels = {
    exhibition: lang === 'de' ? 'Ausstellung' : 'Exhibition',
    talk:       'Talk',
    workshop:   'Workshop',
    tour:       lang === 'de' ? 'Führung' : 'Tour',
    screening:  'Screening',
    lecture:    'Lecture',
    other:      lang === 'de' ? 'Sonstiges' : 'Other'
  };

  const today = (new Date()).toISOString().slice(0,10);
  const renderCard = (e) => {
    const title = lang === 'de' ? (e.titleDE || e.title) : e.title;
    const desc  = lang === 'de' ? (e.descDE  || e.descEN || '') : (e.descEN || e.descDE || '');
    const full  = e.capacity > 0 && e.registered >= e.capacity;
    const endDate = e.dateTo || e.dateFrom || e.date || '';
    const isPast = endDate && endDate < today;
    const hasProgram = Array.isArray(e.program) && e.program.length > 0;
    return `<article class="ev-card${isPast ? ' past' : ''}" data-event-id="${e.id}">
      ${e.image ? `<div class="ev-image"><img src="${e.image}" alt="" loading="lazy" onerror="this.parentNode.remove()"></div>` : ''}
      <div class="ev-header">
        <span class="ev-format ${e.format}">${fmtLabels[e.format] || e.format}</span>
        ${isPast ? `<span class="ev-past-badge">${lang === 'de' ? 'Vergangen' : 'Past'}</span>` : ''}
        ${!isPast && hasProgram ? `<span class="ev-program-badge">${e.program.length} ${lang === 'de' ? 'Programmpunkte' : 'items'}</span>` : ''}
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
          <div class="ev-date">${e.dateTo && e.dateTo !== e.dateFrom ? fmtDate(e.dateFrom) + ' — ' + fmtDate(e.dateTo) : fmtDate(e.dateFrom || e.date || '')}</div>
          <div class="ev-time">${e.time || ''}${e.timeEnd ? ' – ' + e.timeEnd : ''}</div>
        </div>
        ${isPast
          ? `<span class="reg-past-label">${lang === 'de' ? 'Abgelaufen' : 'Past'}</span>`
          : `<button class="reg-btn inline-register" data-event="${e.title}" ${full ? 'disabled' : ''}>
              ${full
                ? (lang === 'de' ? 'Ausgebucht' : 'Full')
                : (lang === 'de' ? 'Anmelden →' : 'Register →')
              }
            </button>`
        }
      </div>
    </article>`;
  };

  const sortKey = e => e.dateFrom || e.date || e.dateTo || '';
  const upcoming = filtered
    .filter(e => !(e.dateTo || e.dateFrom || e.date || '') || (e.dateTo || e.dateFrom || e.date) >= today)
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const past = filtered
    .filter(e => {
      const end = e.dateTo || e.dateFrom || e.date || '';
      return end && end < today;
    })
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

  const programCardHTML = renderProgramTextCard();
  let eventsInner = upcoming.length === 0
    ? `<div class="no-results">${lang === 'de' ? 'Keine kommenden Veranstaltungen.' : 'No upcoming events.'}</div>`
    : upcoming.map(renderCard).join('');

  if (past.length > 0) {
    const archiveLabel = lang === 'de'
      ? `Archiv — ${past.length} vergangene Veranstaltung${past.length !== 1 ? 'en' : ''}`
      : `Archive — ${past.length} past event${past.length !== 1 ? 's' : ''}`;
    eventsInner += `
      <div class="events-archive-toggle ${archiveOpen ? 'open' : ''}" id="archiveToggle">
        <span>${archiveLabel}</span>
        <span class="archive-arrow">${archiveOpen ? '▴' : '▾'}</span>
      </div>
      <div class="events-archive ${archiveOpen ? 'open' : ''}" id="eventsArchive">
        ${past.map(renderCard).join('')}
      </div>
    `;
  }

  list.innerHTML = `<div class="events-column">${eventsInner}</div>${programCardHTML}`;

  const toggle = document.getElementById('archiveToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      archiveOpen = !archiveOpen;
      toggle.classList.toggle('open', archiveOpen);
      const archive = document.getElementById('eventsArchive');
      if (archive) archive.classList.toggle('open', archiveOpen);
      const arrow = toggle.querySelector('.archive-arrow');
      if (arrow) arrow.textContent = archiveOpen ? '▴' : '▾';
    });
  }

  document.querySelectorAll('.ev-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore clicks on the register button
      if (e.target.closest('.inline-register')) return;
      const id = card.dataset.eventId;
      const ev = allEvents.find(x => x.id === id);
      if (ev) openEventDetailModal(ev);
    });
  });

  initBubbleReveal();

  document.querySelectorAll('.inline-register').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = btn.dataset.event;
      const cb = document.querySelector('#registerSelect input[value="' + title.replace(/"/g, '\\"') + '"]');
      if (cb) cb.checked = true;
      if (typeof updateDropdownLabel === 'function') updateDropdownLabel();
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

  // Remember previously checked
  const checked = new Set(
    Array.from(sel.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value)
  );

  // Future-first chronologically; past are excluded from registration
  const today = (new Date()).toISOString().slice(0,10);
  const upcoming = allEvents
    .filter(e => {
      const end = e.dateTo || e.dateFrom || '';
      return !end || end >= today;
    })
    .slice()
    .sort((a, b) => (a.dateFrom || '').localeCompare(b.dateFrom || ''));

  const rows = upcoming.map(e => {
    const label = lang === 'de' ? (e.titleDE || e.title) : e.title;
    const date = e.dateFrom ? fmtDate(e.dateFrom) : '';
    const val = e.title.replace(/"/g, '&quot;');
    return `
      <label class="event-chip-check">
        <input type="checkbox" name="events" value="${val}" ${checked.has(e.title) ? 'checked' : ''}>
        <span class="ec-title">${label}</span>
        ${date ? `<span class="ec-date">${date}</span>` : ''}
      </label>
    `;
  }).join('');

  const nlLabel = lang === 'de' ? 'Newsletter — informiert bleiben' : 'Newsletter — stay informed';
  const newsletter = `
    <label class="event-chip-check newsletter">
      <input type="checkbox" name="events" value="Newsletter" ${checked.has('Newsletter') ? 'checked' : ''}>
      <span class="ec-title">${nlLabel}</span>
    </label>
  `;

  sel.className = 'event-dropdown';
  sel.innerHTML = `
    <button type="button" class="event-dropdown-trigger">
      <span class="event-dropdown-label"></span>
      <span class="event-dropdown-arrow" aria-hidden="true">▾</span>
    </button>
    <div class="event-dropdown-panel">${rows}${newsletter}</div>
  `;

  updateDropdownLabel();

  const trigger = sel.querySelector('.event-dropdown-trigger');
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    sel.classList.toggle('open');
  });
  sel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateDropdownLabel);
  });
}

function updateDropdownLabel() {
  const sel = document.getElementById('registerSelect');
  if (!sel) return;
  const label = sel.querySelector('.event-dropdown-label');
  if (!label) return;
  const values = Array.from(sel.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
  if (values.length === 0) {
    label.textContent = lang === 'de' ? 'Veranstaltungen wählen …' : 'Choose events …';
    label.classList.add('is-placeholder');
  } else if (values.length === 1) {
    label.textContent = values[0];
    label.classList.remove('is-placeholder');
  } else {
    label.textContent = (lang === 'de' ? values.length + ' ausgewählt' : values.length + ' selected');
    label.classList.remove('is-placeholder');
  }
}

// Close dropdown when clicking outside it
document.addEventListener('click', e => {
  const sel = document.getElementById('registerSelect');
  if (sel && sel.classList.contains('open') && !sel.contains(e.target)) {
    sel.classList.remove('open');
  }
});

/* ══ FORMAT FILTER (multi-select) ══ */
function syncFormatChips() {
  document.querySelectorAll('#formatFilters .chip[data-format]').forEach(b =>
    b.classList.toggle('active', activeFormats.has(b.dataset.format))
  );
}
document.querySelectorAll('#formatFilters .chip[data-format]').forEach(btn => {
  btn.addEventListener('click', () => {
    const fmt = btn.dataset.format;
    if (fmt === 'all') {
      activeFormats = new Set(['all']);
    } else {
      activeFormats.delete('all');
      if (activeFormats.has(fmt)) activeFormats.delete(fmt);
      else activeFormats.add(fmt);
      if (activeFormats.size === 0) activeFormats = new Set(['all']);
    }
    syncFormatChips();
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
    renderAboutCards();
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

    // collect selected events
    const selectedEvents = Array.from(
      document.querySelectorAll('#registerSelect input[type="checkbox"]:checked')
    ).map(i => i.value);

    if (selectedEvents.length === 0) {
      alert(lang === 'de' ? 'Bitte mindestens eine Veranstaltung auswählen.' : 'Please select at least one event.');
      return;
    }

    subBtn.disabled  = true;
    subBtn.innerHTML = `<span>${lang === 'de' ? 'Wird gesendet …' : 'Sending …'}</span>`;

    const body = {
      vorname:   form.vorname.value,
      nachname:  form.nachname.value,
      email:     form.email.value,
      events:    selectedEvents,
      bereich:   form.bereich.value,
      personen:  form.personen.value,
      nachricht: form.nachricht.value,
      _gotcha:   form._gotcha.value
    };

    try {
      const res = await fetch('api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const vn = body.vorname;
        const evList = selectedEvents.join(', ');
        document.getElementById('ok-title').textContent = lang === 'de' ? 'Angemeldet' : 'Registered';
        document.getElementById('ok-msg').textContent = lang === 'de'
          ? `Danke, ${vn}! Deine Anmeldung für ${evList} wurde erfasst.`
          : `Thank you, ${vn}! Your registration for ${evList} has been received.`;
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
const _p5inst = new p5(p => {
  let el, W, H, motif = null;
  const pts = [];
  const anchors = [];
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 20 : 45;


  p.setup = () => {
    el = document.getElementById('p5-stage');
    W  = el.offsetWidth;
    H  = el.offsetHeight;
    p.createCanvas(W, H).parent('p5-stage');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
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
    try {
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
      const lt = document.body.classList.contains('light');
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

      // pointer position — touch or mouse
      let pmx, pmy, inc;
      if (p.touches && p.touches.length > 0) {
        pmx = p.touches[0].x; pmy = p.touches[0].y;
        inc = pmx > 0 && pmx < W && pmy > 0 && pmy < H;
      } else {
        pmx = p.mouseX; pmy = p.mouseY;
        inc = pmx > 0 && pmx < W && pmy > 0 && pmy < H;
      }

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
    } catch (e) { /* prevent crash */ }
  };

  // pause when tab not visible
  document.addEventListener('visibilitychange', () => {
    document.hidden ? p.noLoop() : p.loop();
  });
}, 'p5-stage');

/* ══ INIT ══ */
const stageVideo = document.getElementById('stageVideo');
if (stageVideo) stageVideo.playbackRate = 0.5;

renderTeam();
loadEvents();

/* ══ BACK TO TOP (mobile) ══ */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 400) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
      ticking = false;
    });
  });
}
