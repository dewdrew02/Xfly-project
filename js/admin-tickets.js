/**
 * admin-tickets.js — View Ticket & Bookings Management Module
 * Allows Admin to search, inspect boarding passes, and cancel/refund tickets
 */

let allTicketsCache = [];

async function loadAdminTickets() {
  allTicketsCache = await loadBookingsFromSupabase();
  applyTicketFilters();
}

function applyTicketFilters() {
  const search = (document.getElementById('ticketSearchInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('ticketStatusFilter')?.value || 'all';

  let filtered = allTicketsCache.filter(b => {
    if (status !== 'all' && b.status !== status) return false;
    if (search) {
      const matchId = (b.id || '').toLowerCase().includes(search);
      const matchName = `${b.passenger?.firstName || ''} ${b.passenger?.lastName || ''}`.toLowerCase().includes(search);
      const matchEmail = (b.passenger?.email || '').toLowerCase().includes(search);
      const matchPhone = (b.passenger?.phone || '').toLowerCase().includes(search);
      const matchFlight = (b.flightId || '').toLowerCase().includes(search);
      const matchSeat = (b.seatId || '').toLowerCase().includes(search);
      return matchId || matchName || matchEmail || matchPhone || matchFlight || matchSeat;
    }
    return true;
  });

  renderAdminTicketsTable(filtered);
}

function renderAdminTicketsTable(bookings) {
  const tbody = document.getElementById('ticketsTableBody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">
          <div style="font-size:28px;margin-bottom:8px">🔍</div>
          <div>ไม่พบรายการบัตรโดยสารที่ตรงกับเงื่อนไข</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const flight = Storage.getFlight(b.flightId) || b.flight || {};
    const route = flight.from && flight.to ? `${flight.from.code} → ${flight.to.code}` : (b.flightId || '-');
    const isConfirmed = b.status === 'confirmed';

    return `
      <tr>
        <td>
          <strong style="color:var(--primary);cursor:pointer;font-size:14px" onclick="viewTicketModal('${b.id}')" title="คลิกเปิดดูตั๋ว">
            ${b.id}
          </strong>
        </td>
        <td style="color:var(--text-muted);font-size:12px">
          ${formatDate(b.bookedAt || new Date().toISOString())}
        </td>
        <td>
          <div style="font-weight:700">${b.passenger?.title || ''} ${b.passenger?.firstName || '-'} ${b.passenger?.lastName || ''}</div>
          <div style="font-size:11px;color:var(--text-muted)">${b.passenger?.phone || b.passenger?.email || '-'}</div>
        </td>
        <td>
          <div style="font-weight:700">${b.flightId || flight.id || '-'}</div>
          <div style="font-size:11px;color:var(--text-muted)">${route}</div>
        </td>
        <td>
          <div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(212,175,55,0.15);border:1px solid var(--border-gold);border-radius:var(--radius-sm)">
            <span style="font-size:13px">🪑</span>
            <strong style="color:var(--primary);font-size:14px">${b.seatId || '-'}</strong>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${b.seatClass === 'first' ? '👑 First Class' : '✨ Business Class'}</div>
        </td>
        <td style="font-weight:700;color:var(--text-primary)">
          ${formatPrice(b.totalPrice || b.basePrice || 0)}
        </td>
        <td>
          ${isConfirmed
            ? '<span class="tag" style="background:rgba(0,200,150,0.15);color:var(--success);font-size:11px">✅ สำเร็จ</span>'
            : '<span class="tag" style="background:rgba(255,68,68,0.15);color:var(--danger);font-size:11px">❌ ยกเลิกแล้ว</span>'
          }
        </td>
        <td style="white-space:nowrap;text-align:right">
          <button class="btn btn-primary btn-sm" onclick="viewTicketModal('${b.id}')" style="padding:4px 10px;font-size:12px">
            🎫 ดูตั๋ว
          </button>
          ${isConfirmed && typeof currentAdmin !== 'undefined' && currentAdmin?.role !== 'ticket' ? `
            <button class="btn btn-danger btn-sm" onclick="adminCancelTicketAction('${b.id}', '${b.flightId}', '${b.seatId}')" style="padding:4px 8px;font-size:12px;margin-left:4px" title="ยกเลิกการจองและปล่อยที่นั่ง">
              ✕ ยกเลิก
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function viewTicketModal(bookingId) {
  const booking = allTicketsCache.find(b => b.id === bookingId) || Storage.getBooking(bookingId);
  if (!booking) return;

  const flight = Storage.getFlight(booking.flightId) || booking.flight || {};
  const content = document.getElementById('ticketModalBody');

  content.innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border-gold);border-radius:var(--radius-lg);padding:24px;position:relative">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed var(--border);padding-bottom:14px;margin-bottom:16px">
        <div>
          <div style="font-weight:900;font-size:18px;color:var(--primary)">${booking.airlineName || 'X-FLY AIRLINES'}</div>
          <div style="font-size:11px;color:var(--text-muted)">ELECTRONIC E-TICKET</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--text-muted)">รหัสการจอง (PNR)</div>
          <div style="font-weight:900;font-size:18px;color:var(--text-primary)">${booking.id}</div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div style="font-size:11px;color:var(--text-muted)">ชื่อผู้โดยสาร / PASSENGER NAME</div>
        <div style="font-size:16px;font-weight:700">${booking.passenger?.title || ''} ${booking.passenger?.firstName || ''} ${booking.passenger?.lastName || ''}</div>
        <div style="font-size:12px;color:var(--text-muted)">${booking.passenger?.phone || ''} · ${booking.passenger?.email || ''}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div>
          <div style="font-size:11px;color:var(--text-muted)">เที่ยวบิน</div>
          <div style="font-weight:700;color:var(--primary)">${booking.flightId}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">เส้นทาง</div>
          <div style="font-weight:700">${flight.from?.code || ''} → ${flight.to?.code || ''}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">เวลาเดินทาง</div>
          <div style="font-weight:700">${flight.departure || '-'} น.</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:var(--radius-md);border:1px solid var(--border)">
        <div>
          <div style="font-size:11px;color:var(--text-muted)">ที่นั่ง / SEAT</div>
          <div style="font-size:22px;font-weight:900;color:var(--primary)">${booking.seatId}</div>
          <div style="font-size:11px;color:var(--text-muted)">${booking.seatClass === 'first' ? '👑 First Class' : '✨ Business Class'}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:var(--text-muted)">ยอดชำระเงิน</div>
          <div style="font-size:20px;font-weight:900;color:var(--success)">${formatPrice(booking.totalPrice || booking.basePrice || 0)}</div>
          <div style="font-size:11px;color:${booking.status === 'confirmed' ? 'var(--success)' : 'var(--danger)'}">
            ● ${booking.status === 'confirmed' ? 'ชำระเงินเรียบร้อยแล้ว' : 'ยกเลิกแล้ว'}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('ticketInspectModal').classList.add('active');
}

function closeTicketInspectModal() {
  document.getElementById('ticketInspectModal').classList.remove('active');
}

async function adminCancelTicketAction(bookingId, flightId, seatId) {
  if (!confirm(`ยืนยันการยกเลิกบัตรโดยสารรหัส ${bookingId} และคืนที่นั่ง ${seatId} หรือไม่?`)) return;

  await Storage.cancelBooking(bookingId);
  if (flightId && seatId) {
    Storage.setSeat(flightId, seatId, { status: 'available' });
  }

  showToast(`ยกเลิกบัตรโดยสาร ${bookingId} สำเร็จและคืนที่นั่งแล้ว`, 'success');
  loadAdminTickets();
  if (typeof renderAdminStats === 'function') renderAdminStats();
}
