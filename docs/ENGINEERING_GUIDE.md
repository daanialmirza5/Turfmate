# Turfmate — Engineering Guide & Mastery Document

## 1. What Is Turfmate?
Turfmate is a **full-stack sports venue booking and match scheduling platform**. It provides conflict-free slot reservation management, transactional locking against double bookings, digital payment receipts with QR verification, and real-time venue availability dashboards.

## 2. Real-World Problem Solved
1. **Double-Booking Race Conditions**: Concurrent users attempting to book the same prime-time turf slot simultaneously.
2. **Manual Slot Management**: Venue managers relying on paper registers or WhatsApp chats leading to schedule conflicts.
3. **Unverified Payment Claims**: Disputes over payment proof and booking confirmations at the venue entrance.

## 3. High-Level Architecture
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Radix UI.
- **Backend & Database**: Express / Node.js, Drizzle ORM / PostgreSQL.
- **Concurrency & Booking Engine**:
  - `booking-service.ts`: Transactional slot isolation with row-level locks (`SELECT FOR UPDATE`) preventing race conditions.
  - `qr-service.ts`: Cryptographically signed HMAC-SHA256 booking receipt tokens verifiable offline.
- **Testing**: Unit test suite for slot conflict resolution.

## 4. Algorithmic Formulations
- **Slot Conflict Validation**: Checks for overlapping interval intersections:
  $$\text{Conflict} = (S_{\text{new}} < E_{\text{existing}}) \land (E_{\text{new}} > S_{\text{existing}})$$
- **Locking Lifecycle**: Acquire Lock $\to$ Validate Availability $\to$ Create Pending Reservation (5-min TTL) $\to$ Confirm Payment $\to$ Commit.

## 5. Security & Isolation
- Scoped multi-venue manager access control.
- Rate-limited booking attempt endpoints.
