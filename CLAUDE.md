# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test suite is configured.

## Architecture

**Keilim** is a React 19 + TypeScript + Vite SPA for looking up the halachos (Jewish laws) of Tevilas Keilim (immersing utensils in a mikveh). It uses React Router v7, Tailwind CSS v4, and has no backend — all data is static.

### Data layer

All utensil data lives in [src/data/utensils.ts](src/data/utensils.ts) as a plain exported array `UTENSILS: Utensil[]`. The core types are:

- `Utensil` — `{ id, name, category, tevila, brocha, notes?, debates?, tags? }`
- `Need` — `"yes" | "no" | "varies"` (used for both `tevila` and `brocha` fields)
- `Category` — one of six string literals (`"electric"`, `"cooking"`, `"tableware"`, `"food-prep"`, `"drinks-bottles"`, `"storage-misc"`)
- `CATEGORY_META` — display metadata (label, icon, description) keyed by `Category`

To add a new utensil, push an entry into the `UTENSILS` array with a unique `id` string. The `id` also doubles as the image filename (see below).

### Image mapping

[src/utils/utensilImages.ts](src/utils/utensilImages.ts) uses `import.meta.glob` to eagerly load all images from `src/assets/utensils/*.{jpg,jpeg,png}` and builds a map of `id → URL` by stripping the file extension from the filename. To add an image for a utensil, place a file at `src/assets/utensils/<utensil-id>.jpg` (or `.png`).

### Routing

Defined in [src/App.tsx](src/App.tsx):

| Path | Component |
|------|-----------|
| `/` | `Home` — searchable, filterable utensil grid |
| `/utensil/:id` | `UtensilDetail` — detail view for one utensil |
| `/procedure` | `Procedure` — step-by-step immersion procedure |
| `/rules` | `BasicRules` — general halachic rules |
| `/materials` | `Materials` — tevila requirements by material type |

`TopBar` (also in `App.tsx`) is a sticky responsive nav with a back arrow on non-home routes.

### Styling

Tailwind CSS v4 via PostCSS. The `no-scrollbar` utility class is used on horizontal scroll containers (category pills, mobile nav).
