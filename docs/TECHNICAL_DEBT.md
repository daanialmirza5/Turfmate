# Turfmate — Technical Debt & Architectural Audit

**Repository**: `Turfmate`  
**Status**: Tier 3 Learning Project

## Prioritized Debt Items
- **[P1 — High] Redis Distributed Lock (Redlock)**: Replace database row locks with Redis distributed locks to decouple reservation TTLs from database connection pools.
- **[P2 — Medium] Stripe / Razorpay Webhook Payment Gateway**: Integrate live automated payment webhooks.
- **[P3 — Low] Team Matchmaking Lobby**: Add player matchmaking lobby for solo players looking for sports groups.
