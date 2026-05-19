# CPDP Panel — Intimate Unknowns: Sentiment

A small web app for the CPDP panel: the audience scans a QR code, types a
question on their phone, and the question appears live on the stage screen
as a floating pop-up window. The moderator can click a question to bring
it to the front, or remove it.

**Important:** This folder is fully independent from the rest of the
`sentiment-exhibition` project. It only lives at the subpath `/cpdp/` and
does not touch anything existing.

## URLs after deploy

- **Audience (phone):** `https://sentiment-exhibition.vercel.app/cpdp/`
- **Stage (projector):** `https://sentiment-exhibition.vercel.app/cpdp/stage.html`

The stage page automatically generates the QR code for the phone URL —
small in the top-right corner, and large in the center while no question
has been asked yet.

## Setup — step by step

### 1. Save the background image (optional)

The panel poster (the violet image with “INTIMATE UNKNOWNS / Sentiment”)
is included as `bg.png`. The stage page picks it up automatically. If
you remove the file, the stage falls back to the purple gradient.

### 2. Create a Firebase project (≈5 minutes)

You need a Google account.

1. Go to <https://console.firebase.google.com/>
2. Click **“Add project”** → name it e.g. `sentiment-cpdp` → **disable**
   Google Analytics → **Create project**.
3. Left menu → **Build → Realtime Database** → **Create Database** →
   location `europe-west1` → choose **“Start in test mode”** → done.
4. Left menu → **Gear ⚙ → Project settings** → under “Your apps”, click
   the **Web icon `</>`** → app nickname e.g. `cpdp-stage` →
   **Register app** (do NOT enable Firebase Hosting).
5. You now see a code snippet with `const firebaseConfig = { ... }`. Copy
   the values (apiKey, authDomain, databaseURL, …).

### 3. Paste your config

Open `cpdp/firebase-config.js` and fill in the values:

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

> These values are not secret — they only identify your project. Security
> comes from the rules in the next step.

### 4. Restrict the database rules

In the Firebase Console → **Realtime Database → Rules** → replace with:

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

→ **Publish**.

This allows anonymous read/write only under `cpdp_questions` and caps
the text length at 500 characters.

### 5. Deploy

```bash
git add cpdp/
git commit -m "Update CPDP panel config"
git push
```

Vercel will redeploy automatically. After 30–60 seconds the app is live
at `https://sentiment-exhibition.vercel.app/cpdp/`.

## During the event

1. **Before:** Open the stage URL (`/cpdp/stage.html`) in your browser in
   fullscreen (F11) and connect the projector.
2. **Reset the database:** In the Firebase Console → Realtime Database →
   delete the `cpdp_questions` node (trash icon).
3. **During:**
   - Click a question → moves to the front + scales up
   - Click the ✕ (only visible when focused) → removes it
   - ESC → unfocus
4. **Fallback:** If the internet drops, the app stops syncing. Already
   loaded questions stay visible until the page is reloaded.

## Files in this folder

| File | Purpose |
|---|---|
| `index.html` | Phone form (opened via QR code) |
| `stage.html` | Stage display with floating windows |
| `style.css` | Shared styles in the panel poster look |
| `firebase-config.js` | Firebase keys (you fill in, step 3) |
| `app-firebase.js` | Realtime data layer (Firebase + demo fallback) |
| `bg.png` | Stage background image (panel poster) |

## Tech stack

- Vanilla HTML/CSS/JS — no build step, no `npm install`
- Firebase Realtime Database (free tier is more than enough)
- QR codes via `qrcode-generator` (CDN)
- Inter font (Google Fonts)
