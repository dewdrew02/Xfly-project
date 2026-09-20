/**
 * admin-flights.js — Flight Management Module (CRUD)
 * Allows Admin to create, edit, delete flights, and view seat occupancy
 */

function renderAdminFlightsSection() {
  const container = document.getElementById('flightsTableBody');
  if (!container) return;

  const flights = Storage.getFlights();
  const allSeats = Storage.getAllSeats();

  if (flights.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:36px;color:var(--text-muted)">
          ยังไม่มีข้อมูลเที่ยวบินในระบบ คลิกปุ่ม "+ เพิ่มเที่ยวบินใหม่" เพื่อสร้างเที่ยวบิน
        </td>
      </tr>`;
    return;
  }

  container.innerHTML = flights.map(f => {
    let booked = 0, locked = 0;
    const totalSeats = (f.seats?.business || 4) + (f.seats?.economy || 30);

    Object.keys(allSeats).forEach(k => {
      if (k.startsWith(f.id + '-')) {
        if (allSeats[k].status === 'booked') booked++;
        else if (allSeats[k].status === 'locked') locked++;
      }
    });

    const available = totalSeats - booked - locked;
    const occupancy = Math.round(((booked + locked) / totalSeats) * 100);

    return `
      <tr>
        <td>
          <strong style="color:var(--primary);font-size:14px">${f.id}</strong>
          <div style="font-size:11px;color:var(--text-muted)">${f.airlineName || 'Xfly-Anyway Airlines'}</div>
        </td>
        <td>
          <div style="font-weight:700">${f.from.code} → ${f.to.code}</div>
          <div style="font-size:11px;color:var(--text-muted)">${f.from.city} ถึง ${f.to.city}</div>
        </td>
        <td>
          <div style="font-weight:600">${f.departure} – ${f.arrival}</div>
          <div style="font-size:11px;color:var(--text-muted)">⏱ ${f.duration}</div>
        </td>
        <td>
          <div style="font-weight:700;color:var(--text-primary)">${formatPrice(f.price)}</div>
          <div style="font-size:11px;color:var(--text-muted)">Business: ${formatPrice(Math.round(f.price * 2.5))}</div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="font-size:12px;font-weight:700">${booked}/${totalSeats}</div>
            <span class="tag" style="font-size:10px;background:${occupancy > 70 ? 'var(--danger-bg)' : 'var(--success-bg)'};color:${occupancy > 70 ? 'var(--danger)' : 'var(--success)'}">${occupancy}%</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted)">ว่าง: ${available} ที่นั่ง</div>
        </td>
        <td style="white-space:nowrap;text-align:right">
          <button class="btn btn-outline btn-sm" onclick="openAdminSeatModal('${f.id}')" style="padding:4px 10px;font-size:12px">
            🪑 ผังที่นั่ง
          </button>
          <button class="btn btn-ghost btn-sm" onclick="openFlightModal('${f.id}')" style="padding:4px 10px;font-size:12px;margin-left:4px">
            ✏️ แก้ไข
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteFlightAction('${f.id}')" style="padding:4px 10px;font-size:12px;margin-left:4px">
            🗑 ลบ
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openFlightModal(flightId = null) {
  const modal = document.getElementById('flightModal');
  const title = document.getElementById('flightModalTitle');
  const form = document.getElementById('flightForm');

  // Populate airport selects
  const airports = Storage.getAirports();
  const fromSel = document.getElementById('flightFromCode');
  const toSel = document.getElementById('flightToCode');
  fromSel.innerHTML = airports.map(a => `<option value="${a.code}">${a.code} — ${a.city} (${a.name})</option>`).join('');
  toSel.innerHTML = airports.map(a => `<option value="${a.code}">${a.code} — ${a.city} (${a.name})</option>`).join('');

  // Populate airlines select
  const airlines = Storage.getAirlines();
  const airlineSel = document.getElementById('flightAirlineCode');
  airlineSel.innerHTML = airlines.map(a => `<option value="${a.code}">${a.name} (${a.code})</option>`).join('');

  if (flightId) {
    const flight = Storage.getFlight(flightId);
    if (!flight) return;
    title.textContent = `✏️ แก้ไขเที่ยวบิน ${flight.id}`;
    document.getElementById('flightEditId').value = flight.id;
    document.getElementById('flightCodeInput').value = flight.id;
    document.getElementById('flightCodeInput').disabled = true;
    airlineSel.value = flight.airlineCode || 'XF';
    fromSel.value = flight.from.code;
    toSel.value = flight.to.code;
    document.getElementById('flightDeparture').value = flight.departure;
    document.getElementById('flightArrival').value = flight.arrival;
    document.getElementById('flightDuration').value = flight.duration;
    document.getElementById('flightPrice').value = flight.price;
  } else {
    title.textContent = '✈️ เพิ่มเที่ยวบินใหม่';
    form.reset();
    document.getElementById('flightEditId').value = '';
    document.getElementById('flightCodeInput').disabled = false;
    document.getElementById('flightCodeInput').value = 'XF' + Math.floor(100 + Math.random() * 900);
    document.getElementById('flightDeparture').value = '08:00';
    document.getElementById('flightArrival').value = '09:15';
    document.getElementById('flightDuration').value = '1h 15m';
    document.getElementById('flightPrice').value = 1490;
  }

  modal.classList.add('active');
}

function closeFlightModal() {
  document.getElementById('flightModal').classList.remove('active');
}

function saveFlightSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('flightEditId').value;
  const flightId = document.getElementById('flightCodeInput').value.trim().toUpperCase();
  const airlineCode = document.getElementById('flightAirlineCode').value;
  const airline = Storage.getAirlines().find(a => a.code === airlineCode) || { name: 'Xfly-Anyway Airlines' };

  const fromCode = document.getElementById('flightFromCode').value;
  const toCode = document.getElementById('flightToCode').value;

  if (fromCode === toCode) {
    showToast('สนามบินต้นทางและปลายทางต้องไม่เหมือนกัน', 'warning');
    return;
  }

  const fromAirport = Storage.getAirports().find(a => a.code === fromCode) || { code: fromCode, city: fromCode, name: fromCode };
  const toAirport = Storage.getAirports().find(a => a.code === toCode) || { code: toCode, city: toCode, name: toCode };

  const newFlight = {
    id: editId || flightId,
    airlineCode: airlineCode,
    airlineName: airline.name,
    from: { code: fromAirport.code, city: fromAirport.city, name: fromAirport.name },
    to: { code: toAirport.code, city: toAirport.city, name: toAirport.name },
    departure: document.getElementById('flightDeparture').value,
    arrival: document.getElementById('flightArrival').value,
    duration: document.getElementById('flightDuration').value.trim() || '1h 15m',
    price: parseInt(document.getElementById('flightPrice').value, 10) || 1290,
    seats: { business: 4, economy: 30 }
  };

  Storage.saveFlight(newFlight);
  showToast(`บันทึกเที่ยวบิน ${newFlight.id} สำเร็จ! ✈️`, 'success');
  closeFlightModal();
  renderAdminFlightsSection();
  if (typeof renderAdminStats === 'function') renderAdminStats();
}

function deleteFlightAction(flightId) {
  if (!confirm(`คุณต้องการลบเที่ยวบิน ${flightId} ออกจากระบบใช่ไหม?`)) return;
  Storage.deleteFlight(flightId);
  showToast(`ลบเที่ยวบิน ${flightId} เรียบร้อยแล้ว`, 'info');
  renderAdminFlightsSection();
  if (typeof renderAdminStats === 'function') renderAdminStats();
}
