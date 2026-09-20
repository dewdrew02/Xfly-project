/**
 * booking.js — X-Fly Seat Map Page
 * Renders seat map, handles selection, and manages seat locks
 */

let currentFlight = null;
let selectedSeat = null;
let mySessionId = null;
let refreshInterval = null;

const SEAT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BUSINESS_ROWS = [1, 2];
const ECONOMY_ROWS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();

  // Get or create session ID
  mySessionId = sessionStorage.getItem('xfly_session');
  if (!mySessionId) {
    mySessionId = Storage.generateSessionId();
    sessionStorage.setItem('xfly_session', mySessionId);
  }

  // Get flight from session
  const flightId = sessionStorage.getItem('selectedFlight');
  if (!flightId) {
    window.location.href = 'index.html';
    return;
  }

  currentFlight = Storage.getFlight(flightId);
  if (!currentFlight) {
    window.location.href = 'index.html';
    return;
  }

  // Get passenger draft from session
  const passengerStr = sessionStorage.getItem('passengerDraft');
  if (!passengerStr) {
    showToast('กรุณากรอกข้อมูลผู้โดยสารก่อนเลือกที่นั่ง', 'warning');
    setTimeout(() => window.location.href = 'passenger.html', 1000);
    return;
  }

  renderPassengerDisplay();
  renderFlightInfo();
  renderSeatMap();
  setupModal();

  // Auto-refresh seat map every 5 seconds to pick up other users' changes
  refreshInterval = setInterval(() => {
    Storage.cleanExpiredLocks();
    renderSeatMap();
  }, 5000);
});

window.addEventListener('beforeunload', () => {
  if (refreshInterval) clearInterval(refreshInterval);
});

// ─── Flight Info ───────────────────────────────────────────────
function renderFlightInfo() {
  const f = currentFlight;
  document.getElementById('pageFlightId').textContent = f.id;
  document.getElementById('pageRoute').textContent = `${f.from.code} → ${f.to.code}`;

  const info = document.getElementById('flightInfoBar');
  if (info) {
    info.innerHTML = `
      <div class="flight-summary-row">
        <span class="label">✈ เที่ยวบิน</span>
        <span class="value gold">${f.id}</span>
      </div>
      <div class="flight-summary-row">
        <span class="label">📍 เส้นทาง</span>
        <span class="value">${f.from.city} → ${f.to.city}</span>
      </div>
      <div class="flight-summary-row">
        <span class="label">🕐 เวลา</span>
        <span class="value">${f.departure} – ${f.arrival}</span>
      </div>
      <div class="flight-summary-row">
        <span class="label">⏱ ระยะเวลา</span>
        <span class="value">${f.duration}</span>
      </div>
      <div class="flight-summary-row">
        <span class="label">💵 ช่วงราคา</span>
        <span class="value gold">${formatPrice(f.price)} – ${formatPrice(Math.round(f.price * 2.5))}</span>
      </div>
    `;
  }
}

// ─── Seat Map Rendering ────────────────────────────────────────
function renderSeatMap() {
  Storage.cleanExpiredLocks();
  const container = document.getElementById('seatMapBody');
  if (!container) return;

  let html = '';

  // Column labels
  html += `<div class="seat-row-labels">
    <div class="col-label"></div>
    <div class="col-label">A</div>
    <div class="col-label">B</div>
    <div class="col-label">C</div>
    <div class="col-label aisle"></div>
    <div class="col-label">D</div>
    <div class="col-label">E</div>
    <div class="col-label">F</div>
  </div>`;

  // Business class
  html += `<div class="class-divider">
    <div class="class-divider-line"></div>
    <div class="class-divider-label">✨ Business</div>
    <div class="class-divider-line"></div>
  </div>`;

  BUSINESS_ROWS.forEach(row => {
    html += renderRow(row, 'business');
  });

  // Economy class
  html += `<div class="class-divider">
    <div class="class-divider-line"></div>
    <div class="class-divider-label">Economy</div>
    <div class="class-divider-line"></div>
  </div>`;

  ECONOMY_ROWS.forEach(row => {
    html += renderRow(row, 'economy');
  });

  container.innerHTML = html;
  updateSeatCounts();
}

function renderRow(row, seatClass) {
  let html = `<div class="seat-row">
    <div class="row-num">${row}</div>`;

  // Left side: A, B, C
  ['A', 'B', 'C'].forEach(col => {
    html += renderSeat(row, col, seatClass);
  });

  // Aisle
  html += `<div class="aisle-space">
    <div style="width:1px;height:70%;background:var(--border);opacity:.3;"></div>
  </div>`;

  // Right side: D, E, F
  ['D', 'E', 'F'].forEach(col => {
    html += renderSeat(row, col, seatClass);
  });

  html += `</div>`;
  return html;
}

function renderSeat(row, col, seatClass) {
  const seatId = `${row}${col}`;
  const seatData = Storage.getSeat(currentFlight.id, seatId);
  const status = seatData.status || 'available';
  const isSelected = selectedSeat === seatId;
  const isMyLock = Storage.isMyLock(currentFlight.id, seatId, mySessionId);

  let cssClass = status;
  if (isSelected && status === 'available') cssClass = 'selected';
  if (isMyLock) cssClass = 'selected'; // my own lock shown as selected

  const isClickable = status === 'available' || isMyLock;
  const clickHandler = isClickable
    ? `onclick="handleSeatClick('${seatId}', '${seatClass}')"`
    : '';

  const priceClass = seatClass === 'business' ? 'B' : 'E';

  return `<div class="seat ${cssClass}" 
    id="seat-${seatId}"
    data-seat="${seatId}"
    data-class="${seatClass}"
    ${clickHandler}
    title="ที่นั่ง ${seatId} (${seatClass === 'business' ? 'Business' : 'Economy'})">
    ${cssClass !== 'booked' && cssClass !== 'locked' ? seatId : ''}
  </div>`;
}

function updateSeatCounts() {
  Storage.cleanExpiredLocks();
  const allSeats = Storage.getAllSeats();
  const totalSeats = currentFlight.seats.business + currentFlight.seats.economy;
  let booked = 0, locked = 0;

  Object.keys(allSeats).forEach(key => {
    if (key.startsWith(currentFlight.id + '-')) {
      if (allSeats[key].status === 'booked') booked++;
      else if (allSeats[key].status === 'locked') locked++;
    }
  });

  const available = totalSeats - booked - locked;
  const el = document.getElementById('seatCountBar');
  if (el) {
    el.innerHTML = `
      <div class="legend-item"><div class="legend-dot available"></div> ว่าง: <strong style="color:var(--success);margin-left:4px">${available}</strong></div>
      <div class="legend-item"><div class="legend-dot locked"></div> กำลังจอง: <strong style="color:var(--locked);margin-left:4px">${locked}</strong></div>
      <div class="legend-item"><div class="legend-dot booked"></div> จองแล้ว: <strong style="color:var(--danger);margin-left:4px">${booked}</strong></div>
    `;
  }
}

// ─── Seat Click Handler ────────────────────────────────────────
function handleSeatClick(seatId, seatClass) {
  Storage.cleanExpiredLocks();
  const seatData = Storage.getSeat(currentFlight.id, seatId);

  if (seatData.status === 'booked') {
    showToast('ที่นั่งนี้ถูกจองแล้ว', 'error');
    return;
  }

  if (seatData.status === 'locked' && !Storage.isMyLock(currentFlight.id, seatId, mySessionId)) {
    showToast('ที่นั่งนี้กำลังถูกจองอยู่ กรุณาเลือกที่นั่งอื่น', 'warning');
    return;
  }

  // Deselect previous
  if (selectedSeat && selectedSeat !== seatId) {
    const prevEl = document.getElementById(`seat-${selectedSeat}`);
    if (prevEl && prevEl.classList.contains('selected')) {
      prevEl.classList.remove('selected');
      prevEl.classList.add('available');
    }
  }

  selectedSeat = seatId;

  // Show booking modal
  const price = seatClass === 'business'
    ? currentFlight.price * 2.5
    : currentFlight.price;
  showBookingModal(seatId, seatClass, price);
}

// ─── Modal ─────────────────────────────────────────────────────
function setupModal() {
  const overlay = document.getElementById('bookingModal');
  if (!overlay) return;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

function showBookingModal(seatId, seatClass, price) {
  const modal = document.getElementById('bookingModal');
  const seatNum = document.getElementById('modalSeatNum');
  const seatClassEl = document.getElementById('modalSeatClass');
  const priceEl = document.getElementById('modalPrice');

  if (seatNum) seatNum.textContent = seatId;
  if (seatClassEl) seatClassEl.textContent = seatClass === 'business' ? '✨ Business Class' : 'Economy Class';
  if (priceEl) priceEl.textContent = formatPrice(price);

  document.getElementById('confirmBookingBtn').onclick = () => proceedToPayment(seatId, seatClass, price);
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('active');
  selectedSeat = null;
  renderSeatMap();
}

function renderPassengerDisplay() {
  const passengerStr = sessionStorage.getItem('passengerDraft');
  if (!passengerStr) return;
  try {
    const p = JSON.parse(passengerStr);
    const nameEl = document.getElementById('passengerDisplayName');
    if (nameEl) nameEl.textContent = `${p.title || ''} ${p.firstName} ${p.lastName}`;

    const sidebarEl = document.getElementById('sidebarPassengerInfo');
    if (sidebarEl) {
      sidebarEl.innerHTML = `
        <div style="font-weight:700;color:var(--text-primary)">${p.title || ''} ${p.firstName} ${p.lastName}</div>
        <div style="color:var(--text-muted);font-size:12px;margin-top:2px">📧 ${p.email}</div>
        <div style="color:var(--text-muted);font-size:12px">📱 ${p.phone}</div>
        <div style="margin-top:8px">
          <a href="passenger.html" class="btn-link" style="font-size:12px">✏️ แก้ไขข้อมูลผู้โดยสาร</a>
        </div>
      `;
    }
  } catch(e) {}
}

function proceedToPayment(seatId, seatClass, price) {
  // Lock the seat
  const locked = Storage.lockSeat(currentFlight.id, seatId, mySessionId);
  if (!locked) {
    showToast('ที่นั่งนี้ถูกจองไปแล้ว กรุณาเลือกที่นั่งใหม่', 'error');
    closeModal();
    renderSeatMap();
    return;
  }

  // Save booking info to sessionStorage
  sessionStorage.setItem('pendingBooking', JSON.stringify({
    flightId: currentFlight.id,
    seatId,
    seatClass,
    price,
    sessionId: mySessionId,
    lockedAt: Date.now()
  }));

  document.getElementById('bookingModal').classList.remove('active');
  window.location.href = 'summary.html';
}
