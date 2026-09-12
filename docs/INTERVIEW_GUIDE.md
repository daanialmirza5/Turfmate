# Turfmate — Interview Guide & Technical Defense

## 1. Pitches
- **30-Second Pitch**: "Turfmate is a sports venue booking platform built with React, Node.js, and PostgreSQL. It features transactional slot locking to eliminate double bookings and generates cryptographically signed QR receipts for venue check-ins."
- **2-Minute Pitch**: "Booking sports facilities often suffers from concurrency race conditions where two players reserve the same court simultaneously. Turfmate solves this using transactional database row locking and an intuitive React interface. When a user selects a time slot, the backend places an atomic 5-minute lock on the slot interval. Once payment is confirmed, the reservation commits and generates an HMAC-signed QR pass that venue staff can verify instantly on-site."

## 2. Key Technical Q&A
- **Q: How do you handle two users clicking 'Book' on the same slot at the exact same millisecond?**
  - **A**: We execute the reservation inside a database transaction with `SELECT FOR UPDATE` on the slot record. The first transaction acquires the exclusive lock, verifies slot status as `AVAILABLE`, and marks it `HELD`. The second transaction waits for the lock, reads the updated `HELD` status, and fails gracefully with a user-friendly 'Slot just taken' notification.
