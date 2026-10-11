# Nutrition Log - research sample app

A small app built to try out the stack our team is considering for the
nutrition tracker: React + Vite, Node.js + Express, PostgreSQL + Prisma,
and the USDA FoodData Central API.

## What it does

- Create an account, log in, log out
- Search foods by name (USDA FoodData Central)
- Log a food to breakfast, lunch, dinner, or snack
- Edit the amount or delete an entry
- See daily totals and a chart against daily targets

## Run it

Requires Node 20+ and PostgreSQL.

```bash
cd server
npm install
# copy .env.example to .env and fill in your values
npx prisma migrate dev --name init
npx prisma generate
npm run dev

# in a second terminal
cd client
npm install
npm run dev
```

Then open http://localhost:5173.
