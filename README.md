# Personal Finance Tracker

A full-stack personal finance and expense tracking application.

## Features
- JWT authentication (register, login, logout)
- Dashboard with income/expense summary cards and charts (pie + bar via Recharts)
- Transactions: add, edit, delete; filter by type/category/date range; pagination
- Categories: full CRUD, scoped per user (income & expense types)
- Reports API: summary totals and spend grouped by category
- Responsive layout (mobile + desktop)

## Architecture

```
Browser (React + Vite :5173)
    │  Axios calls → /api/*  (proxied to backend in dev)
    ▼
Express API (Node.js :5000)
    │  TypeORM EntityManager / Repository
    ▼
PostgreSQL database
```

- **Frontend** → Vite proxy forwards `/api` to `localhost:5000` in development
- **Backend** uses TypeORM with `synchronize: true` in dev (auto-creates tables)
- JWT stored in `localStorage`; sent as `Authorization: Bearer <token>` header

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router v6, TanStack Query v5, Axios, Recharts |
| Backend | Node.js, Express.js, TypeORM, `pg` (PostgreSQL driver) |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Zod |

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Create the database
```bash
psql -U postgres -c "CREATE DATABASE finance_tracker;"
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # edit DB credentials in .env
npm run dev              # starts on http://localhost:5000
```

TypeORM will auto-create tables on first run (`synchronize: true`).

### 3. Seed demo data (optional)
```bash
cd backend
npm run db:seed
# Demo login: demo@example.com / demo1234
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev              # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | ✓ | Current user info |
| GET | /api/categories | ✓ | List user categories |
| POST | /api/categories | ✓ | Create category |
| PUT | /api/categories/:id | ✓ | Update category |
| DELETE | /api/categories/:id | ✓ | Delete category |
| GET | /api/transactions | ✓ | List with pagination & filters |
| POST | /api/transactions | ✓ | Create transaction |
| PUT | /api/transactions/:id | ✓ | Update transaction |
| DELETE | /api/transactions/:id | ✓ | Delete transaction |
| GET | /api/reports/summary | ✓ | Income/expense/net totals |
| GET | /api/reports/by-category | ✓ | Spend grouped by category |

### Query params for GET /api/transactions
- `page`, `limit` — pagination (default 1, 20)
- `type` — `income` or `expense`
- `category` — category id
- `startDate`, `endDate` — `YYYY-MM-DD`
- `sort` — `ASC` or `DESC` (default DESC)

## Design Decisions

- **TypeORM `EntitySchema`** (plain JS, no decorators/TypeScript needed) keeps the codebase lightweight
- **`synchronize: true` in dev** — tables are auto-created; for production use migrations
- **JWT in localStorage** — simple for a personal-use app; use httpOnly cookies for higher security requirements
- **Zod validation** on every mutating route with centralized error middleware
- **TanStack Query** manages all server state, cache invalidation, and loading/error states on the frontend
- **Vite proxy** in dev so frontend and backend appear same-origin, avoiding CORS preflight issues

## Deployment

### Backend (Render / Railway)
1. Set environment variables (`DB_HOST`, `DB_PORT`, etc.) in the platform dashboard
2. Set `NODE_ENV=production` and `synchronize=false` — run migrations instead
3. Build command: `npm install`; Start command: `node src/index.js`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL=https://your-backend.render.com` (and update the Vite proxy / Axios baseURL accordingly)
2. Build command: `npm run build`; Publish directory: `dist`



