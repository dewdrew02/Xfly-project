/**
 * main.js — X-Fly Home Page Logic
 * Search and display flights
 */

let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  populateAirports();
  renderAllFlights();
  setupSearch();
  updateNavStats();
});

function populateAirports() {
  const airports = Storage.getAirports();
  const domestic = airports.filter(a => a.country === 'Thailand');
  const international = airports.filter(a => a.country !== 'Thailand');

  ['fromAirport','toAirport'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="">— ${id === 'fromAirport' ? 'ทุกต้นทาง' : 'ทุกปลายทาง'} —</option>`;

    if (domestic.length > 0) {
      const optGroupDom = document.createElement('optgroup');
      optGroupDom.label = '🇹🇭 เส้นทางในประเทศ (Domestic)';
      domestic.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.code;
        opt.textContent = `${a.code} — ${a.city} (${a.name})`;
        optGroupDom.appendChild(opt);
      });
      sel.appendChild(optGroupDom);
    }

    if (international.length > 0) {
      const optGroupIntl = document.createElement('optgroup');
      optGroupIntl.label = '🌐 เส้นทางต่างประเทศ (International)';
      international.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.code;
        opt.textContent = `${a.code} — ${a.city}, ${a.country} (${a.name})`;
        optGroupIntl.appendChild(opt);
      });
      sel.appendChild(optGroupIntl);
    }
  });
}

function filterFlightsByCategory(cat) {
  currentCategory = cat;
  ['catBtnAll', 'catBtnDomestic', 'catBtnInternational'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.classList.remove('btn-primary');
    b.classList.add('btn-outline');
  });

  const activeBtn = document.getElementById(
    cat === 'domestic' ? 'catBtnDomestic' :
    cat === 'international' ? 'catBtnInternational' : 'catBtnAll'
  );
  if (activeBtn) {
    activeBtn.classList.add('btn-primary');
    activeBtn.classList.remove('btn-outline');
  }

  const allFlights = Storage.getFlights();
  const airports = Storage.getAirports();
  const thCodes = airports.filter(a => a.country === 'Thailand').map(a => a.code);

  let filtered = allFlights;
  if (cat === 'domestic') {
    filtered = allFlights.filter(f => thCodes.includes(f.from.code) && thCodes.includes(f.to.code));
  } else if (cat === 'international') {
    filtered = allFlights.filter(f => !thCodes.includes(f.from.code) || !thCodes.includes(f.to.code));
  }

  renderAllFlights(filtered);
}

function renderAllFlights(filtered = null) {
  const container = document.getElementById('flightsList');
  const countEl = document.getElementById('flightCount');
  if (!container) return;

  const allFlights = Storage.getFlights();
  const flights = filtered !== null ? filtered : allFlights;

  if (countEl) countEl.textContent = `${flights.length} เที่ยวบิน`;

  if (flights.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">✈️</div>
        <h3>ไม่พบเที่ยวบิน</h3>
        <p>ลองค้นหาเส้นทางอื่น หรือเปลี่ยนวันที่เดินทาง</p>
        <button class="btn btn-outline" onclick="renderAllFlights()">ดูเที่ยวบินทั้งหมด</button>
      </div>`;
    return;
  }

  container.innerHTML = flights.map((f, i) => {
    const seats = getAllSeatsForFlight(f.id);
    const available = seats.available;
    const total = (f.seats?.first || 12) + (f.seats?.business || 60);
    const minPrice = f.price;
    const maxPrice = Math.round(f.price * 2.5);

    return `
    <div class="flight-card animate-in" style="animation-delay:${i * 0.05}s" onclick="selectFlight('${f.id}')">
      <div class="flight-route">
        <div class="flight-airport">
          <div class="code">${f.from.code}</div>
          <div class="city">${f.from.city}</div>
        </div>
        <div class="flight-duration-line">
          <div class="flight-duration-time">${f.duration}</div>
          <div class="flight-line">
            <span class="flight-line-icon">✈</span>
          </div>
          <div class="flight-number">${f.id}</div>
        </div>
        <div class="flight-airport">
          <div class="code">${f.to.code}</div>
          <div class="city">${f.to.city}</div>
        </div>
      </div>

      <div class="flight-info">
        <div class="flight-time">${f.departure} → ${f.arrival}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
          ที่นั่งว่าง: <span style="color:${available < 5 ? 'var(--danger)' : 'var(--success)'}">
            ${available}/${total}
          </span>
        </div>
      </div>

      <div class="flight-price-section">
        <div class="flight-price-label">ราคาเริ่มต้น (Business – First)</div>
        <div class="flight-price">${formatPrice(minPrice)} – ${formatPrice(maxPrice)}</div>
        <div class="flight-price-sub">✨ Business – 👑 First Class</div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="event.stopPropagation();selectFlight('${f.id}')">
          🪑 เลือกที่นั่ง
        </button>
      </div>
    </div>`;
  }).join('');
}

function getAllSeatsForFlight(flightId) {
  Storage.cleanExpiredLocks();
  const allSeats = Storage.getAllSeats();
  const flight = Storage.getFlight(flightId);
  if (!flight) return { available: 0, booked: 0, locked: 0 };

  const total = (flight.seats?.first || 12) + (flight.seats?.business || 60);
  let booked = 0, locked = 0;

  Object.keys(allSeats).forEach(key => {
    if (key.startsWith(flightId + '-')) {
      if (allSeats[key].status === 'booked') booked++;
      else if (allSeats[key].status === 'locked') locked++;
    }
  });

  return { available: total - booked - locked, booked, locked, total };
}

function selectFlight(flightId) {
  sessionStorage.setItem('selectedFlight', flightId);
  window.location.href = 'seat.html';
}

function setupSearch() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  // Set default date to today
  const dateInput = document.getElementById('travelDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = document.getElementById('fromAirport').value;
    const to = document.getElementById('toAirport').value;

    if (from && to && from === to) {
      showToast('ต้นทางและปลายทางต้องไม่เหมือนกัน', 'warning');
      return;
    }

    let filtered = Storage.getFlights();
    if (from) filtered = filtered.filter(f => f.from.code === from);
    if (to) filtered = filtered.filter(f => f.to.code === to);

    renderAllFlights(filtered);

    if (filtered.length > 0) {
      document.getElementById('flightsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function updateNavStats() {
  const stats = Storage.getStats();
  const el = document.getElementById('navBookingCount');
  if (el && stats.confirmed > 0) {
    el.textContent = stats.confirmed;
    el.style.display = 'inline-flex';
  }
}

// ─── Promo Card Click ─────────────────────────────────────────
function selectPromo(flightId) {
  sessionStorage.setItem('selectedFlight', flightId);
  showToast('กำลังไปยังหน้าเลือกที่นั่ง...', 'info', 1500);
  setTimeout(() => {
    window.location.href = 'seat.html';
  }, 600);
}
