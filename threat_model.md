# Threat Model

## Project Overview

Memoli Order System — a browser-based restaurant ordering website consisting of:
- **API server** (Express 5 / Node.js / TypeScript) serving `/api` endpoints backed by PostgreSQL via Drizzle ORM
- **Customer website** (React/Vite) allowing customers to browse the menu and place orders
- **Admin panel** (a browser route in the same React/Vite website) for restaurant staff to manage orders and settings
- **Mockup sandbox** (Vite dev tool, design-only, not production-relevant)

Deployed on Replit (autoscale, visibility: **password**) at `https://memoli-order-system.replit.app`.

The admin panel is intentionally designed to operate without any login or password (per `replit.md`): staff open the URL and have full admin access.

## Assets

- **Customer PII** — names and phone numbers submitted with each order. Exposure would violate customer privacy.
- **Orders data** — order history, items, totals, status. Business-critical operational data.
- **Restaurant settings** — open/closed state, opening hours, wait time. Manipulation could impact business operations.
- **Platform password** — Replit deployment password that gates the entire site. Compromise exposes all assets.

## Trust Boundaries

- **Internet → Replit platform password** — all requests must pass Replit's password gate; this is the only perimeter.
- **Customer website → API server** — customers place orders via `POST /api/orders`; prices are validated server-side.
- **Admin panel → API server** — admin routes (`GET /api/orders`, `PATCH /api/orders/:id/status`, `PUT /api/settings`) require no credentials beyond reaching the API.
- **API server → PostgreSQL** — Drizzle ORM with parameterized queries; SQL injection risk is low.

## Scan Anchors

- Production entry point: `artifacts/api-server/src/routes/orders.ts` — all business logic
- Admin routes (no auth): `GET /api/orders`, `PATCH /api/orders/:id/status`, `PUT /api/settings`
- Public route: `POST /api/orders` (no rate limiting)
- Customer and admin web entry points: `artifacts/memoli-website/src/pages/memoli/`
- Mockup sandbox (`artifacts/mockup-sandbox`) — dev/design only, not production security surface

## Threat Categories

### Spoofing / Broken Access Control

The admin panel has **no server-side authentication by design**. The only perimeter is the Replit platform password shared across the entire deployment. Any user who holds that password (including customers if they are given it to access the ordering app) can reach all admin endpoints. `GET /api/orders` exposes all customer PII. `PUT /api/settings` lets anyone close the restaurant or change hours. There is no privilege separation between customer and admin roles.

Required guarantee: admin routes MUST enforce a server-side credential or session check distinct from the platform password, OR the deployment must be split so customers access a separate public-facing URL that does not expose admin routes.

### Information Disclosure

`GET /api/orders` returns names and phone numbers of all customers in the database without any access control beyond reaching the URL. Stack traces are suppressed in error responses (only "Database error" is returned), which is good.

### Tampering

Prices are enforced server-side against `MENU_PRICES` — clients cannot manipulate item prices. Input validation on orders is adequate. `PUT /api/settings` and `PATCH /api/orders/:id/status` lack authentication, allowing unauthenticated manipulation of restaurant state and order status.

### Denial of Service

`POST /api/orders` has no rate limiting. A single IP can flood the endpoint and fill the database with fake orders, disrupting operations. There is no body-size cap beyond Express defaults.

### Security Misconfiguration

CORS is configured as `cors({ origin: true, credentials: true })`, which reflects any `Origin` header and allows credentials. If the app ever uses cookies or bearer tokens, any third-party site can make credentialed cross-origin requests. Currently low practical impact since no session cookies are used, but creates a permissive baseline.
