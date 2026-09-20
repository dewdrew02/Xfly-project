/**
 * admin-airports.js — Airport Management Module (CRUD)
 * Allows Admin to manage airports in the system
 */

function renderAdminAirportsSection() {
  const container = document.getElementById('airportsTableBody');
  if (!container) return;

  const airports = Storage.getAirports();
  const flights = Storage.getFlights();

  if (airports.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:36px;color:var(--text-muted)">
          ยังไม่มีข้อมูลสนามบิน คลิกปุ่ม "+ เพิ่มสนามบิน" เพื่อสร้างสนามบิน
        </td>
      </tr>`;
    return;
  }

  container.innerHTML = airports.map(a => {
    // Count active routes using this airport
    const routeCount = flights.filter(f => f.from.code === a.code || f.to.code === a.code).length;

    return `
      <tr>
        <td>
          <strong style="color:var(--primary);font-size:16px;letter-spacing:1px">${a.code}</strong>
        </td>
        <td>
          <div style="font-weight:700">${a.name}</div>
        </td>
        <td>${a.city}</td>
        <td>${a.country || 'Thailand'}</td>
        <td>
          <span class="tag" style="background:rgba(0,200,150,0.15);color:var(--success);font-size:11px">
            ● ${routeCount} เที่ยวบิน
          </span>
        </td>
        <td style="white-space:nowrap;text-align:right">
          <button class="btn btn-ghost btn-sm" onclick="openAirportModal('${a.code}')" style="padding:4px 10px;font-size:12px">
            ✏️ แก้ไข
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteAirportAction('${a.code}', ${routeCount})" style="padding:4px 10px;font-size:12px;margin-left:4px">
            🗑 ลบ
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAirportModal(airportCode = null) {
  const modal = document.getElementById('airportModal');
  const title = document.getElementById('airportModalTitle');
  const form = document.getElementById('airportForm');

  if (airportCode) {
    const airport = Storage.getAirports().find(a => a.code === airportCode);
    if (!airport) return;
    title.textContent = `✏️ แก้ไขข้อมูลสนามบิน (${airport.code})`;
    document.getElementById('airportEditCode').value = airport.code;
    document.getElementById('airportCodeInput').value = airport.code;
    document.getElementById('airportCodeInput').disabled = true;
    document.getElementById('airportNameInput').value = airport.name;
    document.getElementById('airportCityInput').value = airport.city;
    document.getElementById('airportCountryInput').value = airport.country || 'Thailand';
  } else {
    title.textContent = '🛫 เพิ่มสนามบินใหม่';
    form.reset();
    document.getElementById('airportEditCode').value = '';
    document.getElementById('airportCodeInput').disabled = false;
    document.getElementById('airportCountryInput').value = 'Thailand';
  }

  modal.classList.add('active');
}

function closeAirportModal() {
  document.getElementById('airportModal').classList.remove('active');
}

function saveAirportSubmit(e) {
  e.preventDefault();
  const editCode = document.getElementById('airportEditCode').value;
  const code = (document.getElementById('airportCodeInput').value || '').trim().toUpperCase();
  const name = document.getElementById('airportNameInput').value.trim();
  const city = document.getElementById('airportCityInput').value.trim();
  const country = document.getElementById('airportCountryInput').value.trim() || 'Thailand';

  if (!code || code.length !== 3) {
    showToast('รหัสสนามบินต้องเป็นตัวอักษร 3 หลัก (IATA Code)', 'warning');
    return;
  }

  const airport = {
    code: editCode || code,
    name,
    city,
    country,
    active: true
  };

  Storage.saveAirport(airport);
  showToast(`บันทึกสนามบิน ${airport.code} สำเร็จ! 🛫`, 'success');
  closeAirportModal();
  renderAdminAirportsSection();
}

function deleteAirportAction(code, routeCount) {
  if (routeCount > 0) {
    if (!confirm(`สนามบิน ${code} มีเที่ยวบินเชื่อมต่ออยู่ ${routeCount} เที่ยวบิน ยืนยันการลบหรือไม่?`)) return;
  } else {
    if (!confirm(`ยืนยันการลบสนามบิน ${code} ออกจากระบบ?`)) return;
  }

  Storage.deleteAirport(code);
  showToast(`ลบสนามบิน ${code} เรียบร้อยแล้ว`, 'info');
  renderAdminAirportsSection();
}
