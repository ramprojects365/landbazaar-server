# Local to Railway Guide (LandBazar Server)

This guide covers:
1. Local database setup with sample data
2. Validation before deploy
3. Railway deployment and environment mapping

## 1) Local setup with sample data

From landbazaar-server:

1. Install dependencies
- npm install

2. Copy environment
- Copy .env.example to .env
- Keep local DB values:
  - DB_HOST=localhost
  - DB_PORT=5432
  - DB_USER=postgres
  - DB_PASSWORD=postgres
  - DB_NAME=auth_db
  - DB_SSL=false

3. Start PostgreSQL with Docker
- docker compose up -d

4. Create schema and seed demo data
- npm run setup-db
- npm run seed-db

Alternative one-shot command:
- npm run setup-and-seed-db

5. Build and run API
- npm run build
- npm start

## 2) What seed data is added

Seed command inserts:
- 2 demo users
- 3 land listings (Hyderabad, Yadadri, Warangal)

Demo login for testing:
- Email: landowner.hyd@example.com
- Password: ram123

## 3) Pre-deploy checklist

Before pushing to Railway:
1. Confirm API starts locally
2. Confirm GET /api/properties returns seeded rows
3. Confirm auth login works with demo credentials
4. Confirm frontend points to local API while testing

## 4) Railway deployment steps

1. Push backend to GitHub
2. In Railway, create a new project
3. Add PostgreSQL service in same project
4. Add backend service from your GitHub repo
5. Set root directory to landbazaar-server if monorepo path is needed
6. Railway should auto-detect Node build/start

Recommended commands in Railway service settings:
- Build command: npm run build
- Start command: npm start

## 5) Railway environment variable mapping

Set these in backend service:
- NODE_ENV=production
- JWT_SECRET=your-long-random-secret
- JWT_EXPIRY=7d
- PUBLIC_WEB_URL=https://www.dekholand.com
- PUBLIC_API_URL=https://your-railway-api-domain

Database values:
- Prefer DATABASE_URL from Railway Postgres
- Optional fallback: DATABASE_PUBLIC_URL

Notes:
- If DATABASE_URL is present, DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME are not required.
- For external SSL connections, keep DB_SSL=true when needed.

Optional services:
- RESEND_API_KEY (email)
- EMAIL_FROM
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET
- AWS_ENDPOINT
- AWS_PUBLIC_URL_BASE

## 6) Railway migration compatibility

If you need to manually apply location columns on Railway DB:
- psql "$DATABASE_URL" -f sql/railway-update.sql

Most deployments should auto-align because TypeORM synchronize is enabled.

## 7) Seeding on Railway (optional)

For staging only, you can run sample seed on Railway shell:
- npm run seed-db

For production, do not use demo seed users/listings.
Create controlled production data instead.
