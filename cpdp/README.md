# CPDP Panel — Intimate Unknowns: Sentiment

Kleine Webpräsenz für das CPDP Panel: Publikum scannt einen QR-Code, tippt
eine Frage ein, die Frage erscheint live auf dem Bühnen-Bildschirm als
schwebendes Pop-up-Fenster. Moderator:in kann die aktuelle Frage durch
Klick in den Vordergrund holen oder entfernen.

**Wichtig:** Dieser Ordner ist komplett unabhängig vom Rest des
`sentiment-exhibition` Projekts. Er nutzt nur einen Unterpfad `/cpdp/` und
greift auf nichts Bestehendes zu.

## URLs nach dem Deploy

- **Publikum (Handy):** `https://sentiment-exhibition.vercel.app/cpdp/`
- **Bühne (Beamer):** `https://sentiment-exhibition.vercel.app/cpdp/stage.html`

Den QR-Code für die Handy-URL generiert die Bühnen-Seite automatisch oben
rechts und groß in der Mitte (solange noch keine Frage da ist).

## Setup — Schritt für Schritt

### 1. Hintergrundbild speichern (optional)

Speichere das Panel-Poster (das violette Bild mit „INTIMATE UNKNOWNS /
Sentiment") als `bg.jpg` in diesem `cpdp/` Ordner. Wenn es nicht da ist,
zeigt die Bühne einfach den lila Verlauf — sieht auch gut aus.

### 2. Firebase-Projekt anlegen (≈5 Minuten)

Du brauchst einen Google-Account.

1. Gehe auf <https://console.firebase.google.com/>
2. Klicke **„Projekt hinzufügen"** → Name z.B. `sentiment-cpdp` →
   Google Analytics **deaktivieren** → **Projekt erstellen**.
3. Linkes Menü → **Build → Realtime Database** → **Datenbank erstellen** →
   Standort `europe-west1` → **„Im Testmodus starten"** wählen → fertig.
4. Linkes Menü → **Zahnrad ⚙ → Projekteinstellungen** → unter „Deine Apps"
   auf das **Web-Icon `</>`** klicken → App-Name z.B. `cpdp-stage` →
   **App registrieren** (Hosting NICHT aktivieren).
5. Du siehst jetzt ein Code-Snippet mit `const firebaseConfig = { ... }`.
   Kopiere die Werte (apiKey, authDomain, databaseURL, …).

### 3. Config eintragen

Öffne `cpdp/firebase-config.js` und füge die Werte ein:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza…",
  authDomain: "sentiment-cpdp.firebaseapp.com",
  databaseURL: "https://sentiment-cpdp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sentiment-cpdp",
  storageBucket: "sentiment-cpdp.appspot.com",
  messagingSenderId: "…",
  appId: "1:…:web:…"
};
```

> Diese Werte sind nicht geheim — sie identifizieren nur dein Projekt. Die
> Sicherheit kommt über die Regeln im nächsten Schritt.

### 4. Datenbank-Regeln einschränken

In der Firebase Console → **Realtime Database → Regeln** → ersetzen mit:

```json
{
  "rules": {
    "cpdp_questions": {
      ".read": true,
      ".write": true,
      "$qid": {
        ".validate": "newData.hasChildren(['text', 'timestamp']) && newData.child('text').isString() && newData.child('text').val().length <= 500 && newData.child('text').val().length > 0"
      }
    }
  }
}
```

→ **Veröffentlichen**.

Das erlaubt anonymes Lesen/Schreiben nur unterhalb von `cpdp_questions`
und begrenzt die Textlänge auf 500 Zeichen.

### 5. Deployen

```bash
git add cpdp/
git commit -m "Add CPDP panel Q&A app under /cpdp/"
git push
```

Vercel deployed automatisch. Nach 30–60 Sekunden ist die App live unter
`https://sentiment-exhibition.vercel.app/cpdp/`.

## Lokal testen (ohne Deploy)

In diesem Ordner:

```bash
npx serve .
```

oder Python:

```bash
python -m http.server 8000
```

Dann im Browser: `http://localhost:8000/` (Handy-Form) und
`http://localhost:8000/stage.html` (Bühne).

Wenn du Firebase noch nicht konfiguriert hast, läuft die App im
**Demo-Modus** mit `localStorage` — zwei Tabs im **selben** Browser sehen
die gleichen Fragen. Für das echte Setup mit mehreren Geräten brauchst du
Firebase (Schritt 2–4).

## Während der Veranstaltung

1. **Vorher:** Bühnen-URL (`/cpdp/stage.html`) im Browser im Vollbild
   (F11) öffnen, Beamer anschließen.
2. **Datenbank zurücksetzen:** In der Firebase Console → Realtime
   Database → den `cpdp_questions` Knoten löschen (Mülleimer-Icon).
3. **Während:**
   - Klick auf eine Frage → kommt nach vorne + wird größer
   - Klick auf das ✕ (nur sichtbar wenn fokussiert) → entfernt sie
   - ESC → Fokus aufheben
4. **Backup-Plan:** Wenn Internet ausfällt, läuft die App nicht. Die
   schon geladenen Fragen bleiben aber sichtbar bis Reload.

## Dateien in diesem Ordner

| Datei | Zweck |
|---|---|
| `index.html` | Handy-Formular (per QR-Code aufgerufen) |
| `stage.html` | Bühnen-Display mit schwebenden Fenstern |
| `style.css` | Geteilte Styles im Look des Panel-Posters |
| `firebase-config.js` | Firebase-Schlüssel (du füllst aus, Schritt 3) |
| `app-firebase.js` | Echtzeit-Datenlogik (Firebase + Demo-Modus) |
| `bg.jpg` | (Optional) Hintergrundbild für die Bühne |

## Tech-Stack

- Vanilla HTML/CSS/JS — kein Build, kein npm install
- Firebase Realtime Database (Free Tier reicht locker)
- QR-Code via `qrcode-generator` (CDN)
- Inter Font (Google Fonts)
