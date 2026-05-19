// ============================================================
// CPDP question store — talks to /api/cpdp-questions.
// Exposes window.QStore with:
//   .submit({ text, name }) → Promise
//   .dismiss(id)            → Promise
//   .subscribe(callback)    → callback(questions[]) every poll
//   .mode                   → "api"
// Stage page polls every POLL_MS; mobile page just calls submit().
// ============================================================

(function () {
  const ENDPOINT = '/api/cpdp-questions';
  const POLL_MS = 2000;

  const listeners = [];
  let lastSignature = null;
  let pollTimer = null;

  function signature(items) {
    return items.length + ':' + items.map(q => q.id).join(',');
  }

  async function fetchAll() {
    const r = await fetch(ENDPOINT, { cache: 'no-store' });
    if (!r.ok) throw new Error('GET failed: ' + r.status);
    const data = await r.json();
    const items = Array.isArray(data.questions) ? data.questions : [];
    items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return items;
  }

  async function pollOnce() {
    try {
      const items = await fetchAll();
      const sig = signature(items);
      if (sig !== lastSignature) {
        lastSignature = sig;
        listeners.forEach(fn => fn(items));
      }
    } catch (e) {
      console.warn('[cpdp] poll failed:', e.message);
    }
  }

  function startPolling() {
    if (pollTimer) return;
    pollOnce();
    pollTimer = setInterval(pollOnce, POLL_MS);
  }

  window.QStore = {
    mode: 'api',

    async submit({ text, name }) {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error || ('POST failed: ' + r.status));
      }
      return r.json();
    },

    async dismiss(id) {
      const r = await fetch(ENDPOINT + '?id=' + encodeURIComponent(id), {
        method: 'DELETE',
      });
      if (!r.ok) throw new Error('DELETE failed: ' + r.status);
      // Refresh immediately so the stage view reflects the deletion
      pollOnce();
    },

    subscribe(fn) {
      listeners.push(fn);
      startPolling();
    },
  };
})();
