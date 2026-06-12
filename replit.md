# UEMF University Management System

A full-featured university management platform for Université Euro-Méditerranéenne de Fès (UEMF), covering student records, courses, faculty, departments, grades, schedules, exams, fees, and announcements.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/university-app run dev` — run the React frontend (port 22006, served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, Recharts, React Query, wouter, react-hook-form + zod
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI 3.0 spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle ORM schemas (departments, faculty, students, courses, enrollments, grades, schedules, exams, fees, announcements)
- `artifacts/api-server/src/routes/` — Express route handlers (one file per module)
- `artifacts/university-app/src/pages/` — React page components
- `artifacts/university-app/src/components/` — Layout, StatCard, StatusBadge, PageHeader
- `lib/api-client-react/src/generated/` — Auto-generated React Query hooks
- `lib/api-zod/src/generated/` — Auto-generated Zod schemas

## Architecture decisions

- Contract-first: OpenAPI spec drives both server validation and client hook generation via Orval
- Microservices-style: API server is separate artifact from the React frontend; shared proxy routes `/api` to port 8080 and `/` to port 22006
- All Express routes are registered flat (no nested routers) to avoid Express path conflicts
- `fees/stats` route defined before `fees/:id` in the fees router (Express ordering issue)
- Codegen post-patch: `lib/api-spec/package.json` patches `lib/api-zod/src/index.ts` after Orval runs to only export `./generated/api`

## Product

- **Dashboard** — real-time stats (students, faculty, courses, departments, enrollments, pending fees, upcoming exams, avg GPA), enrollment trends chart, department distribution pie chart, recent activity feed
- **Students** — full CRUD, search, filter by department/status, student detail view with grades & enrollments
- **Courses** — full CRUD, search by name/code, filter by department, enrollment count
- **Faculty** — full CRUD, search, filter by department, office info, course count
- **Departments** — card layout with student/faculty/course counts per department
- **Enrollments** — enroll/drop students from courses, filter by semester
- **Grades** — record and manage grades, auto letter-grade from score (A+…F), color-coded
- **Schedules** — weekly timetable with room assignments and day-color coding
- **Exams** — upcoming/past exam split view, date, time, room, type, instructions
- **Fees** — MAD fee tracking with collection stats, status filtering (paid/pending/overdue/waived)
- **Announcements** — card layout with priority border colors, category/audience/priority badges

## User preferences

- Brand colors: sidebar navy `hsl(220 55% 13%)`, primary green `hsl(146 50% 36%)`, background off-white `hsl(210 20% 98%)`
- Currency: MAD (Moroccan Dirham)
- Language: English interface, Moroccan context (UEMF, Fès)

## Gotchas

- Radix UI Select: `SelectItem` cannot have `value=""` — use sentinel strings like `"__all__"` or `"__none__"` for optional/filter select items
- Run `pnpm --filter @workspace/db run push` after any schema change
- Run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- API server must be rebuilt before new routes are live (workflow auto-rebuilds on restart)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `lib/api-spec/openapi.yaml` for all API contracts
