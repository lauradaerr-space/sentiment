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

  /* ────── AUTH ────── */
  function checkAuth() {
    if (sessionStorage.getItem('sentiment-auth') === 'ok') showApp();
  }

  function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    loadData();
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
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

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

      for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = fmt(new Date(spec.year, spec.month, d));
        var dayEvents = data.events.filter(function (ev) {
          return dateStr >= ev.dateFrom && dateStr <= (ev.dateTo || ev.dateFrom);
        });

        var cell = document.createElement('div');
        cell.className = 'ov-mini-day' + (dayEvents.length ? ' has-event' : '');
        cell.textContent = d;

        if (dayEvents.length) {
          eventCount += dayEvents.length;
          var dot = document.createElement('span');
          dot.className = 'ov-dot';
          dot.style.background = catColor(dayEvents[0].category);
          cell.appendChild(dot);
        }
        grid.appendChild(cell);
      }

      card.appendChild(grid);

      var count = document.createElement('div');
      count.className = 'ov-month-count';
      count.textContent = eventCount + ' Event' + (eventCount !== 1 ? 's' : '');
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
      document.querySelectorAll('#tasks-filter .chip').forEach(function (c) {
        c.classList.toggle('active', c.dataset.cat === taskFilterCat);
      });
      renderTasks();
    });
  });

  function renderTasks() {
    var container = document.getElementById('tasks-list');
    container.innerHTML = '';

    var catsToShow = taskFilterCat === 'all'
      ? ALL_CATS
      : ALL_CATS.filter(function (c) { return c.key === taskFilterCat; });

    catsToShow.forEach(function (cat) {
      var catTasks = data.tasks.filter(function (t) { return t.category === cat.key; });
      if (taskFilterCat !== 'all' && catTasks.length === 0) {
        // Still show section even if empty when filtered
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

      if (catTasks.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'no-tasks';
        empty.textContent = 'Keine Aufgaben';
        section.appendChild(empty);
      } else {
        // Group tasks: linked to events vs unlinked
        var linked = {};
        var unlinked = [];

        catTasks.forEach(function (t) {
          if (t.linkedEventId) {
            if (!linked[t.linkedEventId]) linked[t.linkedEventId] = [];
            linked[t.linkedEventId].push(t);
          } else {
            unlinked.push(t);
          }
        });

        // Render linked groups
        Object.keys(linked).forEach(function (evId) {
          var ev = data.events.find(function (e) { return e.id === evId; });
          var group = document.createElement('div');
          group.className = 'task-event-group';

          var groupLabel = document.createElement('div');
          groupLabel.className = 'task-event-label';
          groupLabel.textContent = getEventTitle(ev);
          group.appendChild(groupLabel);

          linked[evId].forEach(function (task) {
            group.appendChild(createTaskItem(task));
          });
          section.appendChild(group);
        });

        // Render unlinked tasks
        unlinked.forEach(function (task) {
          section.appendChild(createTaskItem(task));
        });
      }

      container.appendChild(section);
    });
  }

  function createTaskItem(task) {
    var isDone = task.status === 'Erledigt';
    var row = document.createElement('div');
    row.className = 'task-item' + (isDone ? ' done' : '');

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

    var meta = document.createElement('div');
    meta.className = 'task-meta';

    if (task.who) {
      var who = document.createElement('span');
      who.className = 'task-who';
      who.textContent = task.who;
      meta.appendChild(who);
    }

    if (task.due) {
      var due = document.createElement('span');
      due.className = 'task-due';
      if (!isDone && task.due < fmt(new Date())) due.classList.add('overdue');
      due.textContent = formatDateShort(task.due);
      meta.appendChild(due);
    }

    var statusText = task.status || 'Offen';
    var badge = document.createElement('span');
    badge.className = 'task-status-badge ' + statusText.toLowerCase().replace(/ /g, '-');
    badge.textContent = statusText;
    meta.appendChild(badge);

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
    var order = ['Offen', 'In Bearbeitung', 'Erledigt'];
    task.status = order[(order.indexOf(task.status) + 1) % order.length];
    saveData();
    renderTasks();
  }

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

    if (id) {
      var t = data.tasks.find(function (tk) { return tk.id === id; });
      if (!t) return;
      document.getElementById('task-modal-title').textContent = 'Aufgabe bearbeiten';
      taskForm.title.value = t.title || '';
      taskForm.category.value = t.category || 'cpdp';
      taskForm.who.value = t.who || '';
      taskForm.due.value = t.due || '';
      taskForm.status.value = t.status || 'Offen';
      populateEventDropdown(t.linkedEventId || '');
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
    var fd = new FormData(taskForm);
    var obj = {};
    fd.forEach(function (v, k) { obj[k] = v; });

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
