# Keilim (Next.js Kiosk)

This app now runs on Next.js and loads utensils dynamically from Google Sheets, using server and browser offline caches to keep the kiosk usable without internet.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Spreadsheet Data Source

Create `.env.local` from `.env.example` and set:

- `GOOGLE_SHEETS_ID`
- `GOOGLE_API_KEY`
- `SHEET_RANGE` (default: `Sheet1!A:I1000`)

Expected Google Sheet columns (row 1 is header):

1. `id`
2. `name`
3. `category`
4. `tevila` (`yes` | `no` | `varies`)
5. `brocha` (`yes` | `no` | `varies`)
6. `notes`
7. `debates`
8. `tags` (comma/semicolon separated)
9. `image_url` (optional direct image URL)

## Offline Persistence Behavior

- While online, the server fetches Google Sheets data and writes it to `data/utensils-cache.json`.
- While offline, the server serves the last successful local cache file.
- If no local cache exists yet, the API returns unavailable until the first successful sheet sync.
- The homepage also stores the latest payload in browser `localStorage` to improve client-side offline resilience.

## PWA + Service Worker

- The app registers a service worker at `public/sw.js`.
- App shell routes and static assets are cached for offline reloads.
- `/api/utensils` uses network-first with cache fallback.
- Manifest file: `public/manifest.webmanifest`.

## Hidden Maintenance Tap Sequence

- Tap the `Keilim` title 7 times within 8 seconds to open the maintenance panel.
- Maintenance panel actions:
	- `Sync from Sheet` (forces `/api/utensils?refresh=1` and updates local cache)
	- `Update Offline App` (service worker update check)
	- `Clear Device Cache`
	- `Reload Kiosk`

## Free Android Kiosk Lock (No EloView)

For a free lock-down path, use Android app pinning:

1. Open Android Settings.
2. Enable `App pinning` under Security.
3. Launch your kiosk app/browser.
4. Open Recents/Overview and choose `Pin`.
5. Set a device PIN/password so only operators can unpin.

For stronger lock-down, use an Android wrapper app + device-owner provisioning with `adb dpm set-device-owner`.

## WLED Timed Pattern Override

The app includes a WLED control page at `/lights`.

- Users can select a preset from `WLED_ALLOWED_PRESETS`.
- The selected preset is active for `WLED_OVERRIDE_MINUTES` (default 5).
- After the timer expires, the server automatically reverts WLED to `WLED_DEFAULT_PRESET`.

Configure in `.env.local`:

- `WLED_BASE_URL` (example: `http://192.168.1.50`)
- `WLED_DEFAULT_PRESET` (example: `1`)
- `WLED_ALLOWED_PRESETS` (comma-separated, example: `2,3,4,5`)
- `WLED_OVERRIDE_MINUTES` (default `5`)

Implementation note:

- The timer is server-process memory. If the server restarts, any active override timer is lost.
