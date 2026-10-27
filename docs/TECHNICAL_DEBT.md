# Turfmate — Known Limitations and Technical Debt

1. **Persistent storage.** Implement a Drizzle/PostgreSQL `IStorage` using the existing `shared/schema.ts`, and enforce slot uniqueness with a database constraint or row lock instead of the in-process flag.
2. **Authentication.** Add user accounts so bookings are tied to a user and can be cancelled by their owner.
3. **Payments.** No payment flow exists; any integration would need webhook verification and idempotent booking confirmation.
4. **Frontend structure.** The client is a single `App.tsx`; split it into pages/components once more screens are added.
