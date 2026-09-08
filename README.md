# Turfmate

A full-stack sports turf booking, slot reservation, and match scheduling platform.

[![CI](https://github.com/daanialmirza5/Turfmate/actions/workflows/ci.yml/badge.svg)](https://github.com/daanialmirza5/Turfmate/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.39-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

Finding and booking local sports facilities (box cricket turfs, football arenas, badminton courts) is often fragmented across phone calls and unorganized messaging groups. Venue owners struggle with double bookings, slot vacancy management, and manual payment tracking.

**Turfmate** is a comprehensive sports venue booking and match scheduling application:
- **Interactive Slot Grid**: Real-time hourly slot selection with dynamic peak/off-peak pricing and availability status.
- **Instant Digital Confirmations**: Automatic generation of booking receipts with scannable QR verification codes.
- **Relational Data Modeling**: Powered by Drizzle ORM over PostgreSQL (`users`, `venues`, `turfs`, `slots`, `bookings`, `reviews`).
- **Flexible Backend Architecture**: Dual-stack architecture supporting a lightweight Node.js/Express TypeScript backend alongside an enterprise Spring Boot Java 17 microservice design (`pom.xml`).
- **Secure Authentication**: Session-based authentication with Passport.js and PostgreSQL session store (`connect-pg-simple`).

---

## Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React + Vite + Tailwind + shadcn/ui)"]
        VenueCatalog[Venue & Turf Explorer]
        SlotScheduler[Interactive Slot Matrix & Date Picker]
        CheckoutFlow[Booking Summary & Payment Gateway]
        QRPass[QR Pass & PDF Receipt Generator]
    end

    subgraph API ["Server Layer (Express + TypeScript / Spring Boot)"]
        AuthRoutes[/api/auth - Login, Register, Session]
        VenueRoutes[/api/venues - Listing, Filters, Amenities]
        BookingEngine[/api/bookings - Slot Locking & Reservation Engine]
    end

    subgraph DataStore ["Database Layer (PostgreSQL / Drizzle ORM)"]
        Drizzle[Drizzle ORM Schema]
        PG[(PostgreSQL Database\nVenues | Slots | Bookings | Users)]
    end

    VenueCatalog -->|Fetch Venues| VenueRoutes
    SlotScheduler -->|Query Slot Availability| BookingEngine
    CheckoutFlow -->|Lock & Confirm Slot| BookingEngine
    BookingEngine --> Drizzle
    VenueRoutes --> Drizzle
    AuthRoutes --> Drizzle
    Drizzle --> PG
    BookingEngine -->|Generate Digital Pass| QRPass
```

---

## Key Features

- **Multi-Sport Support**: Configured for box cricket, 5-a-side football, tennis, and indoor badminton arenas.
- **Conflict-Free Slot Allocation**: Transactional reservation locks prevent concurrent booking collisions.
- **QR Code Verification**: In-app QR code generation for turf managers to verify customer check-ins.
- **Interactive Calendar & Filters**: Filter by sport type, ground size, floodlight availability, turf material, and price range.
- **Responsive Management Dashboard**: Venue owner dashboard for viewing daily occupancy, revenue metrics, and booking logs.

---

## Tech Stack

### Frontend
- **Framework**: React 18, Vite 5.4, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui component primitives, Framer Motion
- **State & Data Fetching**: TanStack React Query v5, Wouter routing
- **Utilities**: `lucide-react`, `date-fns`, `qrcode.react`, `jspdf`, `canvas-confetti`

### Backend
- **Node Stack**: Express 4.21, TypeScript, `tsx`, `esbuild`
- **ORM / Database**: Drizzle ORM, `@neondatabase/serverless` / PostgreSQL, `drizzle-zod`
- **Authentication**: Passport.js (`passport-local`), `express-session`, `connect-pg-simple`
- **Enterprise Java Alternative**: Spring Boot 3.1, Java 17, Spring Security, JPA/Hibernate, Maven (`pom.xml`)

---

## Project Structure

```text
Turfmate/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated TypeScript validation CI
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI widgets, slot pickers & navbars
│   │   ├── hooks/               # Custom hooks for auth & venue queries
│   │   ├── pages/               # Venue listing, slot booking, booking success pages
│   │   └── App.tsx
├── server/                      # Express backend API
│   ├── index.ts                 # Server entry point & API route handlers
│   ├── auth.ts                  # Passport session configuration
│   └── db.ts                    # PostgreSQL connection pool
├── shared/
│   └── schema.ts                # Drizzle ORM database models & Zod validation
├── drizzle.config.ts            # Drizzle Kit migration configuration
├── pom.xml                      # Spring Boot enterprise backend descriptor
├── .env.example                 # Environment configuration template
├── LICENSE                      # MIT License
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 & 22)
- PostgreSQL database instance (local or hosted via Neon / Supabase)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/daanialmirza5/Turfmate.git
cd Turfmate
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL connection string:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/turfmate"
SESSION_SECRET="your-secret-session-key"
```

### 4. Push Database Schema
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```
The application will be running at [http://localhost:5000](http://localhost:5000).

---

## Type Checking & Quality

Validate TypeScript contracts across client and server:

```bash
npm run check
```

---

## License

This project is licensed under the [MIT License](LICENSE).
