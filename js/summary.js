/**
 * summary.js — X-Fly Booking Summary Logic
 * Reviews itinerary, passenger details, seat selection, and price calculation
 */

let pending = null;
let flight = null;
let passenger = null;
let timerInterval = null;
const LOCK_DURATION = 10 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();

  const rawPending = sessionStorage.getItem('pendingBooking');
  const rawPassenger = sessionStorage.getItem('passengerDraft');

  if (!rawPending || !rawPassenger) {
    showToast('ข้อมูลการจองไม่ครบถ้วน กรุณาเริ่มใหม่อีกครั้ง', 'warning');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  pending = JSON.parse(rawPending);
  passenger = JSON.parse(rawPassenger);
  flight = Storage.getFlight(pending.flightId);

  if (!flight) {
    window.location.href = 'index.html';
    return;
  }

  renderDetails();
  startLockTimer();
});

window.addEventListener('beforeunload', () => {
  if (timerInterval) clearInterval(timerInterval);
});

function renderDetails() {
  // 1. Flight Itinerary
  document.getElementById('flightIdTag').textContent = flight.id;
  document.getElementById('sumFromCode').textContent = flight.from.code;
  document.getElementById('sumFromCity').textContent = flight.from.city;
  document.getElementById('sumDepartureTime').textContent = flight.departure + ' น.';

  document.getElementById('sumToCode').textContent = flight.to.code;
  document.getElementById('sumToCity').textContent = flight.to.city;
  document.getElementById('sumArrivalTime').textContent = flight.arrival + ' น.';

  document.getElementById('sumDuration').textContent = flight.duration;
  document.getElementById('sumAirline').textContent = flight.airlineName || 'Xfly-Anyway Airlines';
  document.getElementById('sumFlightDate').textContent = new Date().toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // 2. Passenger Details
  document.getElementById('sumPassengerName').textContent = `${passenger.title || ''} ${passenger.firstName} ${passenger.lastName}`;
  document.getElementById('sumPassengerId').textContent = passenger.idNumber || '-';
  document.getElementById('sumPassengerEmail').textContent = passenger.email;
  document.getElementById('sumPassengerPhone').textContent = passenger.phone;

  // 3. Seat Details
  document.getElementById('sumSeatNumber').textContent = pending.seatId;
  const isBusiness = pending.seatClass === 'business';
  document.getElementById('sumSeatClass').textContent = isBusiness ? '✨ Business Class' : 'Economy Class';
  document.getElementById('sumSeatDesc').textContent = isBusiness
    ? 'แถวหน้าสุด กว้างขวาง พร้อมบริการเครื่องดื่มพรีเมียมและอาหารพิเศษ'
    : 'ที่นั่งมาตรฐาน พร้อมพื้นที่วางขาที่สะดวกสบายและการบริการมาตรฐาน X-Fly';

  // 4. Pricing Breakdown
  const baseFare = pending.price;
  const vat = Math.round(baseFare * 0.07);
  const airportFee = 150;
  const grandTotal = baseFare + vat + airportFee;

  document.getElementById('priceBaseFare').textContent = formatPrice(baseFare);
  document.getElementById('priceVat').textContent = formatPrice(vat);
  document.getElementById('priceAirportFee').textContent = formatPrice(airportFee);
  document.getElementById('priceGrandTotal').textContent = formatPrice(grandTotal);

  // Store computed pricing in pendingBooking
  pending.baseFare = baseFare;
  pending.vat = vat;
  pending.airportFee = airportFee;
  pending.totalPrice = grandTotal;
  sessionStorage.setItem('pendingBooking', JSON.stringify(pending));
}

function startLockTimer() {
  const elapsed = Date.now() - (pending.lockedAt || Date.now());
  let remaining = Math.max(0, LOCK_DURATION - elapsed);

  function update() {
    if (remaining <= 0) {
      clearInterval(timerInterval);
      showToast('หมดเวลาล็อกที่นั่ง กรุณาเลือกที่นั่งใหม่อีกครั้ง', 'error');
      Storage.unlockSeat(pending.flightId, pending.seatId, pending.sessionId);
      sessionStorage.removeItem('pendingBooking');
      setTimeout(() => window.location.href = 'seat.html', 1500);
      return;
    }

    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const display = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

    const el = document.getElementById('summaryTimerCount');
    const badge = document.getElementById('summaryTimerBadge');
    if (el) el.textContent = display;
    if (badge) {
      badge.className = remaining < 60000 ? 'timer-badge urgent' : 'timer-badge';
    }

    remaining -= 1000;
  }

  update();
  timerInterval = setInterval(update, 1000);
}

function confirmAndGoToPayment() {
  window.location.href = 'payment.html';
}
