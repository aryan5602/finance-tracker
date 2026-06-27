# Finance Tracker

A personal finance app I built to track income, expenses and spending habits. You can log transactions, organise them by category, and see a breakdown of where your money is going through a dashboard with charts.

**Live demo:** https://finance-tracker-one-peach.vercel.app
**Test credentials:** aryan@test.com / aryan5602

---

## What it does

- Register and log in — each user's data is fully isolated
- Add, edit and delete transactions with a type (income/expense), category, amount and date
- Create your own categories per type so the data fits your actual spending
- Dashboard shows total income, total expenses and net balance for any date range, plus a pie chart and bar chart of spending by category
- Filter transactions by category, type or date range and paginate through them
- Works on mobile and desktop

## Tech

**Frontend** — React 18, Vite, React Router, TanStack Query, Axios, Recharts

**Backend** — Node.js, Express, TypeScript, TypeORM, PostgreSQL

**Auth** — JWT (stored in localStorage), bcryptjs for password hashing

**Validation** — Zod on all incoming request bodies

**Deployed on** — Render (API) + Neon (Postgres) + Vercel (frontend)

## How it's structured

```
frontend/   React app (Vite)
backend/    Express REST API (TypeScript)
```

The frontend makes all API calls to `/api/*`. In development Vite proxies these to `localhost:5000` so there are no CORS issues and no hardcoded URLs. In production the `VITE_API_URL` env var points Axios at the deployed backend.

On the backend, routes go through Zod validation middleware before hitting the controller. Auth is a simple JWT middleware that reads the `Authorization` header. TypeORM handles all DB queries using class-based entities with decorators.

## Running locally

You'll need Node 18+ and a local Postgres instance.

```bash
# create the database
psql -U postgres -c "CREATE DATABASE finance_tracker;"
```

```bash
# backend
cd backend
npm install
cp .env.example .env    # fill in your DB details
npm run dev             # http://localhost:5000
```

```bash
# frontend (separate terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

TypeORM will create the tables automatically on first run in development.

Optionally seed some sample data:

```bash
cd backend
npm run db:seed
# logs in as demo@example.com / demo1234
```

## API

All routes except `/api/auth/register` and `/api/auth/login` require a `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, get JWT |
| GET | /api/auth/me | Current user |
| GET | /api/categories | List categories |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| GET | /api/transactions | List (paginated + filtered) |
| POST | /api/transactions | Create transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/reports/summary | Income / expense / net totals |
| GET | /api/reports/by-category | Spend grouped by category |

`GET /api/transactions` accepts: `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `sort`

## A few decisions worth noting

**TypeORM over raw SQL** — I wanted typed entities and a clean repository pattern without writing boilerplate query builders everywhere. The decorator-based approach maps well to the schema and makes relationships easy to reason about.

**TanStack Query for all server state** — it handles caching, background refetching and invalidation automatically. After any mutation (add/edit/delete) the relevant queries are invalidated so the UI stays in sync without manual state juggling.

**Zod validation in middleware** — instead of checking inputs inside each controller I pass a Zod schema to a `validate()` middleware. Validation errors get caught by the central error handler and return a consistent 400 response with field-level detail.

**JWT in localStorage** — straightforward for a personal tool. The tradeoff is XSS exposure vs the complexity of httpOnly cookie rotation. For this use case localStorage is fine.
