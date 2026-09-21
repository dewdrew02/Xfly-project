/**
 * payment.js — X-Fly Payment Page Logic
 * Handles payment methods, live lock timer, and booking issuance to ticket.html
 */

let pending = null;
let passenger = null;
let flight = null;
let timerInterval = null;
const LOCK_DURATION = 10 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();

  const rawPending = sessionStorage.getItem('pendingBooking');
  const rawPassenger = sessionStorage.getItem('passengerDraft');

  if (!rawPending || !rawPassenger) {
    showToast('ไม่พบข้อมูลการจอง กรุณาเริ่มใหม่อีกครั้ง', 'error');
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

  renderSummary();
  startTimer();
  setupCardForm();
});

window.addEventListener('beforeunload', () => {
  if (timerInterval) clearInterval(timerInterval);
});

function renderSummary() {
  const total = pending.totalPrice || (pending.price + Math.round(pending.price * 0.07) + 150);

  document.getElementById('sumFlight').textContent = flight.id;
  document.getElementById('sumRoute').textContent = `${flight.from.city} → ${flight.to.city}`;
  document.getElementById('sumPassenger').textContent = `${passenger.title || ''} ${passenger.firstName} ${passenger.lastName}`;
  document.getElementById('sumDeparture').textContent = `${flight.departure} → ${flight.arrival}`;
  document.getElementById('sumSeat').textContent = pending.seatId;
  document.getElementById('sumClass').textContent = pending.seatClass === 'first' ? '👑 First Class' : '✨ Business Class';
  document.getElementById('sumBasePrice').textContent = formatPrice(pending.price);
  document.getElementById('sumTax').textContent = formatPrice(Math.round(pending.price * 0.07));
  document.getElementById('sumTotal').textContent = formatPrice(total);

  document.querySelectorAll('.pay-amount-label').forEach(el => {
    el.textContent = formatPrice(total);
  });

  // Calculate crypto amounts
  const btc = (total / 2450000).toFixed(6);
  const eth = (total / 115000).toFixed(4);
  const btcLabel = document.getElementById('btcAmountLabel');
  const ethLabel = document.getElementById('ethAmountLabel');
  if (btcLabel) btcLabel.textContent = `${btc} BTC`;
  if (ethLabel) ethLabel.textContent = `${eth} ETH`;
}

function startTimer() {
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

    const el = document.getElementById('timerCount');
    const badge = document.getElementById('timerBadge');
    if (el) el.textContent = display;
    if (badge) {
      badge.className = remaining < 60000 ? 'timer-badge urgent' : 'timer-badge';
    }

    remaining -= 1000;
  }

  update();
  timerInterval = setInterval(update, 1000);
}

function switchPaymentMethod(method) {
  ['card', 'qr', 'bank', 'btc', 'eth'].forEach(m => {
    const btn = document.getElementById(`method${m.charAt(0).toUpperCase() + m.slice(1)}Btn`);
    if (btn) btn.classList.toggle('active', m === method);
  });

  document.getElementById('creditCardForm').style.display = method === 'card' ? 'block' : 'none';
  document.getElementById('qrPayView').style.display = method === 'qr' ? 'block' : 'none';
  document.getElementById('bankPayView').style.display = method === 'bank' ? 'block' : 'none';
  const btcView = document.getElementById('btcPayView');
  const ethView = document.getElementById('ethPayView');
  if (btcView) btcView.style.display = method === 'btc' ? 'block' : 'none';
  if (ethView) ethView.style.display = method === 'eth' ? 'block' : 'none';
}

function copyCryptoAddress(elementId, toastMsg) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent.trim();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(toastMsg || 'คัดลอกที่อยู่กระเป๋าเงินแล้ว 📋', 'success');
    }).catch(() => {
      showToast(toastMsg || 'คัดลอกที่อยู่กระเป๋าเงินแล้ว 📋', 'success');
    });
  } else {
    showToast(toastMsg || 'คัดลอกที่อยู่กระเป๋าเงินแล้ว 📋', 'success');
  }
}

function setupCardForm() {
  const form = document.getElementById('creditCardForm');
  if (!form) return;

  const cardNum = document.getElementById('cardNumber');
  if (cardNum) {
    cardNum.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const expiry = document.getElementById('cardExpiry');
  if (expiry) {
    expiry.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
      e.target.value = v;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('cardSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> กำลังประมวลผลการชำระเงิน...';
    setTimeout(() => {
      completePayment('Credit Card');
    }, 1500);
  });
}

function simulateSuccessfulPayment(method) {
  const btn = event?.currentTarget;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> กำลังยืนยันยอดเงิน...';
  }
  setTimeout(() => {
    completePayment(method);
  }, 1200);
}

async function completePayment(paymentMethod) {
  const bookingId = Storage.generateBookingId();
  const total = pending.totalPrice || (pending.price + Math.round(pending.price * 0.07) + 150);

  const booking = {
    id: bookingId,
    flightId: pending.flightId,
    airlineName: flight.airlineName || 'Xfly-Anyway Airlines',
    seatId: pending.seatId,
    seatClass: pending.seatClass,
    basePrice: pending.price,
    totalPrice: total,
    paymentMethod: paymentMethod,
    passenger: {
      title: passenger.title || '',
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
      phone: passenger.phone,
      idNumber: passenger.idNumber || ''
    },
    flight: {
      from: flight.from,
      to: flight.to,
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.duration,
      airlineName: flight.airlineName || 'Xfly-Anyway Airlines'
    },
    status: 'confirmed',
    bookedAt: new Date().toISOString()
  };

  // Add booking to Storage & mark seat
  await Storage.addBooking(booking);
  Storage.bookSeat(pending.flightId, pending.seatId, bookingId);

  // Clear pending states
  if (timerInterval) clearInterval(timerInterval);
  sessionStorage.removeItem('pendingBooking');
  sessionStorage.setItem('lastBookingId', bookingId);
  localStorage.setItem('xfly_last_booking_id', bookingId);
  if (passenger.email) localStorage.setItem('xfly_last_booking_email', passenger.email.trim().toLowerCase());

  showToast('ชำระเงินสำเร็จ! กำลังออกตั๋วโดยสาร... 🎉', 'success', 1500);
  setTimeout(() => {
    window.location.href = `ticket.html?id=${bookingId}`;
  }, 800);
}
