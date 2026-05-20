# Team Task Manager

Production-ready full-stack team task management app built with Next.js 14, Express, Prisma, PostgreSQL, JWT authentication, and Railway deployment support.

## Features

- Secure signup, login, persistent auth, and logout
- Admin/member role-based project access
- Project creation, editing, deletion, and member management
- Task creation, editing, assignment, filtering, sorting, status updates, and deletion
- Dashboard cards, progress bars, and Recharts visualizations
- Responsive SaaS-style UI with loading skeletons, empty states, search, filters, and toasts
- REST API with Zod validation, JWT middleware, Helmet, CORS, rate limiting, and centralized errors
- Prisma schema, seed script, migrations-ready setup, and Railway configuration

## Tech Stack

Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, ShadCN-style components, Axios, React Hook Form, Zod, Recharts, Zustand, Lucide Icons.

Backend: Node.js, Express.js, TypeScript, Prisma ORM, JWT, Bcrypt.

Database: PostgreSQL.

Deployment: Railway.

## Folder Structure

```txt
client/
  app/
  components/
  hooks/
  services/
  store/
  types/
  lib/
  utils/
server/
  src/
    controllers/
    routes/
    middleware/
    prisma/
    services/
    validations/
    utils/
    app.ts
```

## Environment Setup

Copy the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Backend variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

Frontend variables:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

`NEXT_PUBLIC_API_URL` can include or omit `/api`; the client normalizes it before making requests.

## Installation

```bash
cd server
npm install

cd ../client
npm install
```

## PostgreSQL Setup

Create a local database:

```bash
createdb team_task_manager
```

Or use any hosted PostgreSQL connection string in `server/.env`.

## Prisma Commands

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Run Locally

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Open `http://localhost:3000`.

Seed users:

```txt
admin@taskmanager.dev / Password123!
member@taskmanager.dev / Password123!
```

## API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Projects:

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Members:

- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

Tasks:

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard/stats`

## Railway Deployment

1. Create a Railway project.
2. Add a PostgreSQL service.
3. Deploy the `server` folder as one Railway service.
4. Set backend environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL`
5. Deploy the `client` folder as a second Railway service.
6. Set `NEXT_PUBLIC_API_URL` to your backend root URL, for example `https://your-backend.onrender.com`.
7. Run backend migration command:

```bash
npm run prisma:deploy
```

The backend includes a Railway start command that generates Prisma client and runs the compiled Express server.

## Screenshots

Add screenshots here after deployment.

## Demo Video

Add demo video link here.
