import { pgTable, text, serial, integer, boolean, timestamp, json, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // 'customer' | 'venue_admin' | 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull().default("Pune"),
  sportTypes: text("sport_types").array().notNull(), // ['cricket', 'football', 'badminton']
  amenities: text("amenities").array().notNull(), // ['parking', 'floodlights', 'lockers', 'cafeteria']
  images: text("images").array().notNull(),
  rating: numeric("rating").default("4.8").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const turfs = pgTable("turfs", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  name: text("name").notNull(),
  sportType: text("sport_type").notNull(),
  size: text("size").notNull(), // e.g. "7v7", "Full Ground", "Court 1"
  surfaceType: text("surface_type").notNull().default("AstroTurf"),
  hourlyRate: integer("hourly_rate").notNull(), // in INR / local currency
  hasFloodlights: boolean("has_floodlights").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  turfId: integer("turf_id").notNull().references(() => turfs.id),
  date: text("date").notNull(), // YYYY-MM-DD
  startTime: text("start_time").notNull(), // HH:MM
  endTime: text("end_time").notNull(), // HH:MM
  price: integer("price").notNull(),
  isBooked: boolean("is_booked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingCode: text("booking_code").notNull().unique(), // e.g. "TRF-84920"
  userId: integer("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  turfId: integer("turf_id").notNull().references(() => turfs.id),
  slotId: integer("slot_id").notNull().references(() => slots.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("CONFIRMED"), // 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  qrData: text("qr_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVenueSchema = createInsertSchema(venues).omit({ id: true, createdAt: true });
export const insertTurfSchema = createInsertSchema(turfs).omit({ id: true, createdAt: true });
export const insertSlotSchema = createInsertSchema(slots).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, bookingCode: true, qrData: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;

export type Turf = typeof turfs.$inferSelect;
export type InsertTurf = z.infer<typeof insertTurfSchema>;

export type Slot = typeof slots.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
