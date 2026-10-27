# Turfmate

Sports turf booking prototype: browse venues, pick an hourly slot, and get a booking code with a QR pass.

[![CI](https://github.com/daanialmirza5/Turfmate/actions/workflows/ci.yml/badge.svg)](https://github.com/daanialmirza5/Turfmate/actions/workflows/ci.yml)

## What it does

- Lists seeded venues (box cricket, football, badminton) and their turfs.
- Generates hourly slots for a chosen date with peak / off-peak pricing.
- Creates a booking for a free slot and rejects a second booking for the same slot.
- Returns a booking code (`TRF-xxxxxx`) and renders a QR code with the booking details.
- Looks up a booking by code.

## Current limitations

- **Data is in memory.** `server/storage.ts` implements `MemStorage`; all bookings are lost on restart. A Drizzle/PostgreSQL schema exists in `shared/schema.ts`, but no database-backed storage implementation is wired in yet.
- **No authentication or payments.** There are no user accounts, sessions or payment integration.
- The double-booking guard relies on Node's single-threaded event loop within one process. It does not hold across multiple server instances.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, `qrcode.react` |
| Backend | Express 4, TypeScript (`tsx` in development, `esbuild` bundle in production) |
| Data | In-memory storage; Drizzle schema for PostgreSQL (not yet used at runtime) |
| Tests | Node test runner via `tsx --test` |

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/venues` | List venues |
| GET | `/api/venues/:id` | Venue with its turfs |
| GET | `/api/turfs/:id/slots?date=YYYY-MM-DD` | Slots for a turf and date |
| POST | `/api/bookings` | Create a booking (`409 SLOT_ALREADY_BOOKED` if the slot is taken) |
| GET | `/api/bookings/:code` | Look up a booking by code |
| GET | `/api/health` | Health check |

## Project structure

```text
client/          React app (single-page, client/src/App.tsx)
server/          Express entry point, routes and in-memory storage
shared/          Drizzle schema and Zod insert types
tests/           Storage unit tests
```

## Running locally

Requires Node.js 20.11+ (CI uses Node 22).

```bash
npm install
npm run dev          # API on http://localhost:5000
npm run dev:client   # Vite dev server on http://localhost:5173 (proxies /api to :5000)
```

Production build:

```bash
npm run build
NODE_ENV=production node dist/index.js   # serves the built client and the API on :5000
```

## Checks

```bash
npm run check   # TypeScript
npm test        # unit tests for slot generation, booking and double-booking prevention
```

## License

[MIT](LICENSE)

## Author

[Daanial Mirza](https://github.com/daanialmirza5)
