import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MemStorage } from "../server/storage";

describe("Turfmate Booking Storage & Business Logic", () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  it("should initialize with pre-seeded venues and turfs", async () => {
    const venues = await storage.getVenues();
    assert.ok(venues.length > 0, "Venues should be seeded");
    
    const turf = await storage.getTurf(1);
    assert.ok(turf, "Turf 1 should exist");
    assert.strictEqual(turf?.name, "Pitch Alpha (5v5 FIFA Approved)");
  });

  it("should generate available slots for a given date", async () => {
    const slots = await storage.getSlots(1, "2026-09-15");
    assert.ok(slots.length >= 8, "Should generate daily hourly slots");
    assert.strictEqual(slots[0].isBooked, false, "New slots should initially be available");
  });

  it("should successfully create a valid booking and mark slot booked", async () => {
    const slots = await storage.getSlots(1, "2026-09-15");
    const targetSlot = slots[0];

    const result = await storage.createBooking({
      venueId: 1,
      turfId: 1,
      slotId: targetSlot.id,
      date: "2026-09-15",
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime,
      userId: 1,
      customerName: "Alex Rivera",
      customerPhone: "+1 (555) 342-9910",
      customerEmail: "alex@example.com",
      status: "CONFIRMED",
      totalAmount: 1400,
    });

    assert.ok(!result.error, "Should not return an error");
    assert.ok(result.booking.id, "Booking should have an ID");
    assert.strictEqual(result.booking.status, "CONFIRMED");
    assert.ok(result.booking.bookingCode.startsWith("TRF-"));

    // Re-query slot
    const updatedSlot = await storage.getSlot(targetSlot.id);
    assert.strictEqual(updatedSlot?.isBooked, true, "Slot should now be marked booked");
  });

  it("should prevent double-booking collisions on the same slot", async () => {
    const slots = await storage.getSlots(1, "2026-09-16");
    const targetSlot = slots[2];

    // First booking succeeds
    const first = await storage.createBooking({
      venueId: 1,
      turfId: 1,
      slotId: targetSlot.id,
      date: "2026-09-16",
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime,
      userId: 1,
      customerName: "Customer One",
      customerPhone: "+1 (555) 111-1111",
      customerEmail: "one@example.com",
      status: "CONFIRMED",
      totalAmount: 1400,
    });
    assert.ok(!first.error);

    // Second booking attempt on same slot MUST fail with collision error
    const second = await storage.createBooking({
      venueId: 1,
      turfId: 1,
      slotId: targetSlot.id,
      date: "2026-09-16",
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime,
      userId: 2,
      customerName: "Customer Two (Collision)",
      customerPhone: "+1 (555) 222-2222",
      customerEmail: "two@example.com",
      status: "CONFIRMED",
      totalAmount: 1400,
    });

    assert.ok(second.error, "Should return double-booking collision error");
    assert.match(second.error, /already reserved/);
  });

  it("should release slot availability when a booking is cancelled", async () => {
    const slots = await storage.getSlots(1, "2026-09-17");
    const targetSlot = slots[4];

    const result = await storage.createBooking({
      venueId: 1,
      turfId: 1,
      slotId: targetSlot.id,
      date: "2026-09-17",
      startTime: targetSlot.startTime,
      endTime: targetSlot.endTime,
      userId: 1,
      customerName: "Sam Wilson",
      customerPhone: "+1 (555) 444-9988",
      customerEmail: "sam@example.com",
      status: "CONFIRMED",
      totalAmount: 1400,
    });

    assert.strictEqual((await storage.getSlot(targetSlot.id))?.isBooked, true);

    // Cancel booking
    const cancelled = await storage.cancelBooking(result.booking.id);
    assert.strictEqual(cancelled.status, "CANCELLED");

    // Verify slot is freed up for other users
    const slotAfterCancel = await storage.getSlot(targetSlot.id);
    assert.strictEqual(slotAfterCancel?.isBooked, false, "Slot should be restored to available after cancellation");
  });

  it("should retrieve bookings by user and code accurately", async () => {
    const slots = await storage.getSlots(1, "2026-09-18");
    const res = await storage.createBooking({
      venueId: 1,
      turfId: 1,
      slotId: slots[0].id,
      date: "2026-09-18",
      startTime: slots[0].startTime,
      endTime: slots[0].endTime,
      userId: 99,
      customerName: "User 99",
      customerPhone: "+1 555-999-9999",
      customerEmail: "user99@test.com",
      status: "CONFIRMED",
      totalAmount: 1400,
    });

    const userBookings = await storage.getUserBookings(99);
    assert.strictEqual(userBookings.length, 1);
    assert.strictEqual(userBookings[0].customerName, "User 99");

    const foundByCode = await storage.getBookingByCode(res.booking.bookingCode);
    assert.ok(foundByCode);
    assert.strictEqual(foundByCode?.id, res.booking.id);
  });
});
