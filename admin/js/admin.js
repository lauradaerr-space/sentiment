/* ── SENTIMENT Admin ── */
(function () {
  'use strict';

  var PASSWORD = 'sentiment2026';
  var API = '/api/events';
  var INTERNAL_CATS = ['pub', 'pr', 'other'];

  var data = { events: [], tasks: [] };
  var currentMonth = new Date();
  var editingEventId = null;
  var editingTaskId = null;
  var taskFilterCat = 'all';
  var taskFilterPerson = 'all';
  var taskFilterEvent = 'all';
  var lastTaskChange = null;
  var undoTimer = null;
  var completedSectionOpen = false;

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
    dot.title = s === 'error' ? 'Fehler beim Speichern' : s === 'saving' ? 'Speichert...' : 'Gespeichert';
  }

  function loadData() {
    fetch(API)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (Array.isArray(d)) {
          data = (d.length && d[0].title !== undefined && !d[0].due)
            ? { events: d, tasks: [] }
            : { events: [], tasks: [] };
        } else {
          data = { events: d.events || [], tasks: d.tasks || [] };
        }
        // merge imported tasks
        if (typeof IMPORTED_TASKS !== 'undefined') {
          var tasks = data.tasks;
          if (!tasks || tasks.length === 0) {
            data.tasks = IMPORTED_TASKS.map(function (t) {
              return Object.assign({}, t, { id: 'imported_' + t.id, due: t.dueDate || '' });
            });
          } else {
            var existingTitles = {};
            tasks.forEach(function (t) { existingTitles[t.title.trim().toLowerCase()] = true; });
            var newTasks = IMPORTED_TASKS
              .filter(function (t) { return !existingTitles[t.title.trim().toLowerCase()]; })
              .map(function (t) {
                return Object.assign({}, t, { id: 'imported_' + t.id, due: t.dueDate || '' });
              });
            data.tasks = tasks.concat(newTasks);
          }
        }
        renderAll();
        setSyncStatus('ok');
      })
      .catch(function () { setSyncStatus('error'); });
  }

  function saveData() {
    setSyncStatus('saving');
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: data })
    })
      .then(function (r) { setSyncStatus(r.ok ? 'ok' : 'error'); })
      .catch(function () { setSyncStatus('error'); });
  }

  var registrations = [];

  function loadRegistrations() {
    fetch('/api/register', { headers: { 'X-Admin-Token': 'sentiment2026' } })
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

    // group by event
    var groups = {};
    registrations.forEach(function (r) {
      var ev = r.event || 'Ohne Event';
      if (!groups[ev]) groups[ev] = [];
      groups[ev].push(r);
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
    fetch('/api/register', {
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
  }

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
      openEventModal(null, dateStr);
    });

    return cell;
  }

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

      btnPublish.classList.remove('hidden');
      btnDelete.classList.remove('hidden');
      updatePublishBtn(ev);

      renderLinkedTasks(ev.id);
    } else {
      document.getElementById('modal-title').textContent = 'Neues Event';
      if (defaultDate) eventForm.dateFrom.value = defaultDate;
      btnPublish.classList.add('hidden');
      btnDelete.classList.add('hidden');
      renderLinkedTasks(null);
    }

    eventModal.classList.add('open');
  }

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
