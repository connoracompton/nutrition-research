# Nutrition Log - research sample app

A small full-stack app built to try out the stack our team is considering for the
nutrition tracker: **React + Vite**, **Node.js + Express**, **PostgreSQL + Prisma**,
**JWT auth**, the **USDA FoodData Central** API, and **Recharts**.

What it does:

- Create an account, log in, log out (passwords hashed with bcrypt, sessions via JWT)
- Search real foods by name (USDA FoodData Central, called from the server)
- Log a food to breakfast, lunch, dinner, or snack for any day
- Edit the amount of a logged food, or delete it
- See daily totals for calories, protein, carbs, fat, fiber, and sodium, with a chart
  of each as a percentage of a reference daily target

## Run it

You need Node 20+ and PostgreSQL running locally.

```bash
# 1. Database (once)
createdb nutrition_dev

# 2. Server
cd server
npm install
# open .env and paste your USDA key (copy .env.example to .env if it is missing)
npx prisma migrate dev --name init   # creates the tables from prisma/schema.prisma
npx prisma generate                  # builds the typed database client
npm run dev                          # http://localhost:3001

# 3. Client (second terminal)
cd client
npm install
npm run dev                          # http://localhost:5173
```

`server/.env` holds the USDA key, database URL, and token secret. It is listed in
`.gitignore` so it never reaches GitHub. Free USDA keys:
<https://fdc.nal.usda.gov/api-key-signup>. Without one the server falls back to the
heavily rate-limited `DEMO_KEY`.

## How it fits together

```
browser (React, :5173) --/api/*--> Express (:3001) --Prisma--> PostgreSQL
                                        |
                                        +--fetch--> USDA FoodData Central
```

| Path | What lives there |
| --- | --- |
| `client/src/api.js` | One `fetch` wrapper: attaches the token, turns errors into messages |
| `client/src/App.jsx` | Holds login state and the selected day; re-fetches the day after each change |
| `client/src/components/` | `AuthForm`, `FoodSearch`, `DayLog`, `Totals` (Recharts) |
| `client/vite.config.js` | Dev proxy that forwards `/api` to Express |
| `server/src/index.js` | Express routes for search and the food log, plus totals calculation |
| `server/src/auth.js` | Register, login, and the `requireAuth` middleware |
| `server/src/usda.js` | USDA search + mapping USDA nutrient ids to our field names |
| `server/src/db.js` | The shared Prisma client |
| `server/prisma/schema.prisma` | Table definitions (`User`, `FoodLog`) |

### API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | Log in, returns `{ token, user }` |
| GET | `/api/foods/search?q=` | Search USDA foods (nutrients per 100 g) |
| GET | `/api/logs?date=YYYY-MM-DD` | Entries and totals for one day |
| POST | `/api/logs` | Log a food |
| PATCH | `/api/logs/:id` | Change servings |
| DELETE | `/api/logs/:id` | Remove an entry |

Everything except the two auth routes requires `Authorization: Bearer <token>`.

## Notes for the team discussion

**Vite + React** - Scaffolding is one command and the dev server reloads instantly.
The dev proxy means no CORS setup while developing. Plain `useState`/`useEffect`
was enough here; with five screens we will want React Router, and probably a data
fetching library so every screen doesn't hand-roll loading and error state.

**Express 5** - Very little to learn. Async route handlers now forward thrown errors
to the error middleware automatically, so no try/catch wrappers. It gives no
structure or validation, so we should agree on a folder layout and a validation
library (e.g. Zod) early.

**Prisma 7 + PostgreSQL** - The schema file is readable and migrations are generated
for us. Version 7 differs from most tutorials online: the database URL lives in
`prisma.config.ts`, a driver adapter (`@prisma/adapter-pg`) is required, and
`prisma generate` is a separate step from `migrate dev`. Everyone needs Postgres
installed locally (or we share a hosted dev database such as Neon or Railway).

**Auth (bcrypt + JWT)** - Simple to build. The token is kept in `localStorage`, which
is the easy option but readable by any script on the page; an httpOnly cookie is the
safer choice for the real app. There is no password reset or email verification.

**USDA FoodData Central** - Free, and has the micronutrients we need (iron, calcium,
vitamin D). Downsides: results are per 100 g rather than per household serving,
names are clinical ("Bananas, raw"), energy uses different nutrient ids across
datasets, and branded foods are a separate, noisier dataset. Storing nutrients on
each log row means past logs never need another API call.

**Recharts** - Charts are React components, so they fit naturally. It is the largest
dependency in the bundle (the build warns about chunk size); lazy-loading the chart
screens would fix that.

**npm** - `package.json` lists what we asked for; `package-lock.json` pins the exact
versions everyone gets. Commit the lockfile, and use `npm ci` on a fresh clone or in
CI so installs are reproducible. Never commit `node_modules` or `.env`.
