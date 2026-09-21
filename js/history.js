/**
 * history.js — X-Fly Booking History Page (Latest Booking Only)
 * แสดงเฉพาะประวัติการจองล่าสุดของตนเองตามความต้องการ
 */

document.addEventListener('DOMContentLoaded', async () => {
  Storage.init();
  // Try Supabase first, fallback to localStorage
  const all = await loadBookingsFromSupabase();
  const latest = getMyLatestBooking(all);
  const myLatestBookings = latest ? [latest] : [];
  _cachedBookings = myLatestBookings;
  renderStats(myLatestBookings);
  renderBookingsList(myLatestBookings);
});

function getMyLatestBooking(allBookings) {
  if (!allBookings || allBookings.length === 0) return null;

  // 1. Check if specific booking ID was saved in this browser/session
  const lastId = localStorage.getItem('xfly_last_booking_id') || sessionStorage.getItem('lastBookingId');
  if (lastId) {
    const found = allBookings.find(b => b.id === lastId);
    if (found) return found;
  }

  // 2. Check if user has an email stored
  const userEmail = localStorage.getItem('xfly_last_booking_email') || 
                    (typeof Auth !== 'undefined' && Auth.getCurrentUser ? Auth.getCurrentUser()?.email : null);
  if (userEmail) {
    const userBookings = allBookings.filter(b => 
      b.passenger?.email && b.passenger.email.trim().toLowerCase() === userEmail.trim().toLowerCase()
    );
    if (userBookings.length > 0) {
      userBookings.sort((a, b) => new Date(b.bookedAt || 0) - new Date(a.bookedAt || 0));
      return userBookings[0];
    }
  }

  // 3. Fallback: Take the single latest booking in the list
  const sorted = [...allBookings].sort((a, b) => new Date(b.bookedAt || 0) - new Date(a.bookedAt || 0));
  return sorted[0] || null;
}

function renderStats(bookings) {
  if (!bookings) bookings = _cachedBookings || [];
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const stats = {
    total: bookings.length,
    confirmed: confirmed.length,
    cancelled: cancelled.length,
    totalSpent: confirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };
  document.getElementById('statTotal').textContent = stats.total;
  document.getElementById('statConfirmed').textContent = stats.confirmed;
  document.getElementById('statCancelled').textContent = stats.cancelled;
  document.getElementById('statSpent').textContent = formatPrice(stats.totalSpent);
}

// Cached latest booking
let _cachedBookings = null;

async function renderBookings(filter = 'all') {
  if (!_cachedBookings) {
    const all = await loadBookingsFromSupabase();
    const latest = getMyLatestBooking(all);
    _cachedBookings = latest ? [latest] : [];
  }
  renderBookingsList(_cachedBookings, filter);
  renderStats(_cachedBookings);
}

function renderBookingsList(allBookings, filter = 'all') {
  const container = document.getElementById('bookingsList');
  if (!container) return;

  _cachedBookings = allBookings;
  let bookings = allBookings;
  if (filter !== 'all') {
    bookings = bookings.filter(b => b.status === filter);
  }

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🎫</div>
        <h3>ยังไม่มีประวัติการจองล่าสุด</h3>
        <p>เริ่มค้นหาและจองเที่ยวบินกับ Xfly-Anyway ได้เลย!</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:12px">✈️ ค้นหาเที่ยวบิน</a>
      </div>`;
    return;
  }

  container.innerHTML = bookings.map(booking => {
    const statusLabel = booking.status === 'confirmed'
      ? '<div class="booking-status confirmed">✅ ยืนยันแล้ว</div>'
      : '<div class="booking-status cancelled">❌ ยกเลิกแล้ว</div>';

    const classTag = booking.seatClass === 'first'
      ? '<span class="tag tag-first">👑 First Class</span>'
      : '<span class="tag tag-business">✨ Business Class</span>';

    const fromCity = booking.flight?.from?.city || booking.flight?.from?.code || 'Bangkok';
    const fromCode = booking.flight?.from?.code || 'BKK';
    const toCity = booking.flight?.to?.city || booking.flight?.to?.code || 'Destination';
    const toCode = booking.flight?.to?.code || 'DST';
    const departure = booking.flight?.departure || '06:00';
    const arrival = booking.flight?.arrival || '07:30';
    const duration = booking.flight?.duration || '1h 30m';

    return `
    <div class="booking-card animate-in" id="booking-${booking.id}">
      <div class="booking-card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="booking-id-badge">${booking.id}</span>
          <span class="tag tag-gold" style="font-size:11px">⭐ การจองล่าสุดของคุณ</span>
        </div>
        ${statusLabel}
      </div>
      <div class="booking-card-body">
        <div class="booking-route-point">
          <div class="city-code">${fromCode}</div>
          <div class="city-name">${fromCity}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px">${departure} น.</div>
        </div>
        <div class="booking-route-line">
          <div class="brl-line"></div>
          <div class="plane-icon">✈</div>
          <div class="brl-line"></div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${duration}</div>
        </div>
        <div class="booking-route-point" style="text-align:right">
          <div class="city-code">${toCode}</div>
          <div class="city-name">${toCity}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px">${arrival} น.</div>
        </div>
      </div>
      <div class="booking-card-footer">
        <div class="booking-detail-chips">
          <span class="chip" style="font-weight:700;color:var(--primary);border-color:var(--border-gold)">🪑 ${booking.seatId}</span>
          ${classTag}
          <span class="chip">👤 ${booking.passenger?.firstName || ''} ${booking.passenger?.lastName || ''}</span>
          <span class="chip">📅 ${formatDate(booking.bookedAt)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--text-muted)">ราคารวมสุทธิ</div>
            <div style="font-size:18px;font-weight:800;color:var(--primary)">${formatPrice(booking.totalPrice)}</div>
          </div>
          <a href="ticket.html?id=${booking.id}" class="btn btn-outline btn-sm" style="padding:6px 14px">
            🎫 ดู E-Ticket
          </a>
          ${booking.status === 'confirmed' ? `
            <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking.id}')">
              🗑 ยกเลิก
            </button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function cancelBooking(bookingId) {
  if (!confirm('คุณต้องการยกเลิกการจองนี้ใช่ไหม?')) return;

  const success = Storage.cancelBooking(bookingId);
  if (success) {
    showToast('ยกเลิกการจองสำเร็จ', 'success');
    if (_cachedBookings) {
      _cachedBookings = _cachedBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
    }
    renderStats(_cachedBookings);
    renderBookingsList(_cachedBookings, getCurrentFilter());
  } else {
    showToast('ไม่สามารถยกเลิกได้', 'error');
  }
}

function getCurrentFilter() {
  const active = document.querySelector('.filter-btn.active');
  return active ? active.dataset.filter : 'all';
}

function setFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderBookings(filter);
}

function clearHistory() {
  if (!confirm('คุณต้องการลบประวัติการจองล่าสุดของคุณใช่ไหม?')) return;

  localStorage.removeItem('xfly_last_booking_id');
  localStorage.removeItem('xfly_last_booking_email');
  sessionStorage.removeItem('lastBookingId');
  _cachedBookings = [];

  showToast('ลบประวัติการจองล่าสุดสำเร็จ', 'success');
  renderStats([]);
  renderBookingsList([]);
}
