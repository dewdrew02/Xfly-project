/**
 * ticket.js — X-Fly Digital Boarding Pass Logic
 * Loads confirmed booking by ID and renders printable electronic ticket
 */

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();

  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id') || sessionStorage.getItem('lastBookingId');

  if (!bookingId) {
    showToast('ไม่พบรหัสบัตรโดยสาร', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  const booking = Storage.getBooking(bookingId);
  if (!booking) {
    showToast('ไม่พบข้อมูลการจองนี้ในระบบ', 'error');
    setTimeout(() => window.location.href = 'index.html', 1500);
    return;
  }

  renderBoardingPass(booking);
});

function renderBoardingPass(b) {
  const flight = Storage.getFlight(b.flightId) || b.flight || {};

  document.getElementById('ticketAirline').textContent = b.airlineName || flight.airlineName || 'Xfly-Anyway Airlines';
  document.getElementById('ticketPnr').textContent = b.id;

  const p = b.passenger || {};
  document.getElementById('ticketPassengerName').textContent = `${p.title || ''} ${p.firstName || ''} ${p.lastName || ''}`.trim() || 'PASSENGER';
  document.getElementById('ticketPassengerContact').textContent = `${p.phone || ''} · ${p.email || ''}`;

  const from = flight.from || {};
  const to = flight.to || {};
  document.getElementById('ticketFromCode').textContent = from.code || '-';
  document.getElementById('ticketFromCity').textContent = from.city || '-';
  document.getElementById('ticketDepTime').textContent = (flight.departure || '06:00') + ' น.';

  document.getElementById('ticketToCode').textContent = to.code || '-';
  document.getElementById('ticketToCity').textContent = to.city || '-';
  document.getElementById('ticketArrTime').textContent = (flight.arrival || '07:15') + ' น.';

  document.getElementById('ticketDuration').textContent = flight.duration || '1h 15m';
  document.getElementById('ticketFlightId').textContent = b.flightId || flight.id || '-';

  const bookedDate = b.bookedAt ? new Date(b.bookedAt) : new Date();
  document.getElementById('ticketDate').textContent = bookedDate.toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // Calculate boarding time (30 mins before departure)
  if (flight.departure) {
    const parts = flight.departure.split(':');
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 30;
    if (m < 0) {
      m += 60;
      h = (h - 1 + 24) % 24;
    }
    document.getElementById('ticketBoardingTime').textContent =
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} น.`;
  } else {
    document.getElementById('ticketBoardingTime').textContent = '05:30 น.';
  }

  document.getElementById('ticketSeat').textContent = b.seatId || '-';
  const isBusiness = b.seatClass === 'business';
  const classTag = document.getElementById('ticketClassTag');
  if (classTag) {
    classTag.textContent = isBusiness ? '✨ Business' : 'Economy';
    classTag.className = isBusiness ? 'tag tag-business' : 'tag tag-economy';
  }

  document.getElementById('ticketBarcodeText').textContent = `${b.id}-${b.seatId}`;
  document.getElementById('ticketPrice').textContent = formatPrice(b.totalPrice || b.basePrice || 0);
}
