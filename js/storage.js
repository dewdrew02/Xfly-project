/**
 * storage.js — X-Fly Comprehensive Storage & Data Manager
 * Handles localStorage for seats, locks, booking history, airports, airlines, flights, and admin accounts
 */

const STORAGE_KEYS = {
  SEATS: 'xfly_seats',
  BOOKINGS: 'xfly_bookings',
  AIRPORTS: 'xfly_airports',
  AIRLINES: 'xfly_airlines',
  FLIGHTS: 'xfly_flights',
  ADMINS: 'xfly_admins',
  OWNERS: 'xfly_owners',
  OWNER_CONFIG: 'xfly_owner_config',
  LOCK_DURATION: 10 * 60 * 1000 // 10 minutes in ms
};

// Default Seed Datasets
const DEFAULT_AIRPORTS = [
  // Domestic (Thailand)
  { code: 'BKK', name: 'Suvarnabhumi International Airport', city: 'Bangkok', country: 'Thailand', active: true },
  { code: 'DMK', name: 'Don Mueang International Airport', city: 'Bangkok', country: 'Thailand', active: true },
  { code: 'CNX', name: 'Chiang Mai International Airport', city: 'Chiang Mai', country: 'Thailand', active: true },
  { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand', active: true },
  { code: 'USM', name: 'Samui International Airport', city: 'Koh Samui', country: 'Thailand', active: true },
  { code: 'KBV', name: 'Krabi International Airport', city: 'Krabi', country: 'Thailand', active: true },
  { code: 'UTH', name: 'Udon Thani International Airport', city: 'Udon Thani', country: 'Thailand', active: true },
  { code: 'CEI', name: 'Mae Fah Luang - Chiang Rai Airport', city: 'Chiang Rai', country: 'Thailand', active: true },
  // International (ต่างประเทศ)
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', active: true },
  { code: 'HND', name: 'Haneda International Airport', city: 'Tokyo', country: 'Japan', active: true },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', active: true },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', active: true },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', active: true },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', active: true },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', active: true },
  { code: 'TPE', name: 'Taiwan Taoyuan Airport', city: 'Taipei', country: 'Taiwan', active: true }
];

const DEFAULT_AIRLINES = [
  { code: 'XF', name: 'Xfly-Anyway Airlines', country: 'Thailand', fleet: 16, status: 'Active', logo: '✈️' },
  { code: 'TG', name: 'Thai Airways', country: 'Thailand', fleet: 48, status: 'Active', logo: '🟣' },
  { code: 'PG', name: 'Bangkok Airways', country: 'Thailand', fleet: 24, status: 'Active', logo: '🔵' },
  { code: 'FD', name: 'Thai AirAsia', country: 'Thailand', fleet: 36, status: 'Active', logo: '🔴' }
];

const DEFAULT_FLIGHTS = [
  // Domestic Routes
  {
    id: 'XF101',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'CNX', city: 'Chiang Mai', name: 'Chiang Mai Intl' },
    departure: '06:00',
    arrival: '07:15',
    duration: '1h 15m',
    price: 1290,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF202',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'HKT', city: 'Phuket', name: 'Phuket Intl' },
    departure: '08:30',
    arrival: '09:45',
    duration: '1h 15m',
    price: 1590,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF303',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'USM', city: 'Koh Samui', name: 'Samui Intl' },
    departure: '10:00',
    arrival: '11:20',
    duration: '1h 20m',
    price: 1890,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF404',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'CNX', city: 'Chiang Mai', name: 'Chiang Mai Intl' },
    to: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    departure: '13:00',
    arrival: '14:15',
    duration: '1h 15m',
    price: 1350,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF505',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'HKT', city: 'Phuket', name: 'Phuket Intl' },
    to: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    departure: '15:30',
    arrival: '16:45',
    duration: '1h 15m',
    price: 1650,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF606',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'KBV', city: 'Krabi', name: 'Krabi Intl' },
    departure: '17:00',
    arrival: '18:20',
    duration: '1h 20m',
    price: 1490,
    seats: { first: 12, business: 60 }
  },
  // International Routes (ต่างประเทศ)
  {
    id: 'XF701',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'NRT', city: 'Tokyo', name: 'Narita Intl' },
    departure: '08:00',
    arrival: '16:30',
    duration: '6h 30m',
    price: 8900,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF702',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'NRT', city: 'Tokyo', name: 'Narita Intl' },
    to: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    departure: '18:00',
    arrival: '23:00',
    duration: '7h 00m',
    price: 9200,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF801',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'SIN', city: 'Singapore', name: 'Changi Intl' },
    departure: '09:30',
    arrival: '13:00',
    duration: '2h 30m',
    price: 3450,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF802',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'SIN', city: 'Singapore', name: 'Changi Intl' },
    to: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    departure: '14:30',
    arrival: '16:00',
    duration: '2h 30m',
    price: 3450,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF901',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'ICN', city: 'Seoul', name: 'Incheon Intl' },
    departure: '23:30',
    arrival: '07:00',
    duration: '5h 30m',
    price: 7800,
    seats: { first: 12, business: 60 }
  },
  {
    id: 'XF951',
    airlineCode: 'XF',
    airlineName: 'Xfly-Anyway Airlines',
    from: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
    to: { code: 'LHR', city: 'London', name: 'Heathrow' },
    departure: '01:15',
    arrival: '07:45',
    duration: '12h 30m',
    price: 18900,
    seats: { first: 12, business: 60 }
  }
];

const DEFAULT_ADMINS = [
  {
    id: 'STF-001',
    name: 'X-Fly Operations Staff',
    email: 'staff@xfly.com',
    password: 'staff1234',
    role: 'staff',
    department: 'Airport Ground & Flight Ops',
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'STF-T01',
    name: 'Ticket Officer (เจ้าหน้าที่ตรวจสอบตั๋ว)',
    email: 'ticket@xfly.com',
    password: 'ticket1234',
    role: 'ticket',
    department: 'Passenger & Ticket Services',
    status: 'active',
    createdAt: '2026-02-15T08:00:00.000Z'
  },
  {
    id: 'ADM-001',
    name: 'System Administrator',
    email: 'admin@xfly.com',
    password: 'admin1234',
    role: 'staff_lead',
    department: 'Central IT & Operations',
    status: 'active',
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'ADM-002',
    name: 'Flight Operations Lead',
    email: 'ops@xfly.com',
    password: 'staff1234',
    role: 'staff',
    department: 'Flight Control',
    status: 'active',
    createdAt: '2026-02-01T10:30:00.000Z'
  }
];

const DEFAULT_OWNERS = [
  {
    id: 'OWN-001',
    name: 'X-Fly Executive Owner',
    email: 'owner@xfly.com',
    password: 'owner1234',
    role: 'owner',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

const DEFAULT_OWNER = DEFAULT_OWNERS[0];

const Storage = {
  // ─── Init ───────────────────────────────────────────────
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SEATS)) {
      localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    }

    // Merge missing airports (ensuring international destinations appear)
    const existingAirports = JSON.parse(localStorage.getItem(STORAGE_KEYS.AIRPORTS) || '[]');
    let airportsUpdated = false;
    DEFAULT_AIRPORTS.forEach(da => {
      if (!existingAirports.some(ea => ea.code === da.code)) {
        existingAirports.push(da);
        airportsUpdated = true;
      }
    });
    if (airportsUpdated || !localStorage.getItem(STORAGE_KEYS.AIRPORTS)) {
      localStorage.setItem(STORAGE_KEYS.AIRPORTS, JSON.stringify(existingAirports.length ? existingAirports : DEFAULT_AIRPORTS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.AIRLINES)) {
      localStorage.setItem(STORAGE_KEYS.AIRLINES, JSON.stringify(DEFAULT_AIRLINES));
    }

    // Merge missing flights (ensuring international flights appear)
    const existingFlights = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLIGHTS) || '[]');
    let flightsUpdated = false;
    DEFAULT_FLIGHTS.forEach(df => {
      if (!existingFlights.some(ef => ef.id === df.id)) {
        existingFlights.push(df);
        flightsUpdated = true;
      }
    });
    if (flightsUpdated || !localStorage.getItem(STORAGE_KEYS.FLIGHTS)) {
      localStorage.setItem(STORAGE_KEYS.FLIGHTS, JSON.stringify(existingFlights.length ? existingFlights : DEFAULT_FLIGHTS));
    }

    // Merge missing staff/ticket accounts
    const existingAdmins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
    let adminsUpdated = false;
    DEFAULT_ADMINS.forEach(da => {
      if (!existingAdmins.some(ea => ea.email.toLowerCase() === da.email.toLowerCase())) {
        existingAdmins.push(da);
        adminsUpdated = true;
      }
    });
    if (adminsUpdated || !localStorage.getItem(STORAGE_KEYS.ADMINS)) {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(existingAdmins.length ? existingAdmins : DEFAULT_ADMINS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.OWNERS)) {
      localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(DEFAULT_OWNERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OWNER_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(DEFAULT_OWNER));
    }
    this.cleanExpiredLocks();
  },

  // ─── Seats ──────────────────────────────────────────────
  getAllSeats() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEATS) || '{}');
  },

  getSeat(flightId, seatId) {
    const seats = this.getAllSeats();
    const key = `${flightId}-${seatId}`;
    return seats[key] || { status: 'available' };
  },

  setSeat(flightId, seatId, data) {
    const seats = this.getAllSeats();
    const key = `${flightId}-${seatId}`;
    seats[key] = data;
    localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify(seats));
  },

  // ─── Lock System ──────────────────────────────────────────
  lockSeat(flightId, seatId, sessionId) {
    const seat = this.getSeat(flightId, seatId);
    if (seat.status !== 'available') return false;

    const lockedAt = Date.now();
    this.setSeat(flightId, seatId, {
      status: 'locked',
      lockedAt: lockedAt,
      sessionId: sessionId,
      flightId: flightId,
      seatId: seatId
    });

    if (typeof db !== 'undefined') {
      try {
        db.from('seat_locks').upsert({
          flight_seat_id: `${flightId}-${seatId}`,
          flight_id: flightId,
          seat_id: seatId,
          status: 'locked',
          session_id: sessionId,
          locked_at: lockedAt
        }).then(() => {}).catch(() => {});
      } catch(e) {}
    }
    return true;
  },

  unlockSeat(flightId, seatId, sessionId) {
    const seat = this.getSeat(flightId, seatId);
    if (seat.status === 'locked' && seat.sessionId === sessionId) {
      this.setSeat(flightId, seatId, { status: 'available' });

      if (typeof db !== 'undefined') {
        try {
          db.from('seat_locks').upsert({
            flight_seat_id: `${flightId}-${seatId}`,
            flight_id: flightId,
            seat_id: seatId,
            status: 'available',
            session_id: null,
            locked_at: null
          }).then(() => {}).catch(() => {});
        } catch(e) {}
      }
      return true;
    }
    return false;
  },

  bookSeat(flightId, seatId, bookingId) {
    const bookedAt = Date.now();
    this.setSeat(flightId, seatId, {
      status: 'booked',
      bookingId: bookingId,
      bookedAt: bookedAt
    });

    if (typeof db !== 'undefined') {
      try {
        db.from('seat_locks').upsert({
          flight_seat_id: `${flightId}-${seatId}`,
          flight_id: flightId,
          seat_id: seatId,
          status: 'booked',
          booking_id: bookingId,
          locked_at: bookedAt
        }).then(() => {}).catch(() => {});
      } catch(e) {}
    }
  },

  cleanExpiredLocks() {
    const seats = this.getAllSeats();
    const now = Date.now();
    let changed = false;

    Object.keys(seats).forEach(key => {
      const seat = seats[key];
      if (seat.status === 'locked') {
        const elapsed = now - seat.lockedAt;
        if (elapsed > STORAGE_KEYS.LOCK_DURATION) {
          seats[key] = { status: 'available' };
          changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify(seats));
    }
  },

  getLockTimeRemaining(flightId, seatId) {
    const seat = this.getSeat(flightId, seatId);
    if (seat.status !== 'locked') return 0;
    const elapsed = Date.now() - seat.lockedAt;
    return Math.max(0, STORAGE_KEYS.LOCK_DURATION - elapsed);
  },

  isMyLock(flightId, seatId, sessionId) {
    const seat = this.getSeat(flightId, seatId);
    return seat.status === 'locked' && seat.sessionId === sessionId;
  },

  // ─── Bookings ─────────────────────────────────────────────
  getAllBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  },

  addBooking(booking) {
    const bookings = this.getAllBookings();
    bookings.unshift(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  getBooking(bookingId) {
    return this.getAllBookings().find(b => b.id === bookingId) || null;
  },

  cancelBooking(bookingId) {
    const bookings = this.getAllBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;

    const booking = bookings[idx];
    bookings[idx].status = 'cancelled';
    bookings[idx].cancelledAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Free the seat
    if (booking.flightId && booking.seatId) {
      this.setSeat(booking.flightId, booking.seatId, { status: 'available' });
    }
    return true;
  },

  getAirports() {
    const data = localStorage.getItem(STORAGE_KEYS.AIRPORTS);
    if (!data) return DEFAULT_AIRPORTS;
    try {
      const list = JSON.parse(data);
      let changed = false;
      DEFAULT_AIRPORTS.forEach(da => {
        if (!list.some(a => a.code === da.code)) {
          list.push(da);
          changed = true;
        }
      });
      if (changed) localStorage.setItem(STORAGE_KEYS.AIRPORTS, JSON.stringify(list));
      return list;
    } catch(e) {
      return DEFAULT_AIRPORTS;
    }
  },

  saveAirport(airport) {
    const list = this.getAirports();
    const code = airport.code.toUpperCase();
    const item = { ...airport, code, active: airport.active !== false };
    const idx = list.findIndex(a => a.code.toUpperCase() === code);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.AIRPORTS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('airports').upsert({
          code: item.code,
          name: item.name,
          city: item.city,
          country: item.country || 'Thailand',
          active: item.active
        }).then(() => {}).catch(e => console.warn('Supabase airport sync notice:', e));
      } catch(e) {}
    }
    return true;
  },

  deleteAirport(code) {
    const ucCode = code.toUpperCase();
    const list = this.getAirports().filter(a => a.code.toUpperCase() !== ucCode);
    localStorage.setItem(STORAGE_KEYS.AIRPORTS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('airports').delete().eq('code', ucCode).then(() => {}).catch(e => console.warn('Supabase airport delete notice:', e));
      } catch(e) {}
    }
    return true;
  },

  // ─── Airlines (CRUD) ───────────────────────────────────────
  getAirlines() {
    const data = localStorage.getItem(STORAGE_KEYS.AIRLINES);
    return data ? JSON.parse(data) : DEFAULT_AIRLINES;
  },

  saveAirline(airline) {
    const list = this.getAirlines();
    const code = airline.code.toUpperCase();
    const item = { ...airline, code };
    const idx = list.findIndex(a => a.code.toUpperCase() === code);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.AIRLINES, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('airlines').upsert({
          code: item.code,
          name: item.name,
          country: item.country || 'Thailand',
          fleet: item.fleet || 1,
          status: item.status || 'Active',
          logo: item.logo || '✈️'
        }).then(() => {}).catch(e => console.warn('Supabase airline sync notice:', e));
      } catch(e) {}
    }
    return true;
  },

  deleteAirline(code) {
    const ucCode = code.toUpperCase();
    const list = this.getAirlines().filter(a => a.code.toUpperCase() !== ucCode);
    localStorage.setItem(STORAGE_KEYS.AIRLINES, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('airlines').delete().eq('code', ucCode).then(() => {}).catch(e => console.warn('Supabase airline delete notice:', e));
      } catch(e) {}
    }
    return true;
  },

  getFlights() {
    const data = localStorage.getItem(STORAGE_KEYS.FLIGHTS);
    if (!data) return DEFAULT_FLIGHTS;
    try {
      const list = JSON.parse(data);
      let changed = false;
      DEFAULT_FLIGHTS.forEach(df => {
        if (!list.some(f => f.id === df.id)) {
          list.push(df);
          changed = true;
        }
      });
      if (changed) localStorage.setItem(STORAGE_KEYS.FLIGHTS, JSON.stringify(list));
      return list;
    } catch(e) {
      return DEFAULT_FLIGHTS;
    }
  },

  getFlight(flightId) {
    return this.getFlights().find(f => f.id === flightId) || null;
  },

  saveFlight(flight) {
    const list = this.getFlights();
    const idx = list.findIndex(f => f.id === flight.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...flight };
    } else {
      list.push(flight);
    }
    localStorage.setItem(STORAGE_KEYS.FLIGHTS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('flights').upsert({
          id: flight.id,
          airline_code: flight.airlineCode || 'XF',
          airline_name: flight.airlineName || 'Xfly-Anyway Airlines',
          from_code: flight.from?.code,
          from_city: flight.from?.city,
          from_name: flight.from?.name || flight.from?.city,
          to_code: flight.to?.code,
          to_city: flight.to?.city,
          to_name: flight.to?.name || flight.to?.city,
          departure: flight.departure,
          arrival: flight.arrival,
          duration: flight.duration,
          price: flight.price,
          seats_business: flight.seats?.business || 4,
          seats_economy: flight.seats?.economy || 30
        }).then(() => {}).catch(e => console.warn('Supabase flight sync notice:', e));
      } catch(e) {}
    }
    return true;
  },

  deleteFlight(flightId) {
    const list = this.getFlights().filter(f => f.id !== flightId);
    localStorage.setItem(STORAGE_KEYS.FLIGHTS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('flights').delete().eq('id', flightId).then(() => {}).catch(e => console.warn('Supabase flight delete notice:', e));
      } catch(e) {}
    }
    return true;
  },

  // ─── Admins (CRUD) ─────────────────────────────────────────
  getAdmins() {
    const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (!data) return DEFAULT_ADMINS;
    try {
      const list = JSON.parse(data);
      let changed = false;
      DEFAULT_ADMINS.forEach(da => {
        if (!list.some(a => a.email.toLowerCase() === da.email.toLowerCase())) {
          list.push(da);
          changed = true;
        }
      });
      if (changed) localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
      return list;
    } catch(e) {
      return DEFAULT_ADMINS;
    }
  },

  saveAdmin(admin) {
    const list = this.getAdmins();
    const idx = list.findIndex(a => a.email.toLowerCase() === admin.email.toLowerCase());
    let savedAdmin;
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...admin };
      savedAdmin = list[idx];
    } else {
      savedAdmin = {
        id: 'ADM-' + String(list.length + 1).padStart(3, '0'),
        createdAt: new Date().toISOString(),
        status: 'active',
        ...admin
      };
      list.push(savedAdmin);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('admins').upsert({
          id: savedAdmin.id,
          name: savedAdmin.name,
          email: savedAdmin.email,
          password: savedAdmin.password,
          role: savedAdmin.role || 'admin',
          department: savedAdmin.department || 'Flight Operations',
          status: savedAdmin.status || 'active'
        }).then(() => {}).catch(e => console.warn('Supabase admin sync notice:', e));
      } catch(e) {}
    }
    return true;
  },

  deleteAdmin(email) {
    const list = this.getAdmins().filter(a => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('admins').delete().eq('email', email).then(() => {}).catch(e => console.warn('Supabase admin delete notice:', e));
      } catch(e) {}
    }
    return true;
  },

  // ─── Admin / Staff / Ticket Verification ────────────────────────────
  verifyAdmin(email, password) {
    const admins = this.getAdmins();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    return admins.find(a =>
      (a.email.toLowerCase() === cleanEmail ||
       (cleanEmail === 'admin' && a.email.toLowerCase() === 'admin@xfly.com') ||
       (cleanEmail === 'staff' && a.email.toLowerCase() === 'staff@xfly.com') ||
       (cleanEmail === 'ticket' && a.email.toLowerCase() === 'ticket@xfly.com')) &&
      a.password === cleanPass &&
      a.status === 'active'
    ) || null;
  },

  verifyStaff(email, password) {
    return this.verifyAdmin(email, password);
  },

  verifyTicketOfficer(email, password) {
    const user = this.verifyAdmin(email, password);
    if (user && (user.role === 'ticket' || user.email.toLowerCase() === 'ticket@xfly.com')) {
      return user;
    }
    return null;
  },

  // ─── Owners (Auth & Management) ────────────────────────────
  getOwners() {
    const data = localStorage.getItem(STORAGE_KEYS.OWNERS);
    return data ? JSON.parse(data) : DEFAULT_OWNERS;
  },

  getOwner(email) {
    const list = this.getOwners();
    if (!email) return list[0] || DEFAULT_OWNERS[0];
    return list.find(o => o.email.toLowerCase() === email.toLowerCase()) || null;
  },

  saveOwner(owner) {
    const list = this.getOwners();
    const idx = list.findIndex(o => o.email.toLowerCase() === owner.email.toLowerCase());
    let savedOwner;
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...owner };
      savedOwner = list[idx];
    } else {
      savedOwner = {
        id: 'OWN-' + String(list.length + 1).padStart(3, '0'),
        createdAt: new Date().toISOString(),
        status: 'active',
        role: 'owner',
        ...owner
      };
      list.push(savedOwner);
    }
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(savedOwner));

    if (typeof db !== 'undefined') {
      try {
        db.from('owners').upsert({
          id: savedOwner.id,
          name: savedOwner.name,
          email: savedOwner.email,
          password: savedOwner.password,
          role: savedOwner.role || 'owner',
          status: savedOwner.status || 'active'
        }).then(() => {}).catch(e => console.warn('Supabase owner sync notice:', e));
      } catch(e) {}
    }
    return true;
  },

  deleteOwner(email) {
    const list = this.getOwners().filter(o => o.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(list));

    if (typeof db !== 'undefined') {
      try {
        db.from('owners').delete().eq('email', email).then(() => {}).catch(e => console.warn('Supabase owner delete notice:', e));
      } catch(e) {}
    }
    return true;
  },

  verifyOwner(email, password) {
    const owners = this.getOwners();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    return owners.find(o =>
      (o.email.toLowerCase() === cleanEmail || (cleanEmail === 'owner' && o.email.toLowerCase() === 'owner@xfly.com')) &&
      o.password === cleanPass &&
      o.status === 'active'
    ) || null;
  },

  // ─── Stats & Metrics ───────────────────────────────────────
  getStats() {
    const bookings = this.getAllBookings();
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const totalSpent = confirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return {
      total: bookings.length,
      confirmed: confirmed.length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalSpent
    };
  },

  // ─── Utils ─────────────────────────────────────────────────
  generateBookingId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'XF-';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  },

  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();
  }
};

// Global accessor for legacy compatibility
Object.defineProperty(window, 'FLIGHTS', {
  get: () => Storage.getFlights(),
  configurable: true
});

// Toast notification helper
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: '✈️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Format currency
function formatPrice(amount) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount || 0);
}

// Format date
function formatDate(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ═══════════════════════════════════════════
// Supabase Sync (Full Two-Way Integration)
// ═══════════════════════════════════════════
const _originalAddBooking = Storage.addBooking.bind(Storage);
Storage.addBooking = async function(booking) {
  _originalAddBooking(booking);
  if (typeof db !== 'undefined') {
    try {
      const { data: { session } } = await db.auth.getSession();
      const passengerFullName = `${booking.passenger?.title ? booking.passenger.title + ' ' : ''}${booking.passenger?.firstName || ''} ${booking.passenger?.lastName || ''}`.trim();

      // Primary attempt: all columns
      const payload = {
        id:                  booking.id,
        user_id:             session?.user?.id || null,
        flight_id:           booking.flightId,
        airline_name:        booking.airlineName || 'Xfly-Anyway Airlines',
        seat_id:             booking.seatId,
        seat_class:          booking.seatClass,
        base_price:          booking.basePrice,
        total_price:         booking.totalPrice,
        payment_method:      booking.paymentMethod || 'Credit Card',
        passenger_title:     booking.passenger?.title || '',
        passenger_name:      passengerFullName,
        passenger_email:     booking.passenger?.email,
        passenger_phone:     booking.passenger?.phone,
        passenger_id_number: booking.passenger?.idNumber || '',
        flight_from:         booking.flight?.from?.code,
        flight_to:           booking.flight?.to?.code,
        departure:           booking.flight?.departure,
        arrival:             booking.flight?.arrival,
        status:              booking.status || 'confirmed'
      };

      const { error } = await db.from('bookings').insert(payload);
      if (error) {
        // Fallback attempt: core legacy columns only if new columns aren't migrated yet
        await db.from('bookings').insert({
          id:              booking.id,
          user_id:         session?.user?.id || null,
          flight_id:       booking.flightId,
          seat_id:         booking.seatId,
          seat_class:      booking.seatClass,
          base_price:      booking.basePrice,
          total_price:     booking.totalPrice,
          passenger_name:  passengerFullName,
          passenger_email: booking.passenger?.email,
          passenger_phone: booking.passenger?.phone,
          flight_from:     booking.flight?.from?.code,
          flight_to:       booking.flight?.to?.code,
          departure:       booking.flight?.departure,
          arrival:         booking.flight?.arrival,
          status:          booking.status || 'confirmed'
        });
      }
    } catch(e) {
      console.warn('Supabase sync notice:', e.message);
    }
  }
};

async function loadBookingsFromSupabase(forUserId = null) {
  if (typeof db === 'undefined') return Storage.getAllBookings();
  try {
    let query = db.from('bookings').select('*').order('booked_at', { ascending: false });
    if (forUserId) {
      query = query.eq('user_id', forUserId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return Storage.getAllBookings();

    // Merge Supabase bookings into LocalStorage so both stay perfectly synced
    const local = Storage.getAllBookings();
    const map = new Map();
    local.forEach(b => map.set(b.id, b));

    data.forEach(b => {
      map.set(b.id, {
        id: b.id,
        flightId: b.flight_id,
        airlineName: b.airline_name || 'Xfly-Anyway Airlines',
        seatId: b.seat_id,
        seatClass: b.seat_class,
        basePrice: b.base_price,
        totalPrice: b.total_price,
        paymentMethod: b.payment_method || 'Online Payment',
        passenger: {
          title:    b.passenger_title || '',
          firstName: b.passenger_name?.split(' ')[0] || '',
          lastName:  b.passenger_name?.split(' ').slice(1).join(' ') || '',
          email:     b.passenger_email,
          phone:     b.passenger_phone,
          idNumber:  b.passenger_id_number || ''
        },
        flight: {
          from: { code: b.flight_from, city: b.flight_from },
          to:   { code: b.flight_to,   city: b.flight_to },
          departure: b.departure,
          arrival:   b.arrival,
          duration:  ''
        },
        status:   b.status,
        bookedAt: b.booked_at
      });
    });

    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(merged));
    return merged;
  } catch(e) {
    return Storage.getAllBookings();
  }
}

const _originalCancelBooking = Storage.cancelBooking.bind(Storage);
Storage.cancelBooking = async function(bookingId) {
  const result = _originalCancelBooking(bookingId);
  if (result && typeof db !== 'undefined') {
    try {
      await db.from('bookings').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      }).eq('id', bookingId);
    } catch(e) {
      console.warn('Supabase cancel sync notice:', e.message);
    }
  }
  return result;
};

// Background Initializer to pull latest data from Supabase if tables exist
async function syncFromSupabase() {
  if (typeof db === 'undefined') return;

  // 1. Sync Airports
  try {
    const { data: airports, error } = await db.from('airports').select('*');
    if (!error && airports && airports.length > 0) {
      localStorage.setItem(STORAGE_KEYS.AIRPORTS, JSON.stringify(airports));
    }
  } catch(e) {}

  // 2. Sync Airlines
  try {
    const { data: airlines, error } = await db.from('airlines').select('*');
    if (!error && airlines && airlines.length > 0) {
      localStorage.setItem(STORAGE_KEYS.AIRLINES, JSON.stringify(airlines));
    }
  } catch(e) {}

  // 3. Sync Flights
  try {
    const { data: flights, error } = await db.from('flights').select('*');
    if (!error && flights && flights.length > 0) {
      const mapped = flights.map(f => ({
        id: f.id,
        airlineCode: f.airline_code || 'XF',
        airlineName: f.airline_name || 'Xfly-Anyway Airlines',
        from: { code: f.from_code, city: f.from_city, name: f.from_name || f.from_city },
        to:   { code: f.to_code,   city: f.to_city,   name: f.to_name || f.to_city },
        departure: f.departure,
        arrival:   f.arrival,
        duration:  f.duration,
        price:     f.price,
        seats: { business: f.seats_business || 4, economy: f.seats_economy || 30 }
      }));
      localStorage.setItem(STORAGE_KEYS.FLIGHTS, JSON.stringify(mapped));
    }
  } catch(e) {}

  // 4. Sync Admins
  try {
    const { data: admins, error } = await db.from('admins').select('*');
    if (!error && admins && admins.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    }
  } catch(e) {}

  // 5. Sync Owners
  try {
    const { data: owners, error } = await db.from('owners').select('*');
    if (!error && owners && owners.length > 0) {
      localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(owners));
      if (owners[0]) {
        localStorage.setItem(STORAGE_KEYS.OWNER_CONFIG, JSON.stringify(owners[0]));
      }
    }
  } catch(e) {}

  // 6. Sync Bookings
  try {
    await loadBookingsFromSupabase();
  } catch(e) {}

  // 7. Sync Seat Locks
  try {
    const { data: locks, error } = await db.from('seat_locks').select('*');
    if (!error && locks && locks.length > 0) {
      const seats = Storage.getAllSeats();
      locks.forEach(l => {
        seats[l.flight_seat_id] = {
          status: l.status,
          sessionId: l.session_id,
          bookingId: l.booking_id,
          lockedAt: l.locked_at ? Number(l.locked_at) : Date.now()
        };
      });
      localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify(seats));
    }
  } catch(e) {}
}

// Auto-run non-blocking sync on window load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(syncFromSupabase, 800);
  });
}

