/**
 * owner-revenue.js — Owner Sales & Revenue Analytics Module
 * Calculates route profitability, seat class breakdown, and generates financial summaries
 */

function renderOwnerRevenueSection() {
  const tbody = document.getElementById('revenueTableBody');
  if (!tbody) return;

  const flights = Storage.getFlights();
  const bookings = Storage.getAllBookings().filter(b => b.status === 'confirmed');

  if (flights.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">ไม่มีข้อมูลเที่ยวบิน</td></tr>`;
    return;
  }

  tbody.innerHTML = flights.map(f => {
    const flightBookings = bookings.filter(b => b.flightId === f.id);
    const economyBookings = flightBookings.filter(b => b.seatClass === 'economy');
    const businessBookings = flightBookings.filter(b => b.seatClass === 'business');

    const economyRevenue = economyBookings.reduce((sum, b) => sum + (b.totalPrice || b.basePrice || 0), 0);
    const businessRevenue = businessBookings.reduce((sum, b) => sum + (b.totalPrice || b.basePrice || 0), 0);
    const totalFlightRevenue = economyRevenue + businessRevenue;

    const totalSeats = (f.seats?.business || 4) + (f.seats?.economy || 30);
    const occupancyPercent = Math.round((flightBookings.length / totalSeats) * 100);

    return `
      <tr>
        <td>
          <strong style="color:var(--primary);font-size:14px">${f.id}</strong>
          <div style="font-size:11px;color:var(--text-muted)">${f.airlineName || 'Xfly-Anyway'}</div>
        </td>
        <td>
          <div style="font-weight:700">${f.from.city} (${f.from.code}) → ${f.to.city} (${f.to.code})</div>
          <div style="font-size:11px;color:var(--text-muted)">เวลา: ${f.departure} - ${f.arrival}</div>
        </td>
        <td>
          <strong>${flightBookings.length}</strong> / ${totalSeats} ใบ
        </td>
        <td>
          <span class="tag" style="background:${occupancyPercent > 50 ? 'var(--success-bg)' : 'rgba(255,255,255,0.06)'};color:${occupancyPercent > 50 ? 'var(--success)' : '#ccc'};font-size:11px">
            ${occupancyPercent}%
          </span>
        </td>
        <td>${formatPrice(economyRevenue)}</td>
        <td>${formatPrice(businessRevenue)}</td>
        <td style="text-align:right">
          <strong style="color:var(--primary);font-size:15px">${formatPrice(totalFlightRevenue)}</strong>
        </td>
      </tr>
    `;
  }).join('');
}

function exportRevenueReport() {
  window.print();
}
