/**
 * admin-test-booking.js — Automated Seat Booking Test Module for Admin
 * Simulates real customer bookings, automatically finding available seats,
 * assigning realistic passenger data, locking/booking seats, and updating stats.
 */

const TEST_PASSENGERS = [
  { title: 'นาย', first: 'สมศักดิ์', last: 'สยามภักดี', email: 'somsak.s@test.com', phone: '081-445-6789' },
  { title: 'นางสาว', first: 'นภาลัย', last: 'เพ็ญประภา', email: 'napalai.p@test.com', phone: '089-223-1122' },
  { title: 'นาย', first: 'เอกชัย', last: 'วงศ์สุวรรณ', email: 'ekkachai.w@test.com', phone: '086-778-9900' },
  { title: 'นางสาว', first: 'พัชราภา', last: 'รัตนมณี', email: 'patcharapa.r@test.com', phone: '095-334-5566' },
  { title: 'นาย', first: 'ธนดล', last: 'เจริญโชค', email: 'thanadol.c@test.com', phone: '082-998-7711' },
  { title: 'นาง', first: 'กรรณิการ์', last: 'สุขเกษม', email: 'kannika.s@test.com', phone: '084-556-3344' },
  { title: 'นาย', first: 'ปิยะวัฒน์', last: 'มั่นคงดี', email: 'piyawat.m@test.com', phone: '091-889-4455' },
  { title: 'นางสาว', first: 'ชลธิชา', last: 'แสงอรุณ', email: 'chonticha.s@test.com', phone: '083-112-9988' }
];

/**
 * Open the Auto-Booking Test modal
 */
function openAutoBookingModal() {
  const modal = document.getElementById('autoBookingModal');
  if (!modal) return;

  const sel = document.getElementById('autoBookFlightSelect');
  if (sel) {
    const flights = Storage.getFlights();
    sel.innerHTML = `<option value="RANDOM">🎲 สุ่มเที่ยวบินอัตโนมัติ (Random Flight)</option>` +
      flights.map(f => `<option value="${f.id}">${f.id} (${f.from.code} → ${f.to.code}) — ${f.departure} น.</option>`).join('');
  }

  modal.classList.add('active');
}

function closeAutoBookingModal() {
  const modal = document.getElementById('autoBookingModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Executes automatic booking of seats
 * @param {string} flightId - Flight ID or 'RANDOM'
 * @param {string} classPref - 'ANY', 'BUSINESS', or 'ECONOMY'
 * @param {number} count - number of seats to book (1-5)
 */
function executeAutoBooking(flightId = 'RANDOM', classPref = 'ANY', count = 1) {
  const flights = Storage.getFlights();
  if (flights.length === 0) {
    showToast('ไม่มีเที่ยวบินในระบบ ไม่สามารถจำลองการจองได้', 'error');
    return;
  }

  let bookedResults = [];

  for (let i = 0; i < count; i++) {
    // Determine target flight
    let targetFlight = null;
    if (flightId && flightId !== 'RANDOM') {
      targetFlight = Storage.getFlight(flightId);
    } else {
      // Pick random flight that has available seats
      const shuffled = [...flights].sort(() => 0.5 - Math.random());
      for (const f of shuffled) {
        if (findFirstAvailableSeat(f.id, classPref)) {
          targetFlight = f;
          break;
        }
      }
      if (!targetFlight) targetFlight = flights[Math.floor(Math.random() * flights.length)];
    }

    if (!targetFlight) continue;

    // Find available seat
    const availableSeat = findFirstAvailableSeat(targetFlight.id, classPref);
    if (!availableSeat) {
      continue;
    }

    // Pick random passenger
    const person = TEST_PASSENGERS[Math.floor(Math.random() * TEST_PASSENGERS.length)];
    const bookingId = Storage.generateBookingId();
    const isBusiness = availableSeat.seatClass === 'business';
    const baseFare = isBusiness ? Math.round(targetFlight.price * 2.5) : targetFlight.price;
    const vat = Math.round(baseFare * 0.07);
    const airportFee = 150;
    const total = baseFare + vat + airportFee;

    const booking = {
      id: bookingId,
      flightId: targetFlight.id,
      airlineName: targetFlight.airlineName || 'Xfly-Anyway Airlines',
      seatId: availableSeat.seatId,
      seatClass: availableSeat.seatClass,
      basePrice: baseFare,
      totalPrice: total,
      paymentMethod: 'Auto Test (Admin)',
      passenger: {
        title: person.title,
        firstName: person.first,
        lastName: person.last,
        email: person.email,
        phone: person.phone,
        idNumber: '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10000 + Math.random() * 90000) + '-00-1'
      },
      flight: {
        from: targetFlight.from,
        to: targetFlight.to,
        departure: targetFlight.departure,
        arrival: targetFlight.arrival,
        duration: targetFlight.duration,
        airlineName: targetFlight.airlineName || 'Xfly-Anyway Airlines'
      },
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };

    // 1. Mark seat as booked in storage
    Storage.bookSeat(targetFlight.id, availableSeat.seatId, bookingId);

    // 2. Add booking to history
    Storage.addBooking(booking);

    bookedResults.push({
      bookingId,
      flightId: targetFlight.id,
      seatId: availableSeat.seatId,
      passenger: `${person.first} ${person.last}`
    });
  }

  if (bookedResults.length === 0) {
    showToast('ไม่มีที่นั่งว่างในเที่ยวบินที่เลือก กรุณาเลือกเที่ยวบินอื่น', 'warning');
    return;
  }

  // Close modal if open
  closeAutoBookingModal();

  // Refresh admin displays
  if (typeof refreshAdminDashboard === 'function') {
    refreshAdminDashboard();
  }

  // Toast feedback
  if (bookedResults.length === 1) {
    const r = bookedResults[0];
    showToast(`✅ จำลองการจองอัตโนมัติสำเร็จ! รหัส ${r.bookingId} ที่นั่ง ${r.seatId} (${r.flightId}) 🎉`, 'success', 5000);
  } else {
    showToast(`✅ จำลองการจองอัตโนมัติสำเร็จ ${bookedResults.length} ที่นั่งเรียบร้อย! 🎉`, 'success', 5000);
  }
}

/**
 * Finds the first available seat on a given flight
 */
function findFirstAvailableSeat(flightId, classPref = 'ANY') {
  Storage.cleanExpiredLocks();
  const allSeats = Storage.getAllSeats();

  const businessRows = [1, 2];
  const economyRows = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Check Business
  if (classPref === 'ANY' || classPref === 'BUSINESS') {
    for (const r of businessRows) {
      for (const c of cols) {
        const seatId = `${r}${c}`;
        const s = allSeats[`${flightId}-${seatId}`];
        if (!s || s.status === 'available') {
          return { seatId, seatClass: 'business' };
        }
      }
    }
  }

  // Check Economy
  if (classPref === 'ANY' || classPref === 'ECONOMY') {
    for (const r of economyRows) {
      for (const c of cols) {
        const seatId = `${r}${c}`;
        const s = allSeats[`${flightId}-${seatId}`];
        if (!s || s.status === 'available') {
          return { seatId, seatClass: 'economy' };
        }
      }
    }
  }

  return null;
}

/**
 * Instant 1-click Quick Test function
 */
function quickAutoBookTest() {
  executeAutoBooking('RANDOM', 'ANY', 1);
}
