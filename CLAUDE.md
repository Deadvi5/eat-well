# Hospital Canteen App — Master Context

## Project overview

A PWA for a hospital canteen that lets employees and patients browse the daily menu, order meals, book a pickup slot, and pay via the app. Admins manage the menu and monitor orders.

## Tech stack

- React 18 + TypeScript (strict mode)
- Vite + vite-plugin-pwa
- Tailwind CSS v3 (no external UI libraries)
- React Router v6
- React Context for global state
- qrcode.react for QR code generation
- localStorage / sessionStorage for persistence
- Zero real API calls — everything in-memory or mocked

## Key design decisions

- Mobile-first layout: bottom nav on mobile, sidebar on desktop (≥768px)
- Three user roles: `employee`, `patient`, `admin`
- No backend — all data lives in React Context, seeded from mock JSON
- TypeScript strict mode — no `any`
- All components small and reusable

## Brand

- Name: "Mensa Ospedale Sant'Orsola"
- Primary color: #1E6FBF (blue)
- Accent color: #2E9E6B (green)
- Background: #ffffff

## Task files

Execute tasks in order. Each file is self-contained.

| File | Description |
|------|-------------|
| task-01-setup.md | Vite project scaffold, Tailwind, routing, layout shell |
| task-02-data.md | TypeScript types + full mock dataset |
| task-03-auth.md | Auth context + login page with role switching |
| task-04-menu.md | Daily menu page with filters |
| task-05-cart.md | Cart context + dish selection UX |
| task-06-booking.md | 3-step order flow (summary → pickup → payment) |
| task-07-confirmation.md | Order confirmation page + QR code |
| task-08-history.md | Order history page |
| task-09-profile.md | Profile page + dietary preferences |
| task-10-notifications.md | Push notifications + toast system |
| task-11-admin-menu.md | Admin: menu management panel |
| task-12-admin-orders.md | Admin: orders dashboard + kanban |
| task-13-pwa.md | PWA manifest + service worker + install banner |
| task-14-polish.md | Onboarding, empty states, responsive fixes, demo data |

## Execution rules

- Complete and verify each task before starting the next
- After each task run `npm run dev` and confirm no console errors
- Make reasonable decisions without asking for clarification
- Keep components in `src/components/`, pages in `src/pages/`, context in `src/context/`
- All mock data must live in `src/data/mockData.ts` — never hardcode in components
