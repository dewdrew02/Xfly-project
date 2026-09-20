/**
 * admin-airlines.js — Airline Management Module (CRUD)
 * Allows Admin to manage partner and operating airlines in the system
 */

function renderAdminAirlinesSection() {
  const container = document.getElementById('airlinesTableBody');
  if (!container) return;

  const airlines = Storage.getAirlines();
  const flights = Storage.getFlights();

  if (airlines.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:36px;color:var(--text-muted)">
          ยังไม่มีข้อมูลสายการบิน คลิกปุ่ม "+ เพิ่มสายการบิน" เพื่อสร้างสายการบิน
        </td>
      </tr>`;
    return;
  }

  container.innerHTML = airlines.map(al => {
    const flightCount = flights.filter(f => f.airlineCode === al.code).length;

    return `
      <tr>
        <td>
          <span style="font-size:20px">${al.logo || '✈️'}</span>
          <strong style="color:var(--primary);font-size:15px;margin-left:8px">${al.code}</strong>
        </td>
        <td>
          <div style="font-weight:700">${al.name}</div>
        </td>
        <td>${al.country || 'Thailand'}</td>
        <td>${al.fleet || 0} ลำ</td>
        <td>
          <span class="tag" style="background:rgba(0,200,150,0.15);color:var(--success);font-size:11px">
            ● ${flightCount} เที่ยวบินให้บริการ
          </span>
        </td>
        <td style="white-space:nowrap;text-align:right">
          <button class="btn btn-ghost btn-sm" onclick="openAirlineModal('${al.code}')" style="padding:4px 10px;font-size:12px">
            ✏️ แก้ไข
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteAirlineAction('${al.code}', ${flightCount})" style="padding:4px 10px;font-size:12px;margin-left:4px">
            🗑 ลบ
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAirlineModal(airlineCode = null) {
  const modal = document.getElementById('airlineModal');
  const title = document.getElementById('airlineModalTitle');
  const form = document.getElementById('airlineForm');

  if (airlineCode) {
    const al = Storage.getAirlines().find(a => a.code === airlineCode);
    if (!al) return;
    title.textContent = `✏️ แก้ไขสายการบิน (${al.name})`;
    document.getElementById('airlineEditCode').value = al.code;
    document.getElementById('airlineCodeInput').value = al.code;
    document.getElementById('airlineCodeInput').disabled = true;
    document.getElementById('airlineNameInput').value = al.name;
    document.getElementById('airlineCountryInput').value = al.country || 'Thailand';
    document.getElementById('airlineFleetInput').value = al.fleet || 10;
    document.getElementById('airlineLogoInput').value = al.logo || '✈️';
  } else {
    title.textContent = '🏢 เพิ่มสายการบินใหม่';
    form.reset();
    document.getElementById('airlineEditCode').value = '';
    document.getElementById('airlineCodeInput').disabled = false;
    document.getElementById('airlineCountryInput').value = 'Thailand';
    document.getElementById('airlineFleetInput').value = 12;
    document.getElementById('airlineLogoInput').value = '✈️';
  }

  modal.classList.add('active');
}

function closeAirlineModal() {
  document.getElementById('airlineModal').classList.remove('active');
}

function saveAirlineSubmit(e) {
  e.preventDefault();
  const editCode = document.getElementById('airlineEditCode').value;
  const code = (document.getElementById('airlineCodeInput').value || '').trim().toUpperCase();
  const name = document.getElementById('airlineNameInput').value.trim();
  const country = document.getElementById('airlineCountryInput').value.trim() || 'Thailand';
  const fleet = parseInt(document.getElementById('airlineFleetInput').value, 10) || 1;
  const logo = document.getElementById('airlineLogoInput').value.trim() || '✈️';

  if (!code || code.length > 3) {
    showToast('รหัสสายการบินควรเป็น 2-3 ตัวอักษร เช่น XF, TG', 'warning');
    return;
  }

  const airline = {
    code: editCode || code,
    name,
    country,
    fleet,
    logo,
    status: 'Active'
  };

  Storage.saveAirline(airline);
  showToast(`บันทึกสายการบิน ${airline.name} สำเร็จ! 🏢`, 'success');
  closeAirlineModal();
  renderAdminAirlinesSection();
}

function deleteAirlineAction(code, flightCount) {
  if (flightCount > 0) {
    if (!confirm(`สายการบิน ${code} มีเที่ยวบินเปิดอยู่ ${flightCount} เที่ยวบิน ยืนยันการลบหรือไม่?`)) return;
  } else {
    if (!confirm(`ยืนยันการลบสายการบิน ${code} ออกจากระบบ?`)) return;
  }

  Storage.deleteAirline(code);
  showToast(`ลบสายการบิน ${code} เรียบร้อยแล้ว`, 'info');
  renderAdminAirlinesSection();
}
