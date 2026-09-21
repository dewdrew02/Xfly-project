/**
 * history.js — X-Fly Booking History Page
 */

document.addEventListener('DOMContentLoaded', async () => {
  Storage.init();
  renderStats();
  // Try Supabase first, fallback to localStorage
  const bookings = await loadBookingsFromSupabase();
  renderBookingsList(bookings);
});

function renderStats(bookings) {
  if (!bookings) bookings = Storage.getAllBookings();
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

// Cached bookings from Supabase
let _cachedBookings = null;

async function renderBookings(filter = 'all') {
  if (!_cachedBookings) {
    _cachedBookings = await loadBookingsFromSupabase();
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
        <h3>ยังไม่มีประวัติการจอง</h3>
        <p>เริ่มจองตั๋วเครื่องบินกับ X-Fly ได้เลย!</p>
        <a href="index.html" class="btn btn-primary">✈️ ค้นหาเที่ยวบิน</a>
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

    return `
    <div class="booking-card animate-in" id="booking-${booking.id}">
      <div class="booking-card-header">
        <span class="booking-id-badge">${booking.id}</span>
        ${statusLabel}
      </div>
      <div class="booking-card-body">
        <div class="booking-route-point">
          <div class="city-code">${booking.flight.from.code}</div>
          <div class="city-name">${booking.flight.from.city}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px">${booking.flight.departure}</div>
        </div>
        <div class="booking-route-line">
          <div class="brl-line"></div>
          <div class="plane-icon">✈</div>
          <div class="brl-line"></div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${booking.flight.duration}</div>
        </div>
        <div class="booking-route-point" style="text-align:right">
          <div class="city-code">${booking.flight.to.code}</div>
          <div class="city-name">${booking.flight.to.city}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px">${booking.flight.arrival}</div>
        </div>
      </div>
      <div class="booking-card-footer">
        <div class="booking-detail-chips">
          <span class="chip">🪑 ${booking.seatId}</span>
          ${classTag}
          <span class="chip">👤 ${booking.passenger.firstName} ${booking.passenger.lastName}</span>
          <span class="chip">📅 ${formatDate(booking.bookedAt)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0">
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--text-muted)">ราคารวม</div>
            <div style="font-size:18px;font-weight:800;color:var(--primary)">${formatPrice(booking.totalPrice)}</div>
          </div>
          <a href="ticket.html?id=${booking.id}" class="btn btn-outline btn-sm" style="padding:6px 12px">
            🎫 ดูตั๋ว
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
    renderStats();
    renderBookings(getCurrentFilter());
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
  if (!confirm('คุณต้องการลบประวัติการจองทั้งหมดใช่ไหม?\n(ที่นั่งที่ยกเลิกแล้วจะถูกปล่อยว่างด้วย)')) return;

  const bookings = Storage.getAllBookings();
  bookings.forEach(b => {
    if (b.status === 'cancelled') {
      Storage.cancelBooking(b.id);
    }
  });

  localStorage.setItem('xfly_bookings', JSON.stringify([]));
  showToast('ลบประวัติสำเร็จ', 'success');
  renderStats();
  renderBookings();
}

