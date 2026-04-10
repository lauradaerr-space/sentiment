/* ── SENTIMENT Admin ── */
(function () {
  'use strict';

  const PASSWORD = 'sentiment2026';
  const API = '/api/events';

  let data = { events: [], tasks: [] };
  let currentMonth = new Date();
  let editingEventId = null;
  let editingTaskId = null;

  /* ────── AUTH ────── */
  function checkAuth() {
    if (sessionStorage.getItem('sentiment-auth') === 'ok') {
      showApp();
    }
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
    var val = document.getElementById('pw-input').value;
    if (val === PASSWORD) {
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
          // legacy: plain events array — wrap it
          if (d.length > 0 && d[0].title !== undefined && !d[0].due) {
            data = { events: d, tasks: [] };
          } else {
            data = { events: [], tasks: [] };
          }
        } else {
          data = { events: d.events || [], tasks: d.tasks || [] };
        }
        renderCalendar();
        renderTasks();
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
      .then(function (r) {
        setSyncStatus(r.ok ? 'ok' : 'error');
      })
      .catch(function () { setSyncStatus('error'); });
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

  /* ────── CALENDAR ────── */
  var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

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
    var startDay = (first.getDay() + 6) % 7; // Monday = 0
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevDays = new Date(year, month, 0).getDate();

    var container = document.getElementById('cal-days');
    container.innerHTML = '';

    var today = new Date();
    var todayStr = fmt(today);

    // Previous month days
    for (var i = startDay - 1; i >= 0; i--) {
      var d = prevDays - i;
      var date = new Date(year, month - 1, d);
      container.appendChild(createDayCell(date, true));
    }

    // Current month days
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var cell = createDayCell(date, false);
      if (fmt(date) === todayStr) cell.classList.add('today');
      container.appendChild(cell);
    }

    // Fill remaining cells to complete grid
    var total = container.children.length;
    var rows = Math.ceil(total / 7);
    var remaining = rows * 7 - total;
    for (var i = 1; i <= remaining; i++) {
      var date = new Date(year, month + 1, i);
      container.appendChild(createDayCell(date, true));
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
      var chip = document.createElement('div');
      chip.className = 'cal-event cat-' + (ev.category || 'cpdp') + (ev.published ? '' : ' unpublished');

      var titleText = ev.title || 'Event';
      if (ev.time) titleText = ev.time + ' ' + titleText;

      var badge = document.createElement('span');
      badge.className = 'pub-badge ' + (ev.published ? 'published' : 'unpublished');
      badge.textContent = ev.published ? 'Live' : 'Entwurf';

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

  function fmt(d) {
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
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
      updatePublishBtn(ev.published);
    } else {
      document.getElementById('modal-title').textContent = 'Neues Event';
      if (defaultDate) eventForm.dateFrom.value = defaultDate;
      btnPublish.classList.add('hidden');
      btnDelete.classList.add('hidden');
    }

    eventModal.classList.add('open');
  }

  function updatePublishBtn(published) {
    if (published) {
      btnPublish.textContent = 'Unveröffentlichen';
      btnPublish.classList.add('is-published');
    } else {
      btnPublish.textContent = 'Veröffentlichen';
      btnPublish.classList.remove('is-published');
    }
  }

  function closeEventModal() {
    eventModal.classList.remove('open');
    editingEventId = null;
  }

  document.getElementById('modal-close').addEventListener('click', closeEventModal);
  document.getElementById('btn-cancel').addEventListener('click', closeEventModal);
  eventModal.addEventListener('click', function (e) {
    if (e.target === eventModal) closeEventModal();
  });

  btnPublish.addEventListener('click', function () {
    if (!editingEventId) return;
    var ev = data.events.find(function (e) { return e.id === editingEventId; });
    if (!ev) return;
    ev.published = !ev.published;
    updatePublishBtn(ev.published);
    saveData();
    renderCalendar();
  });

  btnDelete.addEventListener('click', function () {
    if (!editingEventId) return;
    if (!confirm('Event wirklich löschen?')) return;
    data.events = data.events.filter(function (e) { return e.id !== editingEventId; });
    saveData();
    closeEventModal();
    renderCalendar();
  });

  eventForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(eventForm);
    var obj = {};
    fd.forEach(function (v, k) { obj[k] = v; });
    if (obj.capacity) obj.capacity = parseInt(obj.capacity, 10);

    if (editingEventId) {
      var ev = data.events.find(function (e) { return e.id === editingEventId; });
      if (ev) {
        Object.keys(obj).forEach(function (k) { ev[k] = obj[k]; });
      }
    } else {
      obj.id = 'evt-' + Date.now();
      obj.published = false;
      data.events.push(obj);
    }

    saveData();
    closeEventModal();
    renderCalendar();
  });

  /* ────── TASKS ────── */
  var TASK_CATEGORIES = [
    { key: 'cpdp',  label: 'CPDP Brüssel',     color: 'var(--cat-cpdp)' },
    { key: 'koeln', label: 'Ausstellung Köln',  color: 'var(--cat-koeln)' },
    { key: 'pub',   label: 'Publikation',        color: 'var(--cat-pub)' },
    { key: 'pr',    label: 'PR / Social',        color: 'var(--cat-pr)' }
  ];

  function renderTasks() {
    var container = document.getElementById('tasks-list');
    container.innerHTML = '';

    TASK_CATEGORIES.forEach(function (cat) {
      var tasks = data.tasks.filter(function (t) { return t.category === cat.key; });

      var section = document.createElement('div');
      section.className = 'task-category';

      var header = document.createElement('div');
      header.className = 'task-category-header';
      var dot = document.createElement('span');
      dot.className = 'task-category-dot';
      dot.style.background = cat.color;
      header.appendChild(dot);
      header.appendChild(document.createTextNode(cat.label + ' (' + tasks.length + ')'));
      section.appendChild(header);

      if (tasks.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'no-tasks';
        empty.textContent = 'Keine Aufgaben';
        section.appendChild(empty);
      }

      tasks.forEach(function (task) {
        section.appendChild(createTaskItem(task));
      });

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

  function formatDateShort(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    return parts[2] + '.' + parts[1] + '.';
  }

  function toggleTaskStatus(id) {
    var task = data.tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    var order = ['Offen', 'In Bearbeitung', 'Erledigt'];
    var idx = order.indexOf(task.status);
    task.status = order[(idx + 1) % order.length];
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

  function openTaskModal(id) {
    editingTaskId = id;
    taskForm.reset();

    if (id) {
      var t = data.tasks.find(function (tk) { return tk.id === id; });
      if (!t) return;
      document.getElementById('task-modal-title').textContent = 'Aufgabe bearbeiten';
      taskForm.title.value = t.title || '';
      taskForm.category.value = t.category || 'cpdp';
      taskForm.who.value = t.who || '';
      taskForm.due.value = t.due || '';
      taskForm.status.value = t.status || 'Offen';
      taskBtnDelete.classList.remove('hidden');
    } else {
      document.getElementById('task-modal-title').textContent = 'Neue Aufgabe';
      taskBtnDelete.classList.add('hidden');
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
      if (t) {
        Object.keys(obj).forEach(function (k) { t[k] = obj[k]; });
      }
    } else {
      obj.id = 'task-' + Date.now();
      data.tasks.push(obj);
    }

    saveData();
    closeTaskModal();
    renderTasks();
  });

  /* ────── API data shape ────── */
  // The API stores { events: [...], tasks: [...] } as the top-level payload.
  // saveData sends POST { events: { events: [...], tasks: [...] } }
  // because the API handler expects req.body.events as the value to persist.

  /* ────── INIT ────── */
  checkAuth();
})();
