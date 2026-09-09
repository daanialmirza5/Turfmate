import {
  type User,
  type InsertUser,
  type Venue,
  type InsertVenue,
  type Turf,
  type InsertTurf,
  type Slot,
  type InsertSlot,
  type Booking,
  type InsertBooking,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getVenues(): Promise<Venue[]>;
  getVenue(id: number): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;

  getTurfsByVenue(venueId: number): Promise<Turf[]>;
  getTurf(id: number): Promise<Turf | undefined>;
  createTurf(turf: InsertTurf): Promise<Turf>;

  getSlots(turfId: number, date: string): Promise<Slot[]>;
  getSlot(id: number): Promise<Slot | undefined>;
  createSlot(slot: InsertSlot): Promise<Slot>;

  createBooking(booking: InsertBooking): Promise<{ booking: Booking; error?: string }>;
  cancelBooking(id: number): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByCode(code: string): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private venues: Map<number, Venue> = new Map();
  private turfs: Map<number, Turf> = new Map();
  private slots: Map<number, Slot> = new Map();
  private bookings: Map<number, Booking> = new Map();

  private currentUserId = 1;
  private currentVenueId = 1;
  private currentTurfId = 1;
  private currentSlotId = 1;
  private currentBookingId = 1;

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    // Seed Sample Venues
    const v1 = this.createVenueSync({
      name: "Apex Arena & Box Cricket",
      description: "Premium FIFA-grade astro turf facility with LED floodlights, cafeteria, and live score screens.",
      address: "Baner Highway, Near Westend Mall",
      city: "Pune",
      sportTypes: ["cricket", "football"],
      amenities: ["parking", "floodlights", "lockers", "cafeteria", "cctv"],
      images: ["https://images.unsplash.com/photo-1529900241051-9e28328c707d?w=800"],
      rating: "4.9",
    });

    const v2 = this.createVenueSync({
      name: "Champions Turf & Sports Hub",
      description: "Multi-court complex with 7v7 football turf and dual badminton courts.",
      address: "Koregaon Park Main Road",
      city: "Pune",
      sportTypes: ["football", "badminton", "cricket"],
      amenities: ["parking", "floodlights", "showers", "drinking_water"],
      images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"],
      rating: "4.7",
    });

    // Seed Turfs
    const t1 = this.createTurfSync({
      venueId: v1.id,
      name: "Pitch Alpha (5v5 FIFA Approved)",
      sportType: "cricket",
      size: "8v8 (120x60 ft)",
      surfaceType: "Monofilament AstroTurf",
      hourlyRate: 1400,
      hasFloodlights: true,
    });

    const t2 = this.createTurfSync({
      venueId: v1.id,
      name: "Football Arena 1",
      sportType: "football",
      size: "6v6 (100x50 ft)",
      surfaceType: "FIFA Certified 50mm Grass",
      hourlyRate: 1600,
      hasFloodlights: true,
    });

    const t3 = this.createTurfSync({
      venueId: v2.id,
      name: "Grand Pitch Beta",
      sportType: "football",
      size: "7v7 (140x70 ft)",
      surfaceType: "Rubber Infill AstroTurf",
      hourlyRate: 1800,
      hasFloodlights: true,
    });

    // Seed Initial Slots for today & tomorrow
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    for (const d of [today, tomorrow]) {
      this.ensureDailySlots(t1.id, d, t1.hourlyRate);
      this.ensureDailySlots(t2.id, d, t2.hourlyRate);
      this.ensureDailySlots(t3.id, d, t3.hourlyRate);
    }
  }

  private ensureDailySlots(turfId: number, date: string, basePrice = 1400): Slot[] {
    const existing = Array.from(this.slots.values()).filter(
      (s) => s.turfId === turfId && s.date === date
    );
    if (existing.length > 0) return existing;

    const times = [
      { start: "06:00", end: "07:00", mult: 0.8 },
      { start: "07:00", end: "08:00", mult: 0.9 },
      { start: "08:00", end: "09:00", mult: 1.0 },
      { start: "16:00", end: "17:00", mult: 1.0 },
      { start: "17:00", end: "18:00", mult: 1.1 },
      { start: "18:00", end: "19:00", mult: 1.2 },
      { start: "19:00", end: "20:00", mult: 1.3 },
      { start: "20:00", end: "21:00", mult: 1.3 },
      { start: "21:00", end: "22:00", mult: 1.1 },
    ];

    const generated: Slot[] = [];
    for (const t of times) {
      const slot = this.createSlotSync({
        turfId,
        date,
        startTime: t.start,
        endTime: t.end,
        price: Math.round(basePrice * t.mult),
        isBooked: false,
      });
      generated.push(slot);
    }
    return generated;
  }

  private createVenueSync(venue: InsertVenue): Venue {
    const id = this.currentVenueId++;
    const full: Venue = {
      ...venue,
      id,
      city: venue.city || "Pune",
      rating: venue.rating || "4.8",
      createdAt: new Date(),
    };
    this.venues.set(id, full);
    return full;
  }

  private createTurfSync(turf: InsertTurf): Turf {
    const id = this.currentTurfId++;
    const full: Turf = { ...turf, id, surfaceType: turf.surfaceType || "AstroTurf", hasFloodlights: turf.hasFloodlights ?? true, createdAt: new Date() };
    this.turfs.set(id, full);
    return full;
  }

  private createSlotSync(slot: InsertSlot): Slot {
    const id = this.currentSlotId++;
    const full: Slot = { ...slot, id, isBooked: slot.isBooked ?? false, createdAt: new Date() };
    this.slots.set(id, full);
    return full;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const created: User = { ...user, id, phone: user.phone || null, role: user.role || "customer", createdAt: new Date() };
    this.users.set(id, created);
    return created;
  }

  async getVenues(): Promise<Venue[]> {
    return Array.from(this.venues.values());
  }

  async getVenue(id: number): Promise<Venue | undefined> {
    return this.venues.get(id);
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    return this.createVenueSync(venue);
  }

  async getTurfsByVenue(venueId: number): Promise<Turf[]> {
    return Array.from(this.turfs.values()).filter((t) => t.venueId === venueId);
  }

  async getTurf(id: number): Promise<Turf | undefined> {
    return this.turfs.get(id);
  }

  async createTurf(turf: InsertTurf): Promise<Turf> {
    return this.createTurfSync(turf);
  }

  async getSlots(turfId: number, date: string): Promise<Slot[]> {
    const turf = this.turfs.get(turfId);
    return this.ensureDailySlots(turfId, date, turf?.hourlyRate || 1400);
  }

  async getSlot(id: number): Promise<Slot | undefined> {
    return this.slots.get(id);
  }

  async createSlot(slot: InsertSlot): Promise<Slot> {
    return this.createSlotSync(slot);
  }

  /**
   * Transactional atomic booking creation with double-booking collision prevention.
   */
  async createBooking(booking: InsertBooking): Promise<{ booking: Booking; error?: string }> {
    const slot = this.slots.get(booking.slotId);
    if (!slot) {
      return {
        booking: {} as Booking,
        error: "Target slot does not exist",
      };
    }

    // Double booking guard
    if (slot.isBooked) {
      return {
        booking: {} as Booking,
        error: `Slot ${slot.startTime}–${slot.endTime} on ${slot.date} is already reserved.`,
      };
    }

    // Atomic lock
    slot.isBooked = true;
    this.slots.set(slot.id, slot);

    const id = this.currentBookingId++;
    const bookingCode = `TRF-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrData = JSON.stringify({
      code: bookingCode,
      venueId: booking.venueId,
      turfId: booking.turfId,
      slotId: booking.slotId,
      date: booking.date,
      time: `${booking.startTime}-${booking.endTime}`,
      customer: booking.customerName,
    });

    const fullBooking: Booking = {
      ...booking,
      id,
      bookingCode,
      userId: booking.userId || null,
      status: booking.status || "CONFIRMED",
      qrData,
      createdAt: new Date(),
    };

    this.bookings.set(id, fullBooking);
    return { booking: fullBooking };
  }

  async cancelBooking(id: number): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking ${id} not found`);
    }

    booking.status = "CANCELLED";
    this.bookings.set(id, booking);

    // Free up slot
    const slot = this.slots.get(booking.slotId);
    if (slot) {
      slot.isBooked = false;
      this.slots.set(slot.id, slot);
    }

    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingByCode(code: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find((b) => b.bookingCode === code);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter((b) => b.userId === userId);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
}

export const storage = new MemStorage();
