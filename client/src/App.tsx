import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Search,
  Trophy,
  Filter,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "./lib/utils";

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  sportTypes: string[];
  amenities: string[];
  images: string[];
  rating: string;
  turfs?: Turf[];
}

interface Turf {
  id: number;
  venueId: number;
  name: string;
  sportType: string;
  size: string;
  surfaceType: string;
  hourlyRate: number;
  hasFloodlights: boolean;
}

interface Slot {
  id: number;
  turfId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

interface Booking {
  id: number;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  venueId: number;
  turfId: number;
  slotId: number;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  qrData: string;
}

export default function App() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Booking Modal State
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);
  const [activeTurf, setActiveTurf] = useState<Turf | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    try {
      setLoading(true);
      const res = await fetch("/api/venues");
      const data = await res.json();
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load venues", err);
    } finally {
      setLoading(false);
    }
  }

  async function openBookingModal(venue: Venue) {
    setActiveVenue(venue);
    setConfirmedBooking(null);
    setSelectedSlot(null);
    setBookingError(null);

    // Fetch turfs for venue
    try {
      const res = await fetch(`/api/venues/${venue.id}`);
      const data = await res.json();
      if (data.turfs && data.turfs.length > 0) {
        setActiveTurf(data.turfs[0]);
        fetchSlots(data.turfs[0].id, selectedDate);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSlots(turfId: number, date: string) {
    try {
      setSlotsLoading(true);
      setSelectedSlot(null);
      const res = await fetch(`/api/turfs/${turfId}/slots?date=${date}`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch slots", err);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!activeVenue || !activeTurf || !selectedSlot) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: customerPhone || "9999999999",
          venueId: activeVenue.id,
          turfId: activeTurf.id,
          slotId: selectedSlot.id,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          totalAmount: selectedSlot.price,
          status: "CONFIRMED",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to confirm booking");
      }

      setConfirmedBooking(data);
      // Refresh slots
      fetchSlots(activeTurf.id, selectedDate);
    } catch (err: any) {
      setBookingError(err.message || "Slot conflict detected.");
    } finally {
      setBookingLoading(false);
    }
  }

  const filteredVenues = venues.filter((v) => {
    const matchesSport =
      selectedSport === "all" || v.sportTypes.includes(selectedSport);
    const matchesQuery =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesQuery;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-100">
      {/* Navigation Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Trophy className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Turf<span className="text-emerald-400">mate</span>
              </span>
              <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Live Slot Booking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden items-center gap-2 text-slate-400 sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Conflict-Free Locks</span>
            </div>
            <div className="hidden items-center gap-2 text-slate-400 sm:flex">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Instant QR Pass</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:py-16">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Real-Time Turf Booking & Match Scheduling
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Book Premium Sports Venues with{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Zero Double-Bookings
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-400 sm:text-base">
              Explore box cricket turfs, 7v7 football arenas, and indoor badminton courts.
              Pick live hourly slots, lock reservations with atomic database guarantees, and receive instant QR access passes.
            </p>

            {/* Search & Filter Controls */}
            <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 shadow-2xl sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search arena by name or location (e.g. Baner, Pune)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div className="flex gap-2">
                {["all", "cricket", "football", "badminton"].map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium capitalize transition-all ${
                      selectedSport === sport
                        ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Venue Listing Grid */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Available Venues</h2>
              <p className="text-xs text-slate-400">
                Showing {filteredVenues.length} sports facilities ready for slot reservation
              </p>
            </div>
            <button
              onClick={fetchVenues}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
                />
              ))}
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-2 text-sm text-slate-300">No matching sports facilities found.</p>
              <button
                onClick={() => {
                  setSelectedSport("all");
                  setSearchQuery("");
                }}
                className="mt-4 text-xs text-emerald-400 hover:underline"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-lg transition-all hover:border-emerald-500/40 hover:bg-slate-900"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                      <img
                        src={venue.images[0]}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                        ★ {venue.rating}
                      </div>
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {venue.sportTypes.map((st) => (
                          <span
                            key={st}
                            className="rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-200 backdrop-blur-md"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {venue.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{venue.address}, {venue.city}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {venue.amenities.map((am) => (
                          <span
                            key={am}
                            className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 capitalize"
                          >
                            ✓ {am.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 p-4 bg-slate-950/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Starts from</span>
                      <span className="text-sm font-bold text-emerald-400">₹1,000 / hr</span>
                    </div>

                    <button
                      onClick={() => openBookingModal(venue)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                    >
                      Book Slot <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Booking & Slot Matrix Modal */}
      {activeVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{activeVenue.name}</h3>
                <p className="text-xs text-slate-400">{activeVenue.address}</p>
              </div>
              <button
                onClick={() => setActiveVenue(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {confirmedBooking ? (
              /* Success / QR Confirmation State */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Booking Confirmed!</h4>
                  <p className="text-xs text-slate-400">
                    Your slot has been atomically locked and verified.
                  </p>
                </div>

                {/* Digital Pass Card */}
                <div className="mx-auto max-w-sm rounded-xl border border-emerald-500/30 bg-slate-950 p-5 shadow-xl space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Pass Code</span>
                      <p className="font-mono text-base font-bold text-emerald-400">
                        {confirmedBooking.bookingCode}
                      </p>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {confirmedBooking.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Customer:</span>
                      <span className="font-medium text-slate-200">{confirmedBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Date:</span>
                      <span className="font-medium text-slate-200">{confirmedBooking.date}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Time:</span>
                      <span className="font-medium text-slate-200">
                        {confirmedBooking.startTime} – {confirmedBooking.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Paid:</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(confirmedBooking.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="rounded-lg bg-white p-3 shadow-inner">
                      <QRCodeSVG value={confirmedBooking.qrData} size={130} />
                    </div>
                    <span className="mt-2 text-[10px] text-slate-500">
                      Scan at venue gate for automated check-in
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVenue(null)}
                  className="rounded-xl bg-slate-800 px-6 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Booking Configuration & Slot Matrix */
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                {/* Date Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (activeTurf) fetchSlots(activeTurf.id, e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Available Hourly Slots */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-slate-300">Choose Available Time Slot</label>
                    <span className="text-[10px] text-slate-500">Live Availability Matrix</span>
                  </div>

                  {slotsLoading ? (
                    <div className="flex justify-center py-6 text-xs text-slate-500">Loading slot grid...</div>
                  ) : slots.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-400">
                      No slots available for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {slots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-xl border p-2.5 text-center transition-all ${
                              slot.isBooked
                                ? "border-slate-800 bg-slate-950/50 text-slate-600 cursor-not-allowed opacity-50"
                                : isSelected
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20 font-bold"
                                : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                            }`}
                          >
                            <div className="text-xs font-semibold">
                              {slot.startTime} – {slot.endTime}
                            </div>
                            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
                              {slot.isBooked ? "Reserved" : formatCurrency(slot.price)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                  <div>
                    <label className="text-xs text-slate-400">Your Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Daanial Mirza"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {bookingError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {bookingError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedSlot || bookingLoading}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50 transition-all"
                >
                  {bookingLoading
                    ? "Locking Slot with Transaction..."
                    : selectedSlot
                    ? `Confirm & Pay ${formatCurrency(selectedSlot.price)}`
                    : "Select a Time Slot"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Recruiter Architecture Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-4xl space-y-2">
          <p className="font-semibold text-slate-400">
            Turfmate Engine — Built with Express, TypeScript, Drizzle ORM, and PostgreSQL
          </p>
          <p>
            Transactional slot locking prevents race conditions and ensures zero concurrent booking collisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
