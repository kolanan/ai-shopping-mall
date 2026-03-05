# AI Shopping Mall

Monorepo starter for a shopping website:

- `frontend`: React + Vite
- `backend`: Spring Boot + Maven
- `database`: MySQL (via Docker Compose or local installation)

## Structure

```text
.
|-- backend
|-- docker-compose.yml
`-- frontend
```

## Backend

Backend is pinned to JDK `D:\Users\admin\.jdks\openjdk-21.0.1`.

```powershell
cd backend
.\run-backend.ps1
```

Default URL: `http://localhost:8080`

## MySQL

Current backend defaults point at:

- host: `10.12.61.26`
- port: `3534`
- database: `ai_shopping_mall`
- username: `trade-manage`

The JDBC URL includes `createDatabaseIfNotExist=true`, so Spring Boot can create the database on first startup if the account has permission.

If you need to initialize the schema manually, use [bootstrap-db.sql](D:/code/ai-shopping-mall/scripts/bootstrap-db.sql).

## Frontend

```powershell
cd frontend
.\run-frontend.ps1
```

If dependencies are not installed yet, the script will install them using a workspace-local npm cache.

Default URL: `http://localhost:5173`

## Current state

- Amazon-inspired home page scaffold
- Product recommendation section fed from backend API
- Spring Boot REST API backed by MySQL via Spring Data JPA
- Core catalog tables initialized: `categories`, `products`
- Startup seed data inserted automatically when tables are empty
- Backend startup script fixed to the provided JDK 21 path

## Verified on 2026-03-04

- JDK `D:\Users\admin\.jdks\openjdk-21.0.1` works for the backend
- Maven Wrapper downloaded and backend compiles successfully
- Database `ai_shopping_mall` and tables `categories`, `products` were created on `10.12.61.26:3534`
- Backend API `GET /api/products/featured` returns seeded product data
- Frontend dependencies install successfully
- Frontend production build succeeds

## Next iteration ideas

1. User login and registration
2. Category pages and product detail page
3. Cart and checkout
4. Order, payment, and inventory workflows
