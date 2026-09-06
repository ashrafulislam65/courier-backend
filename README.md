# 🚚 Courier & Logistics Management Platform

A production-ready, backend-only RESTful API for managing end-to-end courier and parcel delivery operations — built with a real payment gateway, role-based access control, and a fully enforced shipment lifecycle state machine.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=prisma&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🔗 Live Links

| Resource | Link |
|---|---|
| 🌐 **Live API** | https://courier-backend-lyart.vercel.app |
| 📂 **GitHub Repo** | https://github.com/ashrafulislam65/courier-backend |
| 📮 **Postman Collection** | [Courier.postman_collection.json](./Courier.postman_collection.json) |
| 📋 **API Endpoint Reference** | [API_ENDPOINTS.md](./API_ENDPOINTS.md) |
| 🎥 **Demo Video** | _(add your video link here)_ |

### 🔑 Admin Demo Credentials

Email: admin@courier.com
Password: Admin@12345


---

## 📖 Overview

This platform digitizes the full courier workflow — from a customer creating a parcel shipment, through hub-to-hub transit, to final delivery — with three strictly enforced roles (**Customer**, **Courier**, **Admin**), a real Stripe payment integration, and an auditable status history for every shipment.

**Problem it solves:** Manual/ad-hoc courier coordination is error-prone — parcels get mis-assigned, statuses get skipped, and there's no single source of truth for tracking or payment. This API enforces a strict state machine, transaction-safe assignment, and full audit logging so every action is traceable and no invalid state transition is possible.

---

## ✨ Key Features

- 🔐 **JWT Authentication** — Email/Password + Google OAuth (GCP) login, with access + refresh token rotation
- 🛂 **Role-Based Access Control** — Three fixed roles (`CUSTOMER`, `COURIER`, `ADMIN`) with strict middleware-enforced permissions
- 📦 **Full Shipment Lifecycle** — Enforced state machine: `CREATED → COURIER_ASSIGNED → PICKED_UP → IN_TRANSIT → AT_DESTINATION_HUB → OUT_FOR_DELIVERY → DELIVERED` (with `FAILED`/`RETURN_TO_SENDER`/`CANCELLED` branches) — invalid transitions are rejected at the service layer
- 🔒 **Transaction-Safe Operations** — Prisma `$transaction` wraps courier assignment and status updates to prevent race conditions (e.g. double-assigning the same courier)
- 💳 **Real Payment Integration** — Stripe Checkout Sessions + signature-verified webhooks, with live status tracking (no fake/simulated payments)
- 🗺️ **Hub & Zone Management** — Admin-managed distribution hubs and zones, with hub-to-hub transfer logging
- 📊 **Admin Dashboard** — User management, role/block controls, live stats, and a full audit log of sensitive actions
- ✅ **Zod Validation** — Server-side validation on every write endpoint with structured field-level errors
- 📄 **Consistent API Responses** — Uniform `{ success, message, data }` / `{ success, message, errors }` shape across all 28+ endpoints
- 🔍 **Pagination, Filtering & Search** — On shipment and user listing endpoints
- 🗑️ **Soft Deletes** — `deletedAt` timestamps instead of destructive deletes
- 📝 **Audit Logging** — Every admin action (courier assignment, role change, block/unblock) is recorded with actor, target, and metadata
- 🛡️ **Security Hardening** — Helmet, CORS, rate limiting (global + stricter auth-endpoint limits), bcrypt password hashing

---

## 🏗️ Architecture

Client (Postman/Thunder Client)
│
▼
Express Router ──► Rate Limiter ──► Helmet/CORS
│
▼
Zod Validation Middleware
│
▼
Auth Middleware (JWT verify + RBAC)
│
▼
Controller ───────────────────┐
│ │
▼ ▼
Service (business logic) Stripe API
│ │
▼ ▼
Prisma ORM (transactions) Webhook → Service
│
▼
PostgreSQL (Neon)


**Request flow:** `Route → Validate (Zod) → Authenticate (JWT) → Authorize (RBAC) → Controller → Service → Prisma → PostgreSQL`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma |
| Validation | Zod |
| Auth | JWT (access + refresh) + Google OAuth |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| Security | Helmet, CORS, express-rate-limit, bcryptjs |
| Deployment | Vercel (serverless) |

---

## 👥 Roles & Permissions

| Role | Capabilities |
|---|---|
| **Customer** | Register/login, create & cancel shipments, track parcels, initiate payment, view own history |
| **Courier** | View assigned shipments, update shipment status (state-machine enforced), toggle availability, view earnings |
| **Admin** | Manage hubs/zones, assign couriers, manage users & roles, view dashboard stats & audit logs |

---

## 📂 Project Structure

src/
config/ → env, Prisma client, Stripe client
middlewares/ → auth (JWT+RBAC), validation, error handler, rate limiter
modules/
auth/ → register, login, refresh, Google login
user/ → profile management
shipment/ → core resource: CRUD, state machine, courier assignment, hub transfer
hub/ → zones & hubs (admin)
courier/ → availability, assigned shipments, earnings
payment/ → Stripe checkout + webhook handling
admin/ → user management, dashboard stats, audit logs
utils/ → response formatter, error class, JWT helpers, catchAsync wrapper
app.ts → Express app + route wiring
server.ts → entry point
prisma/
schema.prisma → full relational schema (9 models, indexed & related)
seed.ts → seeds admin, demo courier, zone & hubs


---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js 18+
- A PostgreSQL database (free tier on [Neon](https://neon.tech) or [Supabase](https://supabase.com) works great)
- A [Stripe](https://dashboard.stripe.com/register) account (free, test mode)

### 1. Clone & Install
```bash
git clone https://github.com/ashrafulislam65/courier-backend.git
cd courier-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Fill in `.env` with:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — any long random strings
- `GOOGLE_CLIENT_ID` — from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (optional, for social login)
- `STRIPE_SECRET_KEY` — from [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
- `STRIPE_WEBHOOK_SECRET` — see step 5 below

### 3. Set Up the Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```
This creates the schema and seeds an admin user, a demo courier, one zone, and two hubs.

### 4. Run the Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`. Verify with:

GET http://localhost:5000/api/v1/health


### 5. (Optional) Test Stripe Webhooks Locally
```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/payments/webhook
```
Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env` and restart the server.

### 6. Explore the API
Import [`Courier.postman_collection.json`](./Courier.postman_collection.json) into Postman, or follow [`API_ENDPOINTS.md`](./API_ENDPOINTS.md) for the full endpoint list with sample requests.

---

## ☁️ Deployment

Deployed on **Vercel** as a serverless function, backed by a **Neon** PostgreSQL instance.

- Build: `npm install` → `postinstall` runs `prisma generate` automatically
- Entry point: `src/server.ts` exports the Express app for Vercel's Node runtime
- Stripe webhook is registered directly against the production URL:
  `https://courier-backend-lyart.vercel.app/api/v1/payments/webhook`

To deploy your own copy: import the repo into Vercel, add the same environment variables as `.env.example`, and set `NODE_ENV=production`.

---

## 🧪 API Highlights

**28 endpoints** across 7 modules — full list in [`API_ENDPOINTS.md`](./API_ENDPOINTS.md).

```http
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/google
POST   /api/v1/shipments                       # Customer creates shipment
GET    /api/v1/shipments?page=&status=&sortBy= # Paginated + filtered
POST   /api/v1/shipments/:id/assign-courier    # Admin, transaction-safe
PATCH  /api/v1/shipments/:id/status            # State-machine enforced
GET    /api/v1/shipments/:id/tracking          # Full audit timeline
POST   /api/v1/payments/initiate               # Stripe Checkout Session
POST   /api/v1/payments/webhook                # Signature-verified
GET    /api/v1/admin/dashboard-stats
GET    /api/v1/admin/audit-logs
```

### Sample Response Format

**Success:**
```json
{ "success": true, "message": "Shipment created successfully", "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "weightKg", "message": "Weight must be greater than 0" }] }
```

---

## 🔥 Notable Engineering Decisions

- **Transaction-safe courier assignment** — wrapped in `prisma.$transaction()` with an availability check inside the transaction, preventing two admins from assigning the same courier simultaneously
- **Centralized state machine** — a single `VALID_TRANSITIONS` map governs every status change, making illegal transitions impossible regardless of which endpoint triggers them
- **Idempotent webhook handling** — Stripe's `checkout.session.completed` event updates payment status keyed on `shipmentId`, safely handling Stripe's occasional duplicate event delivery
- **Audit trail by design** — every status change and admin action writes to `ShipmentStatusHistory` / `AuditLog` inside the same transaction as the state change itself, so history can never drift from reality

---

## 📮  Details

Project Name : Courier & Logistics Platform
Backend Repo : https://github.com/ashrafulislam65/courier-backend
Live API : https://courier-backend-lyart.vercel.app
API Docs : https://github.com/ashrafulislam65/courier-backend/blob/main/Courier.postman_collection.json
Demo Video : (add link here)
Admin Email : admin@courier.com
Admin Password : Admin@12345

## 📄 License

© 2026 Ashraful Islam. All rights reserved.