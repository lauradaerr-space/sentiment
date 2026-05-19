# CPDP Panel — Intimate Unknowns: Sentiment

A small web app for the CPDP panel: the audience scans a QR code, types a
question on their phone, and the question appears live on the stage screen
as a floating pop-up window. The moderator can click a question to bring
it to the front, or remove it.

This folder lives at `/cpdp/` on the existing `sentiment-exhibition`
deployment and reuses the same Vercel + GitHub setup. No new services,
no new accounts.

## URLs

- **Audience (phone):** `https://sentiment-exhibition.vercel.app/cpdp/`
- **Stage (projector):** `https://sentiment-exhibition.vercel.app/cpdp/stage.html`

The stage page generates the QR code (top-right corner) for the phone URL
automatically.

## How it works

- Questions are stored in `data/cpdp-questions.json` in this repo.
- The serverless endpoint `api/cpdp-questions.js` reads / writes that file
  using the same `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_TOKEN` env vars
  that `api/events.js` already uses on Vercel.
- Every write commit contains `[skip ci]` so Vercel does **not** redeploy
  on each question — your live site stays untouched.
- The stage page polls `/api/cpdp-questions` every 2 seconds. New
  questions appear with up to ~2 s delay.

## During the event

1. **Before:** Open the stage URL (`/cpdp/stage.html`) in your browser in
   fullscreen (F11) and connect the projector.
2. **Reset:** To start fresh, delete `data/cpdp-questions.json` from the
   repo (or empty it to `[]`) before the panel.
3. **During:**
   - Click a question → moves to the front + scales up
   - Click the ✕ (only visible when focused) → removes it
   - ESC → unfocus
4. **Background image:** `bg.png` is the panel poster. Remove the file to
   fall back to the plain purple gradient.

## Files

| File | Purpose |
|---|---|
| `cpdp/index.html` | Phone form (opened via QR code) |
| `cpdp/stage.html` | Stage display with floating windows |
| `cpdp/style.css` | Shared styles in the panel poster look |
| `cpdp/app-store.js` | Client logic (POST / GET via fetch + polling) |
| `cpdp/bg.png` | Stage background image (panel poster) |
| `api/cpdp-questions.js` | Vercel serverless endpoint (GitHub-backed storage) |
| `data/cpdp-questions.json` | Where questions are stored (created on first POST) |

## Required Vercel env vars

These should **already be set** for `api/events.js`:

- `GITHUB_OWNER` — e.g. `lauradaerr-space`
- `GITHUB_REPO` — `sentiment`
- `GITHUB_TOKEN` — a personal access token with `repo` scope

If `api/cpdp-questions` returns `500 GitHub env vars not configured`,
verify them in Vercel → Project Settings → Environment Variables.

## Tech stack

- Vanilla HTML/CSS/JS — no build step
- Vercel serverless function (Node)
- GitHub Contents API as the storage layer
- QR codes via `qrcode-generator` (CDN)
- Inter font (Google Fonts)
