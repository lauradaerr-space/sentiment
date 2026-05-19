// ============================================================
// Shared Firebase wiring for mobile + stage.
// Exposes window.QStore with:
//   .submit({ text, name }) → Promise
//   .subscribe(callback)    → callback(questions[]) on every change
//   .mode                   → "firebase" | "demo"
// In demo mode (no Firebase config), uses localStorage with the
// `storage` event so two tabs on the same browser still sync.
// ============================================================

(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const hasFirebase = !!(cfg.apiKey && cfg.databaseURL);

  if (hasFirebase) {
    initFirebase();
  } else {
    initDemo();
    console.warn(
      "[cpdp] Firebase not configured — demo mode using localStorage. " +
      "See README.md, step 3."
    );
  }

  function initFirebase() {
    firebase.initializeApp(cfg);
    const db = firebase.database();
    const ref = db.ref("cpdp_questions");

    const listeners = [];

    ref.on("value", (snap) => {
      const val = snap.val() || {};
      const items = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      listeners.forEach((fn) => fn(items));
    });

    window.QStore = {
      mode: "firebase",
      async submit({ text, name }) {
        const payload = {
          text: String(text).slice(0, 500),
          name: name ? String(name).slice(0, 60) : "",
          timestamp: Date.now(),
        };
        await ref.push(payload);
      },
      async dismiss(id) {
        await ref.child(id).remove();
      },
      subscribe(fn) {
        listeners.push(fn);
      },
    };
  }

  function initDemo() {
    const KEY = "cpdp_questions_demo";
    const listeners = [];

    function read() {
      try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
      } catch (_) {
        return [];
      }
    }

    function write(items) {
      localStorage.setItem(KEY, JSON.stringify(items));
      listeners.forEach((fn) => fn(items.slice()));
    }

    window.addEventListener("storage", (e) => {
      if (e.key === KEY) {
        const items = read();
        listeners.forEach((fn) => fn(items.slice()));
      }
    });

    window.QStore = {
      mode: "demo",
      async submit({ text, name }) {
        const items = read();
        items.push({
          id: "demo_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
          text: String(text).slice(0, 500),
          name: name ? String(name).slice(0, 60) : "",
          timestamp: Date.now(),
        });
        write(items);
      },
      async dismiss(id) {
        const items = read().filter((q) => q.id !== id);
        write(items);
      },
      subscribe(fn) {
        listeners.push(fn);
        fn(read());
      },
    };
  }
})();
