/* ── SENTIMENT Admin ── */
(function () {
  'use strict';

  var PASSWORD = 'sentiment2026';
  var API = '../api/events';
  var INTERNAL_CATS = ['pub', 'pr', 'other'];

  var data = { events: [], tasks: [], infoCards: [], team: [] };
  var currentMonth = new Date();
  var editingEventId = null;
  var editingTaskId = null;
  var editingCardId = null;
  var editingPersonId = null;
  var taskFilterCat = 'all';
  var taskFilterPerson = 'all';
  var taskFilterEvent = 'all';
  var lastTaskChange = null;
  var undoTimer = null;
  var completedSectionOpen = false;

  /* ────── DEFAULT INFO CARDS (seeded once if empty) ────── */
  function defaultInfoCards() {
    return [
      {
        id: 'card-about',
        label_de: 'Forschungs- und Kunstprojekt',
        label_en: 'Research & Art Project',
        title_de: 'Intime Kommunikation mit Chatbots — zwischen Nähe, Vertrauen und Verantwortung',
        title_en: 'Intimate Communication with Chatbots — between Closeness, Trust, and Responsibility',
        body_de: 'Was passiert, wenn Menschen beginnen, Maschinen zu vertrauen — oder sich ihnen anzuvertrauen? In einer Zeit, in der KI immer öfter unser vertrautester Gesprächspartner wird, werden diese Begegnungen zur gesellschaftlichen Dringlichkeit.\n\nDas vom BMFTR geförderte Projekt SENTIMENT untersucht intime Kommunikation mit KI-basierten Chatbots an der Schnittstelle von Psychologie, Informatik, Rechtswissenschaft und künstlerischer Forschung. Installative, performative und diskursive Formate machen zentrale Fragen um dieses Thema erfahrbar.\n\nSENTIMENT navigiert die Grenzen zwischen Verbindung und Berechnung: Warum vertrauen sich Menschen KI an und wie kann Intimität gestaltet werden, ohne Autonomie zu gefährden?',
        body_en: 'What happens when people begin to trust machines — or confide in them? At a time when AI is increasingly becoming our most trusted conversation partner, these encounters have become a matter of urgent social concern.\n\nFunded by the BMFTR, SENTIMENT examines intimate communication with AI-based chatbots at the intersection of psychology, computer science, law, and artistic research. Installation, performance, and discursive formats make the central questions around this topic tangible.\n\nSENTIMENT navigates the boundaries between connection and calculus: asking not only why people confide in AI but how intimacy can be designed without compromising autonomy.',
        image: '',
        items: []
      },
      {
        id: 'card-cpdp',
        label_de: 'CPDP 2026 · Brüssel',
        label_en: 'CPDP 2026 · Brussels',
        title_de: 'SENTIMENT bei den Computers, Privacy & Data Protection 2026',
        title_en: 'SENTIMENT at Computers, Privacy & Data Protection 2026',
        body_de: '',
        body_en: '',
        image: '',
        items: [
          { de: 'Panel im Engineering Privacy Track — SENTIMENT Partnerinstitutionen', en: 'Panel in the Engineering Privacy Track — SENTIMENT partner institutions' },
          { de: 'Programmslot im Culture Club — SENTIMENT Arts (75 Min.)', en: 'Programme slot in the Culture Club — SENTIMENT Arts (75 min.)' },
          { de: 'Radio Avatar.fm', en: 'Radio Avatar.fm' },
          { de: 'Pop-up-Ausstellung SENTIMENT im CPDP-Konferenzgebäude', en: 'Pop-up exhibition SENTIMENT in the CPDP conference building' }
        ]
      }
    ];
  }

  /* ────── DEFAULT TEAM (seeded once if empty) ────── */
  function defaultTeam() {
    return [
      { id:'jessica-szczuka', name:'Dr. Jessica Szczuka', type:'researcher', initials:'JS',
        role_en:'Head of Junior Research Group INTITEC, University of Duisburg-Essen',
        role_de:'Leiterin der Nachwuchsforschungsgruppe INTITEC, Universität Duisburg-Essen',
        image:'public/img/team/jessica-szczuka.jpg',
        bio_short_en:'Dr. Szczuka leads the INTITEC research group at the University of Duisburg-Essen, investigating digitized intimacy through media, social, and communication psychology combined with Human-Computer Interaction.',
        bio_short_de:'Dr. Szczuka leitet die Forschungsgruppe INTITEC an der Universität Duisburg-Essen und untersucht digitale Intimität aus Perspektive der Medien-, Sozial- und Kommunikationspsychologie sowie der Mensch-Computer-Interaktion.',
        bio_long_en:'Dr. Jessica Szczuka is the head of the Junior Research Group INTITEC (Intimacy with and through Technologies) at the University of Duisburg-Essen. Her research integrates media, social, and communication psychology with Human-Computer Interaction to explore the impact of digitalisation on concepts of love and sexuality. She earned her PhD in Social Psychology at the University of Duisburg-Essen. Her research addresses two core directions: what makes humans unique in interaction with machines, and what ethical frameworks are needed for the responsible development of digital intimacy technologies.',
        bio_long_de:'Dr. Jessica Szczuka leitet die Nachwuchsforschungsgruppe INTITEC (Intimität mit und durch Technologien) an der Universität Duisburg-Essen. Ihre Forschung verbindet Medien-, Sozial- und Kommunikationspsychologie mit Human-Computer Interaction, um die Auswirkungen der Digitalisierung auf Konzepte von Liebe und Sexualität zu untersuchen. Sie promovierte in Sozialpsychologie an der Universität Duisburg-Essen. Ihre Forschung verfolgt zwei Kernrichtungen: Was macht Menschen in der Interaktion mit Maschinen einzigartig, und welche ethischen Rahmenbedingungen werden für die verantwortungsvolle Entwicklung digitaler Intimitätstechnologien benötigt?' },
      { id:'lisa-muehl', name:'M.Sc. Lisa Mühl', type:'researcher', initials:'LM',
        role_en:'Research Associate & PhD Candidate, University of Duisburg-Essen',
        role_de:'Wissenschaftliche Mitarbeiterin & Doktorandin, Universität Duisburg-Essen',
        image:'public/img/team/lisa-muehl.jpg',
        bio_short_en:'Lisa Mühl is a research associate in SENTIMENT and PhD candidate in the INTITEC group, researching intimate communication with natural language dialogue systems and self-disclosure behaviour.',
        bio_short_de:'Lisa Mühl ist wissenschaftliche Mitarbeiterin im SENTIMENT-Projekt und Doktorandin in der INTITEC-Gruppe. Sie erforscht intime Kommunikation mit natürlichsprachlichen Dialogsystemen und Selbstoffenbarungsverhalten.',
        bio_long_en:'Lisa Mühl is a research associate in the SENTIMENT project and a PhD candidate in the INTITEC junior research group at the University of Duisburg-Essen. She holds degrees in Media and Business Psychology and Applied Cognitive and Media Science. Her doctoral research investigates intimate communication with natural language dialogue systems, focusing on self-disclosure across text and voice modalities and how interaction patterns evolve over time.',
        bio_long_de:'Lisa Mühl ist wissenschaftliche Mitarbeiterin im SENTIMENT-Projekt und Doktorandin in der Nachwuchsforschungsgruppe INTITEC der Universität Duisburg-Essen. Sie hat Abschlüsse in Medien- und Wirtschaftspsychologie sowie in Angewandter Kognitions- und Medienwissenschaft. Ihre Doktorarbeit untersucht intime Kommunikation mit natürlichsprachlichen Dialogsystemen, mit Fokus auf Selbstoffenbarung in Text- und Sprachmodalitäten und die Entwicklung von Interaktionsmustern über die Zeit.' },
      { id:'veelasha-moonsamy', name:'Prof. Dr. Veelasha Moonsamy', type:'researcher', initials:'VM',
        role_en:'Professor for Security and Privacy of Ubiquitous Systems, Ruhr University Bochum',
        role_de:'Professorin für Sicherheit und Datenschutz ubiquitärer Systeme, Ruhr-Universität Bochum',
        image:'public/img/team/veelasha-moonsamy.jpg',
        bio_short_en:'Prof. Moonsamy leads the Chair for Security and Privacy of Ubiquitous Systems at Ruhr University Bochum and is a Principal Investigator in the Excellence Cluster CASA.',
        bio_short_de:'Prof. Moonsamy leitet den Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme an der Ruhr-Universität Bochum und ist Principal Investigator im Exzellenzcluster CASA.',
        bio_long_en:'Prof. Dr. Veelasha Moonsamy is a Professor in the Faculty of Computer Science at Ruhr University Bochum, where she leads the Chair for Security and Privacy of Ubiquitous Systems. She is a member of the Horst Görtz Institute for IT Security and a Principal Investigator in the Excellence Cluster CASA. Her research covers IoT, mobile and embedded systems, data privacy, and machine learning applications for security. She is the recipient of a Google Faculty Award and Meta Research Award.',
        bio_long_de:'Prof. Dr. Veelasha Moonsamy ist Professorin an der Fakultät für Informatik der Ruhr-Universität Bochum, wo sie den Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme leitet. Sie ist Mitglied des Horst-Görtz-Instituts für IT-Sicherheit und Principal Investigator im Exzellenzcluster CASA. Ihre Forschung umfasst IoT-, Mobile- und Embedded-Systeme, Datenschutz sowie maschinelles Lernen für Sicherheitsanwendungen. Sie ist Trägerin des Google Faculty Award und des Meta Research Award.' },
      { id:'ramya-kandula', name:'M.Sc. Ramya Kandula', type:'researcher', initials:'RK',
        role_en:'PhD Student, Chair for Security and Privacy of Ubiquitous Systems, Ruhr University Bochum',
        role_de:'Doktorandin, Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme, Ruhr-Universität Bochum',
        image:'public/img/team/ramya-kandula.jpg',
        bio_short_en:'Ramya Kandula is a PhD student at Ruhr University Bochum researching self-disclosure in human-chatbot interactions using privacy-by-design mechanisms and HCI methods.',
        bio_short_de:'Ramya Kandula ist Doktorandin an der Ruhr-Universität Bochum und erforscht Selbstoffenbarung in Mensch-Chatbot-Interaktionen mit Methoden aus Privacy-by-Design und HCI.',
        bio_long_en:'Ramya Kandula is a PhD student at the Chair for Security and Privacy of Ubiquitous Systems at Ruhr University Bochum. She holds a Master\'s degree in Interactive Media Technologies from KTH Royal Institute of Technology. In SENTIMENT, she explores self-disclosure tendencies in human-chatbot interactions through privacy and user-centric lenses, combining computational and psychological approaches to develop secure self-disclosure strategies.',
        bio_long_de:'Ramya Kandula ist Doktorandin am Lehrstuhl für Sicherheit und Datenschutz ubiquitärer Systeme der Ruhr-Universität Bochum. Sie hat einen Master in Interactive Media Technologies vom KTH Royal Institute of Technology. Im SENTIMENT-Projekt untersucht sie Selbstoffenbarungstendenzen in Mensch-Chatbot-Interaktionen aus Datenschutz- und nutzerzentrierter Perspektive, um sichere Strategien zur Selbstoffenbarung zu entwickeln.' },
      { id:'joel-baumann', name:'Prof. Joel Baumann', type:'artist', initials:'JB',
        role_en:'Professor of New Media, Kunsthochschule Kassel',
        role_de:'Professor für Neue Medien, Kunsthochschule Kassel',
        image:'public/img/team/joel-baumann.jpg',
        bio_short_en:'Prof. Baumann examines self-disclosure in human-machine interaction from a critical-artistic perspective, using exhibition formats as dialogical spaces that make scientific knowledge sensually accessible.',
        bio_short_de:'Prof. Baumann untersucht Selbstoffenbarung in der Mensch-Maschine-Interaktion aus kritisch-künstlerischer Perspektive und nutzt Ausstellungsformate als dialogische Räume, die wissenschaftliches Wissen sinnlich zugänglich machen.',
        bio_long_en:'Prof. Joel Baumann is Professor of New Media at the Kunsthochschule Kassel. In SENTIMENT, he examines processes of self-disclosure in human-machine interaction from a critical-artistic perspective, focusing on the societal and ethical implications of digital intimacy. His curatorial practice employs exhibition formats as dialogical spaces in which scientific knowledge becomes sensually and emotionally accessible, bridging technology, ethics, and aesthetics.',
        bio_long_de:'Prof. Joel Baumann ist Professor für Neue Medien an der Kunsthochschule Kassel. Im SENTIMENT-Projekt untersucht er Prozesse der Selbstoffenbarung in der Mensch-Maschine-Interaktion aus kritisch-künstlerischer Perspektive, mit Fokus auf gesellschaftliche und ethische Implikationen digitaler Intimität. Seine kuratorische Praxis nutzt Ausstellungsformate als dialogische Räume, in denen wissenschaftliches Wissen sinnlich und emotional zugänglich wird und Technologie, Ethik und Ästhetik verbindet.' },
      { id:'laura-daerr', name:'Laura Därr', type:'artist', initials:'LD',
        role_en:'Artistic Research Associate in New Media, Kunsthochschule Kassel',
        role_de:'Künstlerische Mitarbeiterin Neue Medien, Kunsthochschule Kassel',
        image:'public/img/team/laura-daerr.jpg',
        bio_short_en:'Laura Därr\'s artistic research focuses on algorithmic intervention in AI-based systems, employing critical making methodologies to interrogate the sociopolitical implications of automated decision-making.',
        bio_short_de:'Laura Därrs künstlerische Forschung konzentriert sich auf algorithmische Intervention in KI-basierten Systemen und nutzt Critical-Making-Methoden, um die gesellschaftspolitischen Implikationen automatisierter Entscheidungsprozesse zu hinterfragen.',
        bio_long_en:'Laura Därr is an artistic research associate in New Media at Kunsthochschule Kassel and a member of the SENTIMENT project. Her artistic research focuses on algorithmic intervention in AI-based systems that autonomously structure and influence human interaction patterns. Her practice employs critical making methodologies to interrogate the sociopolitical implications of automated decision-making, developing experimental frameworks that expose the hidden logics embedded within computational systems.',
        bio_long_de:'Laura Därr ist künstlerische Mitarbeiterin für Neue Medien an der Kunsthochschule Kassel und Mitglied des SENTIMENT-Projekts. Ihre künstlerische Forschung konzentriert sich auf algorithmische Intervention in KI-basierte Systeme, die menschliche Interaktionsmuster autonom strukturieren und beeinflussen. Ihre Praxis setzt Critical-Making-Methoden ein, um die gesellschaftspolitischen Implikationen automatisierter Entscheidungsprozesse zu hinterfragen und experimentelle Frameworks zu entwickeln, die die verborgenen Logiken computationaler Systeme freilegen.' },
      { id:'maxi-nebel', name:'Dr. Maxi Nebel', type:'researcher', initials:'MN',
        role_en:'Researcher, Research Center for Information Systems Design (ITeG), University of Kassel',
        role_de:'Wissenschaftlerin, Forschungszentrum für Informationssystemgestaltung (ITeG), Universität Kassel',
        image:'public/img/team/maxi-nebel.jpg',
        bio_short_en:'Dr. Nebel researches data protection law, technology law, and artificial intelligence at the University of Kassel\'s ITeG research center, with extensive experience in interdisciplinary research projects.',
        bio_short_de:'Dr. Nebel forscht am ITeG der Universität Kassel zu Datenschutzrecht, Technologierecht und Künstlicher Intelligenz und verfügt über langjährige Erfahrung in interdisziplinären Forschungsprojekten.',
        bio_long_en:'Dr. Maxi Nebel is a researcher at the Research Center for Information Systems Design (ITeG) at the University of Kassel. She completed her PhD on privacy protection in social networks. With many years of experience in interdisciplinary research, she conducts research on data protection law, technology law, and artificial intelligence, and is the author of numerous publications.',
        bio_long_de:'Dr. Maxi Nebel ist Wissenschaftlerin am Forschungszentrum für Informationssystemgestaltung (ITeG) der Universität Kassel. Sie promovierte zum Thema Datenschutz in sozialen Netzwerken. Mit langjähriger Erfahrung in interdisziplinären Forschungsprojekten forscht sie zu Datenschutzrecht, Technologierecht und Künstlicher Intelligenz und ist Autorin zahlreicher Publikationen.' },
      { id:'christian-geminn', name:'PD Dr. Christian Geminn', type:'researcher', initials:'CG',
        role_en:'Private Lecturer for Public Law and Law of the Digital Society, University of Kassel',
        role_de:'Privatdozent für Öffentliches Recht und Recht der digitalen Gesellschaft, Universität Kassel',
        image:'public/img/team/christian-geminn.jpg',
        bio_short_en:'PD Dr. Geminn is a private lecturer at the University of Kassel and consultant for ministries and organisations, researching fundamental rights, data protection, and technology law.',
        bio_short_de:'PD Dr. Geminn ist Privatdozent an der Universität Kassel und Berater für Ministerien und Organisationen, mit Forschungsschwerpunkten in Grundrechten, Datenschutz und Technologierecht.',
        bio_long_en:'PD Dr. Christian Geminn is a private lecturer for Public Law and Law of the Digital Society at the University of Kassel. He is active as a consultant for ministries, non-profit organisations, and companies, and is a principal investigator in several third-party funded research projects. His research focuses on fundamental rights, comparative law, data protection, governance, and technology law.',
        bio_long_de:'PD Dr. Christian Geminn ist Privatdozent für Öffentliches Recht und Recht der digitalen Gesellschaft an der Universität Kassel. Er ist als Berater für Ministerien, Non-Profit-Organisationen und Unternehmen tätig und Principal Investigator in mehreren drittmittelgeförderten Forschungsprojekten. Seine Forschungsschwerpunkte sind Grundrechte, Rechtsvergleichung, Datenschutz, Governance und Technologierecht.' }
    ];
  }

  /* ────── AUTH ────── */
  function checkAuth() {
    if (sessionStorage.getItem('sentiment-auth') === 'ok') showApp();
  }

  function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    loadData();
    loadRegistrations();
  }

  document.getElementById('pw-btn').addEventListener('click', tryLogin);
  document.getElementById('pw-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryLogin();
  });

  function tryLogin() {
    if (document.getElementById('pw-input').value === PASSWORD) {
      sessionStorage.setItem('sentiment-auth', 'ok');
      showApp();
    } else {
      document.getElementById('pw-error').textContent = 'Falsches Passwort';
    }
  }

  document.getElementById('btn-logout').addEventListener('click', function () {
    sessionStorage.removeItem('sentiment-auth');
    location.reload();
  });

  /* ────── DATA ────── */
  function setSyncStatus(s) {
    var dot = document.getElementById('sync-dot');
    dot.className = 'sync-indicator' + (s === 'error' ? ' error' : s === 'saving' ? ' saving' : '');
    if (s === 'ok') {
      var now = new Date();
      var ts = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      dot.title = 'Gespeichert ' + ts;
    } else if (s === 'saving') {
      dot.title = 'Speichert...';
    } else {
      dot.title = 'Fehler beim Speichern';
    }
  }

  var dataSeeded = false;

  function loadData() {
    console.log('loadData() called');
    fetch(API + '?t=' + Date.now())
      .then(function (r) {
        console.log('loadData() status:', r.status);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        data = {
          events: (d && d.events) || [],
          tasks: (d && d.tasks) || [],
          infoCards: (d && d.infoCards) || [],
          team: (d && d.team) || []
        };
        dataSeeded = !!(d && d.seeded);
        console.log('loadData() got events:', data.events.length, 'tasks:', data.tasks.length, 'infoCards:', data.infoCards.length, 'seeded:', dataSeeded);

        var needsSave = false;

        // Seed tasks ONCE
        if (!dataSeeded && typeof IMPORTED_TASKS !== 'undefined') {
          console.log('First load — seeding', IMPORTED_TASKS.length, 'tasks from Excel');
          data.tasks = IMPORTED_TASKS.map(function (t) {
            return Object.assign({}, t, { id: 'imported_' + t.id, due: t.dueDate || '' });
          });
          dataSeeded = true;
          needsSave = true;
        }

        // Seed default info-cards if empty (only once)
        if (data.infoCards.length === 0) {
          data.infoCards = defaultInfoCards();
          needsSave = true;
        }

        // Seed default team if empty (only once)
        if (data.team.length === 0) {
          data.team = defaultTeam();
          needsSave = true;
        }

        renderAll();
        setSyncStatus('ok');
        if (needsSave) saveData();
      })
      .catch(function (err) {
        console.error('loadData() FAILED:', err);
        setSyncStatus('error');
      });
  }

  function saveData() {
    setSyncStatus('saving');
    var payload = {
      events: data.events || [],
      tasks: data.tasks || [],
      infoCards: data.infoCards || [],
      team: data.team || [],
      seeded: dataSeeded
    };
    console.log('saveData() called — events:', payload.events.length, 'tasks:', payload.tasks.length, 'infoCards:', payload.infoCards.length, 'seeded:', payload.seeded);

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        console.log('saveData() response status:', r.status);
        return r.text().then(function (text) {
          console.log('saveData() response:', text.substring(0, 200));
          var d;
          try { d = JSON.parse(text); } catch (e) { throw new Error('Invalid JSON: ' + text.substring(0, 100)); }
          if (!r.ok || !d.ok) throw new Error('API error: ' + (d.error || d.detail || JSON.stringify(d)));
          setSyncStatus('ok');
          console.log('saveData() SUCCESS');
        });
      })
      .catch(function (err) {
        console.error('saveData() FAILED:', err);
        setSyncStatus('error');
      });
  }

  var registrations = [];

  function loadRegistrations() {
    fetch('../api/register', { headers: { 'X-Admin-Token': 'sentiment2026' } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        registrations = Array.isArray(d) ? d : [];
        renderRegistrations();
      })
      .catch(function () { registrations = []; });
  }

  function fmtTimestamp(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear() + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function renderRegistrations() {
    var container = document.getElementById('reg-grouped');
    var countEl = document.getElementById('reg-count');
    if (!container) return;

    countEl.textContent = registrations.length + ' Anmeldung' + (registrations.length !== 1 ? 'en' : '');

    // group by event — a registration appears under each event it has
    var groups = {};
    registrations.forEach(function (r) {
      var list = Array.isArray(r.events) && r.events.length
        ? r.events
        : (r.event ? [r.event] : ['Ohne Event']);
      list.forEach(function (ev) {
        if (!groups[ev]) groups[ev] = [];
        groups[ev].push(r);
      });
    });

    // sort each group newest first
    Object.keys(groups).forEach(function (ev) {
      groups[ev].sort(function (a, b) { return (b.timestamp || '').localeCompare(a.timestamp || ''); });
    });

    container.innerHTML = '';
    Object.keys(groups).forEach(function (ev) {
      var regs = groups[ev];
      var totalPersons = regs.reduce(function (s, r) { return s + parseInt(r.personen || '1', 10); }, 0);

      var group = document.createElement('div');
      group.className = 'reg-group open';

      var header = document.createElement('div');
      header.className = 'reg-group-header';
      header.innerHTML =
        '<div class="reg-group-left"><span class="reg-group-name">' + ev + '</span><span class="reg-group-count">' + regs.length + ' Anmeldungen · ' + totalPersons + ' Personen</span></div>' +
        '<div class="reg-group-right"><button class="reg-group-csv" data-event="' + ev.replace(/"/g, '&quot;') + '">CSV</button><button class="reg-group-toggle">&#9660;</button></div>';

      header.addEventListener('click', function (e) {
        if (e.target.classList.contains('reg-group-csv')) return;
        group.classList.toggle('open');
      });

      var body = document.createElement('div');
      body.className = 'reg-group-body';

      var table = document.createElement('table');
      table.className = 'reg-table';
      table.innerHTML = '<thead><tr><th>Datum</th><th>Name</th><th>E-Mail</th><th>Pers.</th><th>Bereich</th><th>Nachricht</th><th></th></tr></thead>';
      var tbody = document.createElement('tbody');

      regs.forEach(function (r) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + fmtTimestamp(r.timestamp) + '</td><td>' + (r.vorname || '') + ' ' + (r.nachname || '') + '</td><td>' + (r.email || '') + '</td><td>' + (r.personen || '1') + '</td><td>' + (r.bereich || '') + '</td><td title="' + (r.nachricht || '').replace(/"/g, '&quot;') + '">' + (r.nachricht || '') + '</td><td><button class="reg-del-btn" data-id="' + r.id + '">&times;</button></td>';
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      body.appendChild(table);
      group.appendChild(header);
      group.appendChild(body);
      container.appendChild(group);
    });

    // wire delete buttons
    container.querySelectorAll('.reg-del-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('Anmeldung wirklich löschen?')) return;
        deleteRegistration(btn.dataset.id);
      });
    });

    // wire per-event CSV
    container.querySelectorAll('.reg-group-csv').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        exportCsv(groups[btn.dataset.event] || [], btn.dataset.event);
      });
    });
  }

  function deleteRegistration(id) {
    registrations = registrations.filter(function (r) { return r.id !== id; });
    renderRegistrations();
    fetch('../api/register', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'sentiment2026' },
      body: JSON.stringify({ registrations: registrations })
    }).catch(function () { setSyncStatus('error'); });
  }

  function exportCsv(regs, filename) {
    var headers = ['Datum', 'Vorname', 'Nachname', 'E-Mail', 'Personen', 'Bereich', 'Nachricht'];
    var rows = regs.map(function (r) {
      var d = r.timestamp ? new Date(r.timestamp).toISOString() : '';
      return [d, r.vorname, r.nachname, r.email, r.personen || '1', r.bereich, r.nachricht].map(function (v) {
        return '"' + (v || '').replace(/"/g, '""') + '"';
      }).join(',');
    });
    var csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (filename || 'registrations').replace(/[^a-zA-Z0-9äöüÄÖÜ ]/g, '_') + '.csv';
    a.click();
  }

  // CSV export all
  document.getElementById('btn-export-csv-all').addEventListener('click', function () {
    exportCsv(registrations, 'alle-anmeldungen');
  });

  function renderAll() {
    renderOverview();
    renderCalendar();
    renderTasks();
    renderInfoCards();
    renderTeam();
  }

  /* ────── INFO CARDS (CRUD) ────── */
  function renderInfoCards() {
    var container = document.getElementById('info-cards-list');
    if (!container) return;
    container.innerHTML = '';
    if (!data.infoCards || data.infoCards.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'no-tasks';
      empty.textContent = 'Noch keine Karten — klick "+ Neue Karte" um anzufangen';
      container.appendChild(empty);
      return;
    }
    data.infoCards.forEach(function (card, idx) {
      var row = document.createElement('div');
      row.className = 'info-card-row';
      row.dataset.id = card.id;

      var firstImg = (Array.isArray(card.images) && card.images[0]) || card.image || '';
      var multi = Array.isArray(card.images) && card.images.length > 1;
      var thumb = firstImg
        ? '<div class="ic-thumb"><img src="' + firstImg.replace(/"/g, '&quot;') + '" alt="" onerror="this.parentNode.innerHTML=\'<span class=ic-thumb-empty>Kein Bild</span>\'">' + (multi ? '<span class="ic-thumb-count">' + card.images.length + '</span>' : '') + '</div>'
        : '<div class="ic-thumb"><span class="ic-thumb-empty">Kein Bild</span></div>';

      row.innerHTML =
        thumb +
        '<div class="ic-body">' +
          (card.label_de ? '<div class="ic-label">' + escapeHtml(card.label_de) + '</div>' : '') +
          '<div class="ic-title">' + escapeHtml(card.title_de || card.title_en || 'Ohne Titel') + '</div>' +
        '</div>' +
        '<div class="ic-actions">' +
          (idx > 0 ? '<button class="ic-order-btn" data-act="up" title="Nach oben">↑</button>' : '') +
          (idx < data.infoCards.length - 1 ? '<button class="ic-order-btn" data-act="down" title="Nach unten">↓</button>' : '') +
        '</div>' +
        '<span class="ic-arrow">›</span>';

      row.addEventListener('click', function (e) {
        if (e.target.classList.contains('ic-order-btn')) {
          e.stopPropagation();
          var act = e.target.dataset.act;
          var i = data.infoCards.findIndex(function (c) { return c.id === card.id; });
          if (act === 'up' && i > 0) { var t = data.infoCards[i-1]; data.infoCards[i-1] = data.infoCards[i]; data.infoCards[i] = t; }
          if (act === 'down' && i < data.infoCards.length - 1) { var t = data.infoCards[i+1]; data.infoCards[i+1] = data.infoCards[i]; data.infoCards[i] = t; }
          renderInfoCards();
          saveData();
          return;
        }
        openCardModal(card.id);
      });
      container.appendChild(row);
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Card modal */
  var cardModal = document.getElementById('card-modal');
  var cardForm = document.getElementById('card-form');
  var cardBtnDelete = document.getElementById('card-btn-delete');

  document.getElementById('btn-add-card').addEventListener('click', function () {
    openCardModal(null);
  });

  function openCardModal(id) {
    editingCardId = id;
    cardForm.reset();
    if (id) {
      var c = data.infoCards.find(function (x) { return x.id === id; });
      if (!c) return;
      document.getElementById('card-modal-title').textContent = 'Karte bearbeiten';
      cardForm.label_de.value = c.label_de || '';
      cardForm.label_en.value = c.label_en || '';
      cardForm.title_de.value = c.title_de || '';
      cardForm.title_en.value = c.title_en || '';
      cardForm.body_de.value = c.body_de || '';
      cardForm.body_en.value = c.body_en || '';
      cardForm.images.value = (Array.isArray(c.images) ? c.images : (c.image ? [c.image] : [])).join('\n');
      cardForm.items.value = (Array.isArray(c.items) ? c.items : []).map(function (it) {
        return (it.de || '') + ' | ' + (it.en || '');
      }).join('\n');
      cardBtnDelete.classList.remove('hidden');
    } else {
      document.getElementById('card-modal-title').textContent = 'Neue Karte';
      cardBtnDelete.classList.add('hidden');
    }
    cardModal.classList.add('open');
  }

  function closeCardModal() {
    cardModal.classList.remove('open');
    editingCardId = null;
  }

  document.getElementById('card-modal-close').addEventListener('click', closeCardModal);
  document.getElementById('card-btn-cancel').addEventListener('click', closeCardModal);
  cardModal.addEventListener('click', function (e) {
    if (e.target === cardModal) closeCardModal();
  });

  cardBtnDelete.addEventListener('click', function () {
    if (!editingCardId) return;
    if (!confirm('Karte wirklich löschen?')) return;
    data.infoCards = data.infoCards.filter(function (c) { return c.id !== editingCardId; });
    saveData();
    closeCardModal();
    renderInfoCards();
  });

  cardForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var itemsRaw = cardForm.items.value || '';
    var items = itemsRaw.split('\n').map(function (line) {
      var parts = line.split('|').map(function (p) { return p.trim(); });
      return parts[0] ? { de: parts[0], en: parts[1] || parts[0] } : null;
    }).filter(Boolean);

    var images = (cardForm.images.value || '').split('\n')
      .map(function (s) { return s.trim(); }).filter(Boolean);
    var obj = {
      label_de: cardForm.label_de.value,
      label_en: cardForm.label_en.value,
      title_de: cardForm.title_de.value,
      title_en: cardForm.title_en.value,
      body_de: cardForm.body_de.value,
      body_en: cardForm.body_en.value,
      images: images,
      image: images[0] || '',
      items: items
    };

    if (editingCardId) {
      var c = data.infoCards.find(function (x) { return x.id === editingCardId; });
      if (c) Object.keys(obj).forEach(function (k) { c[k] = obj[k]; });
    } else {
      obj.id = 'card-' + Date.now();
      data.infoCards.push(obj);
    }
    saveData();
    closeCardModal();
    renderInfoCards();
  });

  /* ────── TEAM (CRUD) ────── */
  function slugify(s) {
    return String(s || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function autoInitials(name) {
    return String(name || '').split(/\s+/).filter(Boolean)
      .filter(function (w) { return !/^(dr|prof|m\.sc|pd|b\.a|m\.a)\.?$/i.test(w); })
      .slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  }

  function renderTeam() {
    var container = document.getElementById('team-list');
    if (!container) return;
    container.innerHTML = '';
    if (!data.team || data.team.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'no-tasks';
      empty.textContent = 'Noch keine Personen — klick "+ Neue Person" um anzufangen';
      container.appendChild(empty);
      return;
    }
    data.team.forEach(function (person, idx) {
      var row = document.createElement('div');
      row.className = 'info-card-row';
      row.dataset.id = person.id;

      var thumb = person.image
        ? '<div class="ic-thumb"><img src="' + person.image.replace(/"/g, '&quot;') + '" alt="" onerror="this.parentNode.innerHTML=\'<span class=ic-thumb-empty>' + escapeHtml(person.initials || '?') + '</span>\'"></div>'
        : '<div class="ic-thumb"><span class="ic-thumb-empty">' + escapeHtml(person.initials || '?') + '</span></div>';

      var typeLabel = person.type === 'artist' ? 'Künstler:in' : 'Forscher:in';

      row.innerHTML =
        thumb +
        '<div class="ic-body">' +
          '<div class="ic-label">' + typeLabel + '</div>' +
          '<div class="ic-title">' + escapeHtml(person.name || 'Ohne Namen') + '</div>' +
        '</div>' +
        '<div class="ic-actions">' +
          (idx > 0 ? '<button class="ic-order-btn" data-act="up" title="Nach oben">↑</button>' : '') +
          (idx < data.team.length - 1 ? '<button class="ic-order-btn" data-act="down" title="Nach unten">↓</button>' : '') +
        '</div>' +
        '<span class="ic-arrow">›</span>';

      row.addEventListener('click', function (e) {
        if (e.target.classList.contains('ic-order-btn')) {
          e.stopPropagation();
          var act = e.target.dataset.act;
          var i = data.team.findIndex(function (p) { return p.id === person.id; });
          if (act === 'up' && i > 0) { var t = data.team[i-1]; data.team[i-1] = data.team[i]; data.team[i] = t; }
          if (act === 'down' && i < data.team.length - 1) { var t = data.team[i+1]; data.team[i+1] = data.team[i]; data.team[i] = t; }
          renderTeam();
          saveData();
          return;
        }
        openPersonModal(person.id);
      });
      container.appendChild(row);
    });
  }

  var personModal = document.getElementById('person-modal');
  var personForm = document.getElementById('person-form');
  var personBtnDelete = document.getElementById('person-btn-delete');

  document.getElementById('btn-add-person').addEventListener('click', function () {
    openPersonModal(null);
  });

  function openPersonModal(id) {
    editingPersonId = id;
    personForm.reset();
    if (id) {
      var p = data.team.find(function (x) { return x.id === id; });
      if (!p) return;
      document.getElementById('person-modal-title').textContent = 'Person bearbeiten';
      personForm.name.value = p.name || '';
      personForm.initials.value = p.initials || '';
      personForm.type.value = p.type || 'researcher';
      personForm.id.value = p.id || '';
      personForm.role_de.value = p.role_de || '';
      personForm.role_en.value = p.role_en || '';
      personForm.image.value = p.image || '';
      personForm.bio_short_de.value = p.bio_short_de || '';
      personForm.bio_short_en.value = p.bio_short_en || '';
      personForm.bio_long_de.value = p.bio_long_de || '';
      personForm.bio_long_en.value = p.bio_long_en || '';
      personBtnDelete.classList.remove('hidden');
    } else {
      document.getElementById('person-modal-title').textContent = 'Neue Person';
      personBtnDelete.classList.add('hidden');
    }
    personModal.classList.add('open');
  }

  function closePersonModal() {
    personModal.classList.remove('open');
    editingPersonId = null;
  }

  document.getElementById('person-modal-close').addEventListener('click', closePersonModal);
  document.getElementById('person-btn-cancel').addEventListener('click', closePersonModal);
  personModal.addEventListener('click', function (e) {
    if (e.target === personModal) closePersonModal();
  });

  personBtnDelete.addEventListener('click', function () {
    if (!editingPersonId) return;
    if (!confirm('Person wirklich löschen?')) return;
    data.team = data.team.filter(function (p) { return p.id !== editingPersonId; });
    saveData();
    closePersonModal();
    renderTeam();
  });

  personForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameVal = personForm.name.value.trim();
    var obj = {
      name: nameVal,
      initials: (personForm.initials.value.trim() || autoInitials(nameVal)),
      type: personForm.type.value || 'researcher',
      role_de: personForm.role_de.value,
      role_en: personForm.role_en.value,
      image: personForm.image.value,
      bio_short_de: personForm.bio_short_de.value,
      bio_short_en: personForm.bio_short_en.value,
      bio_long_de: personForm.bio_long_de.value,
      bio_long_en: personForm.bio_long_en.value
    };

    if (editingPersonId) {
      var p = data.team.find(function (x) { return x.id === editingPersonId; });
      if (p) {
        var newId = personForm.id.value.trim() || p.id;
        Object.keys(obj).forEach(function (k) { p[k] = obj[k]; });
        p.id = newId;
      }
    } else {
      var inputId = personForm.id.value.trim();
      obj.id = inputId || slugify(nameVal) || ('person-' + Date.now());
      if (data.team.some(function (x) { return x.id === obj.id; })) {
        obj.id = obj.id + '-' + Date.now();
      }
      data.team.push(obj);
    }
    saveData();
    closePersonModal();
    renderTeam();
  });

  /* ────── TOAST ────── */
  var toastTimer;
  function showToast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  /* ────── TABS ────── */
  var tabBarEl = document.querySelector('.tab-bar');
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      // close burger menu on tab select
      if (tabBarEl) tabBarEl.classList.remove('mobile-open');
      // re-render active tab to pick up latest data
      if (btn.dataset.tab === 'aufgaben') renderTasks();
      if (btn.dataset.tab === 'uebersicht') renderOverview();
    });
  });

  /* ────── ADMIN BURGER ────── */
  var adminBurger = document.getElementById('adminBurger');
  if (adminBurger && tabBarEl) {
    adminBurger.addEventListener('click', function () {
      tabBarEl.classList.toggle('mobile-open');
    });
  }

  function switchToTab(name) {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    document.querySelectorAll('.tab-content').forEach(function (c) {
      c.classList.toggle('active', c.id === 'tab-' + name);
    });
  }

  /* ────── HELPERS ────── */
  var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  function fmt(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function formatDateShort(s) {
    if (!s) return '';
    var p = s.split('-');
    return p[2] + '.' + p[1] + '.';
  }

  function catColor(cat) {
    var map = { cpdp: 'var(--cat-cpdp)', koeln: 'var(--cat-koeln)', pub: 'var(--cat-pub)', pr: 'var(--cat-pr)', other: 'var(--cat-other)' };
    return map[cat] || 'var(--muted2)';
  }

  var ALL_CATS = [
    { key: 'cpdp',  label: 'CPDP Brüssel' },
    { key: 'koeln', label: 'Ausstellung Köln' },
    { key: 'pub',   label: 'Publikation' },
    { key: 'pr',    label: 'PR / Social' },
    { key: 'other', label: 'Other' }
  ];

  function getEventTitle(ev) {
    return ev ? (ev.titleDE || ev.title || 'Event') : '';
  }

  /* ────── OVERVIEW ────── */
  function renderOverview() {
    var container = document.getElementById('overview-grid');
    container.innerHTML = '';

    // Apr 2026 (month 3) through Jan 2027 (month 0 of 2027) = 10 months
    var months = [];
    for (var m = 3; m <= 11; m++) months.push({ year: 2026, month: m });
    months.push({ year: 2027, month: 0 });

    months.forEach(function (spec) {
      var card = document.createElement('div');
      card.className = 'ov-month';

      var label = document.createElement('div');
      label.className = 'ov-month-label';
      label.textContent = MONTHS_SHORT[spec.month] + ' ' + spec.year;
      card.appendChild(label);

      var grid = document.createElement('div');
      grid.className = 'ov-mini-grid';

      // Day-of-week headers
      ['M', 'D', 'M', 'D', 'F', 'S', 'S'].forEach(function (d) {
        var hd = document.createElement('div');
        hd.className = 'ov-mini-header';
        hd.textContent = d;
        grid.appendChild(hd);
      });

      var first = new Date(spec.year, spec.month, 1);
      var startDay = (first.getDay() + 6) % 7;
      var daysInMonth = new Date(spec.year, spec.month + 1, 0).getDate();
      var eventCount = 0;

      // Empty leading cells
      for (var i = 0; i < startDay; i++) {
        var empty = document.createElement('div');
        empty.className = 'ov-mini-day empty';
        grid.appendChild(empty);
      }

      var taskCount = 0;
      for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = fmt(new Date(spec.year, spec.month, d));
        var dayEvents = data.events.filter(function (ev) {
          return dateStr >= ev.dateFrom && dateStr <= (ev.dateTo || ev.dateFrom);
        });
        var dayTasks = data.tasks.filter(function (t) { return t.due === dateStr; });
        var hasItems = dayEvents.length || dayTasks.length;

        var cell = document.createElement('div');
        cell.className = 'ov-mini-day' + (hasItems ? ' has-event' : '');
        cell.textContent = d;

        if (dayEvents.length) {
          eventCount += dayEvents.length;
          var dot = document.createElement('span');
          dot.className = 'ov-dot';
          dot.style.background = catColor(dayEvents[0].category);
          cell.appendChild(dot);
        } else if (dayTasks.length) {
          taskCount += dayTasks.length;
          var hasOverdue = dayTasks.some(function (t) { return getTaskUrgency(t) === 'overdue'; });
          var dot = document.createElement('span');
          dot.className = 'ov-dot';
          dot.style.background = hasOverdue ? 'var(--red)' : 'var(--muted2)';
          cell.appendChild(dot);
        }
        grid.appendChild(cell);
      }

      card.appendChild(grid);

      // count open/done/overdue per month
      var monthTasks = data.tasks.filter(function (t) {
        if (!t.due) return false;
        var dp = t.due.split('-');
        return dp.length === 3 && parseInt(dp[0]) === spec.year && parseInt(dp[1]) - 1 === spec.month;
      });
      var openCount = monthTasks.filter(function (t) { return t.status !== 'Erledigt'; }).length;
      var doneCount = monthTasks.filter(function (t) { return t.status === 'Erledigt'; }).length;
      var overdueCount = monthTasks.filter(function (t) {
        return t.status !== 'Erledigt' && t.due < fmt(new Date());
      }).length;

      var count = document.createElement('div');
      count.className = 'ov-month-count';
      var parts = [];
      if (eventCount) parts.push(eventCount + ' Event' + (eventCount !== 1 ? 's' : ''));
      if (openCount) parts.push('<span style="color:var(--cat-other)">' + openCount + ' offen</span>');
      if (doneCount) parts.push('<span style="color:var(--muted2)">' + doneCount + ' erledigt</span>');
      if (overdueCount) parts.push('<span style="color:var(--red)">' + overdueCount + ' überfällig</span>');
      count.innerHTML = parts.length ? parts.join(' · ') : 'Keine Einträge';
      card.appendChild(count);

      card.addEventListener('click', function () {
        currentMonth = new Date(spec.year, spec.month, 1);
        renderCalendar();
        switchToTab('kalender');
      });

      container.appendChild(card);
    });
  }

  /* ────── CALENDAR ────── */
  document.getElementById('cal-prev').addEventListener('click', function () {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', function () {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  document.getElementById('cal-today').addEventListener('click', function () {
    currentMonth = new Date();
    renderCalendar();
  });

  function renderCalendar() {
    var year = currentMonth.getFullYear();
    var month = currentMonth.getMonth();
    document.getElementById('cal-month-label').textContent = MONTHS[month] + ' ' + year;

    var first = new Date(year, month, 1);
    var startDay = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevDays = new Date(year, month, 0).getDate();
    var container = document.getElementById('cal-days');
    container.innerHTML = '';
    var todayStr = fmt(new Date());

    for (var i = startDay - 1; i >= 0; i--) {
      container.appendChild(createDayCell(new Date(year, month - 1, prevDays - i), true));
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var cell = createDayCell(date, false);
      if (fmt(date) === todayStr) cell.classList.add('today');
      container.appendChild(cell);
    }
    var total = container.children.length;
    var remaining = Math.ceil(total / 7) * 7 - total;
    for (var i = 1; i <= remaining; i++) {
      container.appendChild(createDayCell(new Date(year, month + 1, i), true));
    }
  }

  function createDayCell(date, isOther) {
    var cell = document.createElement('div');
    cell.className = 'cal-day' + (isOther ? ' other-month' : '');

    var num = document.createElement('div');
    num.className = 'cal-day-num';
    num.textContent = date.getDate();
    cell.appendChild(num);

    var dateStr = fmt(date);
    var dayEvents = data.events.filter(function (ev) {
      return dateStr >= ev.dateFrom && dateStr <= (ev.dateTo || ev.dateFrom);
    });

    dayEvents.forEach(function (ev) {
      var isInternal = INTERNAL_CATS.indexOf(ev.category) !== -1;
      var chip = document.createElement('div');
      chip.className = 'cal-event cat-' + (ev.category || 'cpdp') + (ev.published ? '' : ' unpublished');

      var titleText = ev.title || 'Event';
      if (ev.time) titleText = ev.time + ' ' + titleText;

      var badge = document.createElement('span');
      if (isInternal) {
        badge.className = 'pub-badge internal';
        badge.textContent = 'Intern';
      } else {
        badge.className = 'pub-badge ' + (ev.published ? 'published' : 'unpublished');
        badge.textContent = ev.published ? 'Live' : 'Entwurf';
      }

      chip.textContent = titleText;
      chip.appendChild(badge);

      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        openEventModal(ev.id);
      });
      cell.appendChild(chip);
    });

    // Tasks on this day
    var dayTasks = data.tasks.filter(function (t) { return t.due === dateStr; });
    dayTasks.forEach(function (task) {
      var chip = document.createElement('div');
      chip.className = 'cal-task cat-' + (task.category || 'other');
      if (task.status === 'Erledigt') chip.classList.add('done');

      chip.textContent = task.title || 'Aufgabe';

      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        openTaskModal(task.id);
      });
      cell.appendChild(chip);
    });

    cell.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        openDayPanel(dateStr);
      } else {
        openEventModal(null, dateStr);
      }
    });

    return cell;
  }

  /* ────── DAY PANEL (mobile) ────── */
  function openDayPanel(dateStr) {
    var dayEvents = data.events.filter(function (ev) {
      return dateStr >= ev.dateFrom && dateStr <= (ev.dateTo || ev.dateFrom);
    });
    var dayTasks = data.tasks.filter(function (t) { return t.due === dateStr; });

    var parts = dateStr.split('-');
    var mNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    document.getElementById('dayPanelDate').textContent =
      parseInt(parts[2]) + '. ' + mNames[parseInt(parts[1]) - 1] + ' ' + parts[0];

    var eventsEl = document.getElementById('dayPanelEvents');
    var html = '';

    if (dayEvents.length === 0 && dayTasks.length === 0) {
      html = '<div class="day-panel-empty">Keine Einträge an diesem Tag</div>';
    }

    dayEvents.forEach(function (ev) {
      html += '<div class="day-panel-event-row" data-evid="' + ev.id + '">' +
        '<div class="day-panel-event-dot" style="background:' + catColor(ev.category) + '"></div>' +
        '<div class="day-panel-event-title">' + (ev.title || 'Event') + '</div>' +
        (ev.time ? '<div class="day-panel-event-time">' + ev.time + '</div>' : '') +
        '</div>';
    });

    dayTasks.forEach(function (t) {
      html += '<div class="day-panel-task-row">' + (t.title || 'Aufgabe') + '</div>';
    });

    eventsEl.innerHTML = html;

    eventsEl.querySelectorAll('.day-panel-event-row').forEach(function (row) {
      row.addEventListener('click', function () {
        closeDayPanel();
        openEventModal(row.dataset.evid);
      });
    });

    document.getElementById('dayPanelAdd').onclick = function () {
      closeDayPanel();
      openEventModal(null, dateStr);
    };

    document.getElementById('dayPanelBg').classList.add('open');
    document.getElementById('dayPanel').classList.add('open');
  }

  function closeDayPanel() {
    document.getElementById('dayPanelBg').classList.remove('open');
    document.getElementById('dayPanel').classList.remove('open');
  }

  document.getElementById('dayPanelClose').addEventListener('click', closeDayPanel);
  document.getElementById('dayPanelBg').addEventListener('click', closeDayPanel);

  /* ────── EVENT MODAL ────── */
  var eventModal = document.getElementById('event-modal');
  var eventForm = document.getElementById('event-form');
  var btnPublish = document.getElementById('btn-publish');
  var btnDelete = document.getElementById('btn-delete');

  function openEventModal(id, defaultDate) {
    editingEventId = id;
    eventForm.reset();

    if (id) {
      var ev = data.events.find(function (e) { return e.id === id; });
      if (!ev) return;
      document.getElementById('modal-title').textContent = 'Event bearbeiten';
      eventForm.title.value = ev.title || '';
      eventForm.titleDE.value = ev.titleDE || '';
      eventForm.dateFrom.value = ev.dateFrom || '';
      eventForm.dateTo.value = ev.dateTo || '';
      eventForm.time.value = ev.time || '';
      eventForm.timeEnd.value = ev.timeEnd || '';
      eventForm.format.value = ev.format || 'talk';
      eventForm.category.value = ev.category || 'cpdp';
      eventForm.location.value = ev.location || '';
      eventForm.language.value = ev.language || 'DE';
      eventForm.capacity.value = ev.capacity || '';
      eventForm.who.value = ev.who || '';
      eventForm.status.value = ev.status || 'Offen';
      eventForm.descEN.value = ev.descEN || '';
      eventForm.descDE.value = ev.descDE || '';
      if (eventForm.image) eventForm.image.value = ev.image || '';

      btnPublish.classList.remove('hidden');
      btnDelete.classList.remove('hidden');
      updatePublishBtn(ev);

      renderLinkedTasks(ev.id);
      renderProgramEditor(ev.program || []);
    } else {
      document.getElementById('modal-title').textContent = 'Neues Event';
      if (defaultDate) eventForm.dateFrom.value = defaultDate;
      btnPublish.classList.add('hidden');
      btnDelete.classList.add('hidden');
      renderLinkedTasks(null);
      renderProgramEditor([]);
    }

    eventModal.classList.add('open');
  }

  /* ────── PROGRAM EDITOR ────── */
  function renderProgramEditor(items) {
    var list = document.getElementById('program-list');
    list.innerHTML = '';
    items.forEach(function (item, idx) {
      list.appendChild(createProgramItem(item, idx));
    });
  }

  function createProgramItem(item, idx) {
    item = item || {};
    var row = document.createElement('div');
    row.className = 'program-item';
    row.dataset.idx = idx;
    row.innerHTML =
      '<input type="text" class="program-item-time" placeholder="14:30" value="' + (item.time || '').replace(/"/g, '&quot;') + '" data-field="time">' +
      '<div class="program-fields">' +
        '<input type="text" placeholder="Titel (DE)" value="' + (item.titleDE || '').replace(/"/g, '&quot;') + '" data-field="titleDE">' +
        '<input type="text" placeholder="Titel (EN)" value="' + (item.titleEN || item.title || '').replace(/"/g, '&quot;') + '" data-field="titleEN">' +
        '<textarea placeholder="Beschreibung (DE) — optional" data-field="descDE">' + (item.descDE || '') + '</textarea>' +
        '<textarea placeholder="Beschreibung (EN) — optional" data-field="descEN">' + (item.descEN || '') + '</textarea>' +
      '</div>' +
      '<button type="button" class="program-del" title="Löschen">&times;</button>';
    row.querySelector('.program-del').addEventListener('click', function () {
      row.remove();
    });
    return row;
  }

  function readProgramFromEditor() {
    var rows = document.querySelectorAll('#program-list .program-item');
    var items = [];
    rows.forEach(function (row) {
      var item = {};
      row.querySelectorAll('[data-field]').forEach(function (el) {
        var v = (el.value || '').trim();
        if (v) item[el.dataset.field] = v;
      });
      if (item.time || item.titleDE || item.titleEN) items.push(item);
    });
    return items;
  }

  document.getElementById('btn-add-program').addEventListener('click', function () {
    document.getElementById('program-list').appendChild(createProgramItem({}));
  });

  function renderLinkedTasks(eventId) {
    var container = document.getElementById('linked-tasks-list');
    var section = document.getElementById('linked-tasks-section');

    if (!eventId) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    var linked = data.tasks.filter(function (t) { return t.linkedEventId === eventId; });
    if (!linked.length) {
      container.innerHTML = '<div class="linked-tasks-empty">Keine verknüpften Aufgaben</div>';
      return;
    }

    container.innerHTML = '';
    linked.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'linked-task-item';

      var dot = document.createElement('span');
      dot.className = 'lt-status ' + (t.status || 'Offen').toLowerCase().replace(/ /g, '-');

      var title = document.createElement('span');
      title.className = 'lt-title';
      title.textContent = t.title || '';

      var who = document.createElement('span');
      who.className = 'lt-who';
      who.textContent = t.who || '';

      row.appendChild(dot);
      row.appendChild(title);
      row.appendChild(who);
      container.appendChild(row);
    });
  }

  function updatePublishBtn(ev) {
    var isInternal = INTERNAL_CATS.indexOf((ev && ev.category) || eventForm.category.value) !== -1;
    if (isInternal) {
      btnPublish.textContent = 'Nur intern';
      btnPublish.classList.add('is-published');
      btnPublish.disabled = true;
    } else if (ev && ev.published) {
      btnPublish.textContent = 'Unveröffentlichen';
      btnPublish.classList.add('is-published');
      btnPublish.disabled = false;
    } else {
      btnPublish.textContent = 'Veröffentlichen';
      btnPublish.classList.remove('is-published');
      btnPublish.disabled = false;
    }
  }

  // Update publish button when category changes
  document.getElementById('event-category').addEventListener('change', function () {
    if (editingEventId) {
      var ev = data.events.find(function (e) { return e.id === editingEventId; });
      // If switching to internal, unpublish
      if (ev && INTERNAL_CATS.indexOf(this.value) !== -1 && ev.published) {
        ev.published = false;
      }
      updatePublishBtn(ev);
    }
  });

  function closeEventModal() {
    eventModal.classList.remove('open');
    editingEventId = null;
  }

  document.getElementById('modal-close').addEventListener('click', closeEventModal);
  document.getElementById('btn-cancel').addEventListener('click', closeEventModal);
  eventModal.addEventListener('click', function (e) {
    if (e.target === eventModal) closeEventModal();
  });

  // Add linked task from event modal
  document.getElementById('btn-add-linked-task').addEventListener('click', function () {
    if (!editingEventId) return;
    var ev = data.events.find(function (e) { return e.id === editingEventId; });
    var evId = editingEventId;
    closeEventModal();
    openTaskModal(null, evId, ev ? ev.category : 'cpdp');
  });

  btnPublish.addEventListener('click', function () {
    if (!editingEventId) return;
    var ev = data.events.find(function (e) { return e.id === editingEventId; });
    if (!ev) return;

    // Block publishing internal categories
    if (INTERNAL_CATS.indexOf(ev.category) !== -1) {
      showToast('Diese Kategorie ist nur intern sichtbar');
      return;
    }

    ev.published = !ev.published;
    updatePublishBtn(ev);
    saveData();
    renderCalendar();
    renderOverview();
  });

  btnDelete.addEventListener('click', function () {
    if (!editingEventId) return;
    if (!confirm('Event wirklich löschen?')) return;
    // Unlink tasks
    data.tasks.forEach(function (t) {
      if (t.linkedEventId === editingEventId) t.linkedEventId = '';
    });
    data.events = data.events.filter(function (e) { return e.id !== editingEventId; });
    saveData();
    closeEventModal();
    renderAll();
  });

  eventForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(eventForm);
    var obj = {};
    fd.forEach(function (v, k) { obj[k] = v; });
    if (obj.capacity) obj.capacity = parseInt(obj.capacity, 10);
    obj.program = readProgramFromEditor();

    // Force unpublish for internal categories
    if (INTERNAL_CATS.indexOf(obj.category) !== -1) {
      obj.published = false;
    }

    if (editingEventId) {
      var ev = data.events.find(function (e) { return e.id === editingEventId; });
      if (ev) {
        var wasCat = ev.category;
        Object.keys(obj).forEach(function (k) { ev[k] = obj[k]; });
        // If category changed to internal, force unpublish
        if (INTERNAL_CATS.indexOf(obj.category) !== -1) ev.published = false;
      }
    } else {
      obj.id = 'evt-' + Date.now();
      obj.published = false;
      data.events.push(obj);
    }

    saveData();
    closeEventModal();
    renderAll();
  });

  /* ────── TASKS ────── */
  // Filter chips
  document.querySelectorAll('#tasks-filter .chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      taskFilterCat = btn.dataset.cat;
      taskFilterEvent = 'all';
      document.querySelectorAll('#tasks-filter .chip').forEach(function (c) {
        c.classList.toggle('active', c.dataset.cat === taskFilterCat);
      });
      renderTasks();
    });
  });

  // Person filter
  document.getElementById('tasks-person-filter').addEventListener('change', function () {
    taskFilterPerson = this.value;
    renderTasks();
  });

  function getTaskUrgency(task) {
    if (task.status === 'Erledigt') return 'done';
    if (!task.due) return '';
    var today = fmt(new Date());
    if (task.due < today) return 'overdue';
    var d = new Date();
    d.setDate(d.getDate() + 7);
    if (task.due <= fmt(d)) return 'due-soon';
    return '';
  }

  function taskMatchesPerson(task) {
    if (taskFilterPerson === 'all') return true;
    var who = task.who;
    if (Array.isArray(who)) return who.indexOf(taskFilterPerson) !== -1;
    return (who || '') === taskFilterPerson;
  }

  function renderTaskGroup(tasks, container) {
    var linked = {};
    var unlinked = [];
    tasks.forEach(function (t) {
      if (t.linkedEventId) {
        if (!linked[t.linkedEventId]) linked[t.linkedEventId] = [];
        linked[t.linkedEventId].push(t);
      } else {
        unlinked.push(t);
      }
    });
    Object.keys(linked).forEach(function (evId) {
      var ev = data.events.find(function (e) { return e.id === evId; });
      var group = document.createElement('div');
      group.className = 'task-event-group';
      var groupLabel = document.createElement('div');
      groupLabel.className = 'task-event-label';
      groupLabel.textContent = getEventTitle(ev);
      group.appendChild(groupLabel);
      linked[evId].forEach(function (task) { group.appendChild(createTaskItem(task)); });
      container.appendChild(group);
    });
    unlinked.forEach(function (task) { container.appendChild(createTaskItem(task)); });
  }

  function renderTasks() {
    var container = document.getElementById('tasks-list');
    container.innerHTML = '';

    var catsToShow = taskFilterCat === 'all'
      ? ALL_CATS
      : ALL_CATS.filter(function (c) { return c.key === taskFilterCat; });

    catsToShow.forEach(function (cat) {
      var catTasks = data.tasks.filter(function (t) {
        return t.category === cat.key && taskMatchesPerson(t);
      });

      // Event filter bar — show when a specific category is selected
      var catEvents = data.events.filter(function (e) { return e.category === cat.key; });
      if (taskFilterCat !== 'all' && catEvents.length > 0) {
        var filterBar = document.createElement('div');
        filterBar.className = 'event-filter-bar';

        var allPill = document.createElement('span');
        allPill.className = 'event-pill' + (taskFilterEvent === 'all' ? ' active' : '');
        allPill.textContent = 'Alle Aufgaben';
        allPill.addEventListener('click', function () {
          taskFilterEvent = 'all';
          renderTasks();
        });
        filterBar.appendChild(allPill);

        catEvents.forEach(function (ev) {
          var pill = document.createElement('span');
          pill.className = 'event-pill' + (taskFilterEvent === ev.id ? ' active' : '');
          pill.textContent = getEventTitle(ev);
          if (ev.dateFrom) pill.textContent += ' (' + formatDateShort(ev.dateFrom) + ')';
          pill.addEventListener('click', function () {
            taskFilterEvent = ev.id;
            renderTasks();
          });
          filterBar.appendChild(pill);
        });
        container.appendChild(filterBar);
      }

      // Apply event filter
      if (taskFilterEvent !== 'all') {
        catTasks = catTasks.filter(function (t) { return t.linkedEventId === taskFilterEvent; });
      }

      var section = document.createElement('div');
      section.className = 'task-category';

      var header = document.createElement('div');
      header.className = 'task-category-header';
      var dot = document.createElement('span');
      dot.className = 'task-category-dot';
      dot.style.background = catColor(cat.key);
      header.appendChild(dot);
      header.appendChild(document.createTextNode(cat.label + ' (' + catTasks.length + ')'));
      section.appendChild(header);

      var openTasks = catTasks.filter(function (t) { return t.status !== 'Erledigt'; });
      var doneTasks = catTasks.filter(function (t) { return t.status === 'Erledigt'; });

      if (catTasks.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'no-tasks';
        empty.textContent = 'Keine Aufgaben';
        section.appendChild(empty);
      } else {
        // Render open tasks (grouped by event link)
        renderTaskGroup(openTasks, section);

        // Completed divider + collapsible section
        if (doneTasks.length > 0) {
          var doneLabel = doneTasks.length + ' erledigte Aufgabe' + (doneTasks.length !== 1 ? 'n' : '');
          var divider = document.createElement('div');
          divider.className = 'completed-divider';
          divider.textContent = doneLabel + (completedSectionOpen ? ' ▴' : ' ▾');
          section.appendChild(divider);

          var doneSection = document.createElement('div');
          doneSection.className = 'completed-section' + (completedSectionOpen ? ' open' : '');
          renderTaskGroup(doneTasks, doneSection);
          section.appendChild(doneSection);

          divider.addEventListener('click', function () {
            completedSectionOpen = !completedSectionOpen;
            doneSection.classList.toggle('open', completedSectionOpen);
            divider.textContent = doneLabel + (completedSectionOpen ? ' ▴' : ' ▾');
          });
        }
      }

      container.appendChild(section);
    });
  }

  function createTaskItem(task) {
    var isDone = task.status === 'Erledigt';
    var urgency = getTaskUrgency(task);
    var row = document.createElement('div');
    row.className = 'task-item' + (isDone ? ' done' : '') + (urgency === 'overdue' ? ' overdue' : '') + (urgency === 'due-soon' ? ' due-soon' : '');

    var cb = document.createElement('div');
    cb.className = 'task-checkbox' + (isDone ? ' done' : '');
    cb.textContent = isDone ? '\u2713' : '';
    cb.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleTaskStatus(task.id);
    });

    var title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title || '';
    // event badge
    if (task.linkedEventId) {
      var linkedEv = data.events.find(function (e) { return e.id === task.linkedEventId; });
      if (linkedEv) {
        var evBadge = document.createElement('span');
        evBadge.className = 'event-badge';
        evBadge.textContent = getEventTitle(linkedEv);
        title.appendChild(evBadge);
      }
    }

    var meta = document.createElement('div');
    meta.className = 'task-meta';

    var whoList = Array.isArray(task.who) ? task.who : (task.who ? [task.who] : []);
    if (whoList.length) {
      var who = document.createElement('span');
      who.className = 'task-who';
      who.textContent = whoList.join(', ');
      meta.appendChild(who);
    }

    if (task.due) {
      var due = document.createElement('span');
      due.className = 'task-due';
      if (urgency === 'overdue') due.classList.add('overdue');
      due.textContent = formatDateShort(task.due);
      meta.appendChild(due);
    }

    // urgency badge
    if (urgency === 'overdue') {
      var ub = document.createElement('span');
      ub.className = 'task-status-badge overdue';
      ub.textContent = 'Überfällig';
      meta.appendChild(ub);
    } else if (urgency === 'due-soon') {
      var ub = document.createElement('span');
      ub.className = 'task-status-badge due-soon';
      ub.textContent = 'Bald fällig';
      meta.appendChild(ub);
    } else {
      var statusText = task.status || 'Offen';
      var badge = document.createElement('span');
      badge.className = 'task-status-badge ' + statusText.toLowerCase().replace(/ /g, '-');
      badge.textContent = statusText;
      meta.appendChild(badge);
    }

    row.appendChild(cb);
    row.appendChild(title);
    row.appendChild(meta);

    row.addEventListener('click', function () {
      openTaskModal(task.id);
    });

    return row;
  }

  function toggleTaskStatus(id) {
    var task = data.tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    var prevStatus = task.status;
    var order = ['Offen', 'In Bearbeitung', 'Erledigt'];
    task.status = order[(order.indexOf(task.status) + 1) % order.length];

    // store for undo
    lastTaskChange = { taskId: task.id, previousStatus: prevStatus };
    var undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
      undoBtn.style.display = 'inline-flex';
      clearTimeout(undoTimer);
      undoTimer = setTimeout(function () {
        undoBtn.style.display = 'none';
        lastTaskChange = null;
      }, 8000);
    }

    saveData();
    renderTasks();
  }

  // undo handler
  document.getElementById('undoBtn').addEventListener('click', function () {
    if (!lastTaskChange) return;
    var task = data.tasks.find(function (t) { return t.id === lastTaskChange.taskId; });
    if (task) {
      task.status = lastTaskChange.previousStatus;
      lastTaskChange = null;
      clearTimeout(undoTimer);
      document.getElementById('undoBtn').style.display = 'none';
      saveData();
      renderTasks();
    }
  });

  /* ────── TASK MODAL ────── */
  var taskModal = document.getElementById('task-modal');
  var taskForm = document.getElementById('task-form');
  var taskBtnDelete = document.getElementById('task-btn-delete');

  document.getElementById('btn-add-task').addEventListener('click', function () {
    openTaskModal(null);
  });

  function populateEventDropdown(selectedId) {
    var sel = document.getElementById('task-linked-event');
    sel.innerHTML = '<option value="">— Kein Event —</option>';
    data.events.forEach(function (ev) {
      var opt = document.createElement('option');
      opt.value = ev.id;
      opt.textContent = getEventTitle(ev) + (ev.dateFrom ? ' (' + formatDateShort(ev.dateFrom) + ')' : '');
      if (ev.id === selectedId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function openTaskModal(id, preLinkedEventId, preCategory) {
    editingTaskId = id;
    taskForm.reset();
    populateEventDropdown('');

    // reset who checkboxes
    document.querySelectorAll('#task-who-checks input').forEach(function (cb) { cb.checked = false; });

    if (id) {
      var t = data.tasks.find(function (tk) { return tk.id === id; });
      if (!t) return;
      document.getElementById('task-modal-title').textContent = 'Aufgabe bearbeiten';
      taskForm.title.value = t.title || '';
      taskForm.category.value = t.category || 'cpdp';
      taskForm.due.value = t.due || '';
      taskForm.status.value = t.status || 'Offen';
      populateEventDropdown(t.linkedEventId || '');
      // set who checkboxes
      var whoArr = Array.isArray(t.who) ? t.who : (t.who ? [t.who] : []);
      document.querySelectorAll('#task-who-checks input').forEach(function (cb) {
        cb.checked = whoArr.indexOf(cb.value) !== -1;
      });
      taskBtnDelete.classList.remove('hidden');
    } else {
      document.getElementById('task-modal-title').textContent = 'Neue Aufgabe';
      taskBtnDelete.classList.add('hidden');
      if (preLinkedEventId) populateEventDropdown(preLinkedEventId);
      if (preCategory) taskForm.category.value = preCategory;
    }

    taskModal.classList.add('open');
  }

  function closeTaskModal() {
    taskModal.classList.remove('open');
    editingTaskId = null;
  }

  document.getElementById('task-modal-close').addEventListener('click', closeTaskModal);
  document.getElementById('task-btn-cancel').addEventListener('click', closeTaskModal);
  taskModal.addEventListener('click', function (e) {
    if (e.target === taskModal) closeTaskModal();
  });

  taskBtnDelete.addEventListener('click', function () {
    if (!editingTaskId) return;
    if (!confirm('Aufgabe wirklich löschen?')) return;
    data.tasks = data.tasks.filter(function (t) { return t.id !== editingTaskId; });
    saveData();
    closeTaskModal();
    renderTasks();
  });

  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var obj = {
      title: taskForm.title.value,
      category: taskForm.category.value,
      status: taskForm.status.value,
      due: taskForm.due.value,
      linkedEventId: taskForm.linkedEventId.value
    };
    // collect who as array
    var whoArr = [];
    document.querySelectorAll('#task-who-checks input:checked').forEach(function (cb) {
      whoArr.push(cb.value);
    });
    obj.who = whoArr;

    if (editingTaskId) {
      var t = data.tasks.find(function (tk) { return tk.id === editingTaskId; });
      if (t) Object.keys(obj).forEach(function (k) { t[k] = obj[k]; });
    } else {
      obj.id = 'task-' + Date.now();
      data.tasks.push(obj);
    }

    saveData();
    closeTaskModal();
    renderTasks();
  });

  /* ────── INIT ────── */
  checkAuth();
})();
