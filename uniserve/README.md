# UniServe — University Maintenance Management (frontend)

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · TanStack Router & Query · Axios · React Hook Form + Zod · Recharts · date-fns · Radix UI (shadcn-style components).

## Run it

```bash
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm run dev
```

Start the Express backend first (port 4000). Public registration always creates a `studentOrstaff` account; create an admin with the backend's `scripts/createAdmin.js`, then promote officers from **Admin → User Management**.

| Script                                        | Purpose                      |
| --------------------------------------------- | ---------------------------- |
| `npm run dev`                                 | Dev server                   |
| `npm run build`                               | Typecheck + production build |
| `npm run typecheck` / `lint` / `format:check` | Quality gates                |
| `npm test`                                    | Unit tests (Vitest)          |

## Structure

```
src/
  app/            providers, router (code-based, role-guarded), layouts, role navigation
  components/     ui/ (primitives), shared/ (DataTable, StatusBadge, dialogs, …)
  features/       auth · student · maintenance (officer) · admin · requests · users · reports
  services/       one Axios service module per domain (no React)
  lib/            api-client, query-client, query-keys, constants
  types/          domain + API types
  utils/          formatting, CSV, stats
docs/BACKEND_INTEGRATION.md   contract map, missing endpoints, backend issues
```

Routes: `/login` `/register` `/forgot-password` `/unauthorized` · `/student/{dashboard,requests,requests/new,requests/$id}` · `/officer/{dashboard,requests,requests/$id}` · `/admin/{dashboard,requests,requests/$id,users,users/$id,reports}`.

## Notes

- Route guards are UX only; every authorization decision is made by the backend.
- The token is stored in `localStorage` (simple, but readable by any XSS). Moving to an httpOnly cookie needs backend changes.
- Pending backend work and the flags that switch features on are in `docs/BACKEND_INTEGRATION.md`.
- There are no mock data or fake success paths in the app.
