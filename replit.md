# Afhaal Centrum Memoli

Online bestelsysteem voor Afhaal Centrum Memoli in Hengelo: klanten bekijken het Turkse menu, vullen een winkelwagen en plaatsen een afhaalbestelling; het personeel volgt de bestellingen live in het beheerpaneel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/memoli-website run dev` — run the public website
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/memoli-website/` — **de echte publieke website** (React + Vite, root `/`). Dit is de bron van waarheid voor de klantwebsite en het beheerpaneel.
  - `src/pages/memoli/MemoliWebsite.tsx` — klantwebsite (menu, winkelwagen, checkout, NL/EN/TR, wachttijd, openingstijden)
  - `src/pages/memoli/MemoliAdmin.tsx` — beheerpaneel op route `/beheer`
  - `src/lib/paths.ts` — `asset()` en `api()` helpers; alle asset- en API-URL's gaan via het Vite base path
  - `public/images/` — logo, sfeerfoto's en gerechtfoto's
- `artifacts/api-server/src/routes/orders.ts` — orders, statusflow en restaurantinstellingen (wachttijd, open/gesloten, openingstijden)
- `lib/db/src/schema/orders.ts` — Drizzle-schema voor orders en settings
- `artifacts/mockup-sandbox/src/components/mockups/memoli/` — de oorspronkelijke design-mockup; **niet meer de productiecode**, alleen nog canvas-preview

## Architecture decisions

- De website is bewust omgezet van een canvas-mockup naar een zelfstandig `react-vite`-artifact op `/`, zodat hij publiceerbaar is als gewone website.
- Website en beheerpaneel delen één frontend; het beheerpaneel is een route (`/beheer`), geen apart artifact.
- Er is geen beheerderslogin: de beheerroutes van de API zijn publiek (uitdrukkelijke wens van de eigenaar).
- Prijzen worden serverzijdig gevalideerd tegen `MENU_PRICES`, zodat de client geen totalen kan vervalsen.
- Assets en API-calls gebruiken nooit root-relatieve paden maar het Vite base path, zodat de site ook onder een prefix werkt.

## Product

- Klantwebsite: menu per categorie met foto's, winkelwagen, checkout met naam/telefoon/opmerking, live wachttijd, openingstijden en NL/EN/TR.
- Beheerpaneel (`/beheer`): live bestellingen met statusflow nieuw → in bereiding → klaar → archief, wachttijd instellen, restaurant open/gesloten zetten en openingstijden per dag aanpassen.

## User preferences

- Het Memoli-beheerpaneel moet zonder beheerderswachtwoord of login kunnen worden geopend.
- De gebruiker wil uitsluitend een gewone website, geen mobiele app.

## Gotchas

- Bewerk de Memoli-website in `artifacts/memoli-website/`, niet in de mockup-sandbox — die kopie is alleen nog een canvas-preview.
- De publicatie kent een eigen wachtwoordbeveiliging (deployment visibility); die staat los van de verwijderde beheerderslogin.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
