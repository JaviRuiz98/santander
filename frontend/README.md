Digital Platform – Technical Test

Backend and codebase in English. Frontend UI texts are in Spanish.

Overview

Full-stack app where users upload an Excel file with exactly one data row containing candidate info. The frontend (Angular) sends the form + file to the backend (NestJS), which parses the Excel and returns a merged JSON. The frontend keeps an incremental list of all uploaded candidates and displays a Material table with the required columns.

Tech Stack

Frontend: Angular 16+, Angular Material, Reactive Forms (UI in Spanish)

Backend: NestJS, Prisma ORM (no Docker required)

Database: SQLite (via Prisma)

Tests: Jest (unit / integration)

Repository Structure (example)
/frontend/         # Angular SPA (Spanish UI)
/backend/          # NestJS API
  prisma/          # Prisma schema & migrations
.env.example       # Backend environment template

Requirements

Node.js 18+

npm 9+

No Docker needed. The backend runs with Prisma + SQLite out of the box.

Setup & Run
Backend
cd backend
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy   # or: npx prisma migrate dev (first run)
npm run start:dev           # dev mode (watch)
# npm run build && npm run start:prod  # production


.env (example):

DATABASE_URL="file:./dev.db"
PORT=3000
CORS_ORIGIN=http://localhost:4200

Frontend
cd ../frontend
npm ci
npm start        # ng serve


Open http://localhost:4200
 (frontend).
API listens on http://localhost:3000
 by default.

How to Use

Open the app.

Fill Nombre and Apellidos (Name/Surname).

Select an Excel with exactly one data row and headers:

Seniority → junior | senior

Years → number

Availability → boolean (true/false or 1/0)

Submit. The backend responds with { name, surname, seniority, years, availability }.

The frontend adds the candidate to an incremental list and renders a Material table with 5 columns.

API

POST /candidates/upload – multipart/form-data

Fields: name (string), surname (string), file (Excel)

Response: { name, surname, seniority, years, availability }

GET /candidates (optional) – returns persisted candidates if enabled.

Routes may vary depending on your module names; adjust if needed.

Data & Persistence

Backend: Prisma model Candidate stored in dev.db (SQLite).

Frontend: Maintains an in-memory list that grows with each successful upload (optionally persisted to LocalStorage if enabled).

Testing
# backend
cd backend
npm run test
npm run test:e2e

# frontend
cd ../frontend
npm test

Design Decisions

Prisma + SQLite to avoid Docker and keep setup minimal.

Strong validation on both client and server.

Reactive UI (RxJS) + Angular Material for accessibility and speed.

Troubleshooting

CORS: Ensure CORS_ORIGIN matches http://localhost:4200.

Migrations: Run npx prisma migrate dev if the schema changes.

Excel errors: Verify exactly 1 data row and correct headers.

Port in use: Change PORT in .env or free the port.

License / Usage

For recruitment evaluation purposes only.