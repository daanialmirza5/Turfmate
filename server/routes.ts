import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // 1. Venues Catalog
  app.get("/api/venues", async (_req: Request, res: Response) => {
    try {
      const venues = await storage.getVenues();
      res.json(venues);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch venues" });
    }
  });

  app.get("/api/venues/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid venue ID" });
      }
      const venue = await storage.getVenue(id);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      const turfs = await storage.getTurfsByVenue(id);
      res.json({ ...venue, turfs });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch venue" });
    }
  });

  // 2. Turfs & Slot Matrix
  app.get("/api/turfs/:id/slots", async (req: Request, res: Response) => {
    try {
      const turfId = parseInt(req.params.id);
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
      if (isNaN(turfId)) {
        return res.status(400).json({ message: "Invalid turf ID" });
      }
      const slots = await storage.getSlots(turfId, date);
      res.json(slots);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to fetch slots" });
    }
  });

  // 3. Bookings Engine with Double-Booking Prevention Lock
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const parsed = insertBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromZodError(parsed.error).message });
      }

      const result = await storage.createBooking(parsed.data);
      if (result.error) {
        return res.status(409).json({ message: result.error, code: "SLOT_ALREADY_BOOKED" });
      }

      res.status(201).json(result.booking);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to create booking" });
    }
  });

  // 4. Booking Lookup & QR Code Verification
  app.get("/api/bookings/:code", async (req: Request, res: Response) => {
    try {
      const code = req.params.code;
      const booking = await storage.getBookingByCode(code);
      if (!booking) {
        return res.status(404).json({ message: "Booking code not found" });
      }
      res.json(booking);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to lookup booking" });
    }
  });

  // 5. System Health Check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "healthy", service: "turfmate-engine", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
