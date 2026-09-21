/**
 * admin.js — Xfly-Anyway Airlines Admin Portal Controller
 * Coordinates Admin Auth, Dashboard KPIs, and Tab Switching across modular files
 */

const ADMIN_SESSION_KEY = 'xfly_admin';
let currentAdmin = null;

document.addEventListener('DOMContentLoaded', async () => {
  Storage.init();
  checkAdminAuth();
  setupAdminLoginForm();
  const urlParams = new URLSearchParams(window.location.search);
  const requestedRole = urlParams.get('role');
  if (requestedRole) selectLoginRole(requestedRole);
});

// ─── Authentication Check ──────────────────────────────────────
function checkAdminAuth() {
  const sessionStr = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
  if (sessionStr) {
    try {
      currentAdmin = JSON.parse(sessionStr);
      showAdminDashboard();
      return;
    } catch(e) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }
  showAdminLogin();
}

function showAdminLogin() {
  document.getElementById('adminLoginView').style.display = 'flex';
  document.getElementById('adminDashboardView').style.display = 'none';
}

let selectedLoginRole = 'staff';

function selectLoginRole(role) {
  selectedLoginRole = role;

  const btnOwner = document.getElementById('roleBtnOwner');
  const btnStaff = document.getElementById('roleBtnStaff');
  const btnTicket = document.getElementById('roleBtnTicket');

  const iconEl = document.getElementById('loginRoleIcon');
  const badgeEl = document.getElementById('loginRoleBadge');
  const titleEl = document.getElementById('loginPortalTitle');
  const subtitleEl = document.getElementById('loginPortalSubtitle');
  const emailInput = document.getElementById('adminEmail');
  const passInput = document.getElementById('adminPassword');
  const emailLabel = document.getElementById('loginEmailLabel');
  const loginBtn = document.getElementById('adminLoginBtn');
  const hintTitle = document.getElementById('hintRoleTitle');
  const hintCreds = document.getElementById('hintRoleCredentials');

  [btnOwner, btnStaff, btnTicket].forEach(b => {
    if (b) {
      b.style.background = 'transparent';
      b.style.color = 'var(--text-muted)';
    }
  });

  if (role === 'owner') {
    if (btnOwner) {
      btnOwner.style.background = 'rgba(212,175,55,0.25)';
      btnOwner.style.color = 'var(--primary)';
    }
    if (iconEl) iconEl.textContent = '👑';
    if (badgeEl) badgeEl.textContent = '🔒 EXECUTIVE LEVEL — OWNER ONLY';
    if (titleEl) titleEl.textContent = 'Xfly-Anyway Executive';
    if (subtitleEl) subtitleEl.textContent = 'เข้าสู่ระบบผู้บริหารสูงสุด (Owner Portal)';
    if (emailLabel) emailLabel.textContent = '📧 บัญชีผู้บริหารสูงสุด (Owner Email)';
    if (emailInput) emailInput.value = 'owner@xfly.com';
    if (passInput) passInput.value = 'owner1234';
    if (loginBtn) loginBtn.innerHTML = '👑 เข้าสู่ระบบ Executive Owner';
    if (hintTitle) hintTitle.innerHTML = '👑 <strong>ข้อมูลล็อกอินผู้บริหาร (Owner):</strong>';
    if (hintCreds) hintCreds.innerHTML = 'อีเมล: <code style="color:var(--primary)">owner@xfly.com</code> | รหัสผ่าน: <code style="color:var(--primary)">owner1234</code>';
  } else if (role === 'ticket') {
    if (btnTicket) {
      btnTicket.style.background = 'rgba(212,175,55,0.25)';
      btnTicket.style.color = 'var(--primary)';
    }
    if (iconEl) iconEl.textContent = '🎫';
    if (badgeEl) badgeEl.textContent = '🔍 PASSENGER & SEAT SERVICES — TICKET OFFICER';
    if (titleEl) titleEl.textContent = 'Xfly-Anyway Airlines';
    if (subtitleEl) subtitleEl.textContent = 'ระบบเจ้าหน้าที่ตรวจสอบตั๋วและที่นั่ง (Ticket Officer)';
    if (emailLabel) emailLabel.textContent = '📧 บัญชีเจ้าหน้าที่ตรวจตั๋ว (Ticket Officer Email)';
    if (emailInput) emailInput.value = 'ticket@xfly.com';
    if (passInput) passInput.value = 'ticket1234';
    if (loginBtn) loginBtn.innerHTML = '🎫 เข้าสู่ระบบ Ticket Officer';
    if (hintTitle) hintTitle.innerHTML = '🎫 <strong>ข้อมูลล็อกอินเจ้าหน้าที่ตรวจตั๋ว (Ticket Officer):</strong>';
    if (hintCreds) hintCreds.innerHTML = 'อีเมล: <code style="color:var(--primary)">ticket@xfly.com</code> | รหัสผ่าน: <code style="color:var(--primary)">ticket1234</code>';
  } else {
    // staff
    if (btnStaff) {
      btnStaff.style.background = 'rgba(212,175,55,0.25)';
      btnStaff.style.color = 'var(--primary)';
    }
    if (iconEl) iconEl.textContent = '🛡️';
    if (badgeEl) badgeEl.textContent = '🔒 RESTRICTED AREA — STAFF ONLY';
    if (titleEl) titleEl.textContent = 'Xfly-Anyway Airlines';
    if (subtitleEl) subtitleEl.textContent = 'เข้าสู่ระบบแผงควบคุมเจ้าหน้าที่ (Staff Operations)';
    if (emailLabel) emailLabel.textContent = '📧 บัญชีเจ้าหน้าที่ (Staff Email)';
    if (emailInput) emailInput.value = 'staff@xfly.com';
    if (passInput) passInput.value = 'staff1234';
    if (loginBtn) loginBtn.innerHTML = '🚀 เข้าสู่ระบบ Staff';
    if (hintTitle) hintTitle.innerHTML = '🛡️ <strong>ข้อมูลล็อกอินเจ้าหน้าที่ (Staff):</strong>';
    if (hintCreds) hintCreds.innerHTML = 'อีเมล: <code style="color:var(--primary)">staff@xfly.com</code> | รหัสผ่าน: <code style="color:var(--primary)">staff1234</code>';
  }
}

function quickFillCurrentRole() {
  selectLoginRole(selectedLoginRole);
  showToast('กรอกข้อมูลบัญชีตัวอย่างเรียบร้อย ⚡', 'info');
}

function showAdminDashboard() {
  document.getElementById('adminLoginView').style.display = 'none';
  document.getElementById('adminDashboardView').style.display = 'flex';

  if (currentAdmin) {
    const nameEl = document.getElementById('adminUserName');
    const emailEl = document.getElementById('adminUserEmail');
    if (nameEl) nameEl.textContent = currentAdmin.name || 'Staff';
    if (emailEl) emailEl.textContent = currentAdmin.email || 'staff@xfly.com';

    const isTicketOfficer = currentAdmin.role === 'ticket';
    const banner = document.getElementById('ticketOfficerBanner');
    const staffActions = document.getElementById('staffOnlyTicketActions');
    const liveBadge = document.querySelector('.admin-badge.live');

    // Tab buttons
    const tabDash = document.getElementById('tabDashboardBtn');
    const tabFlights = document.getElementById('tabFlightsBtn');
    const tabAirports = document.getElementById('tabAirportsBtn');
    const tabAirlines = document.getElementById('tabAirlinesBtn');
    const tabTickets = document.getElementById('tabTicketsBtn');

    if (isTicketOfficer) {
      if (liveBadge) liveBadge.innerHTML = '<span class="pulse-dot"></span> TICKET OFFICER';
      if (banner) banner.style.display = 'block';
      if (staffActions) staffActions.style.display = 'none';

      // Restrict tabs: hide flight/airport/airline management from ticket officer
      if (tabDash) tabDash.style.display = 'none';
      if (tabFlights) tabFlights.style.display = 'none';
      if (tabAirports) tabAirports.style.display = 'none';
      if (tabAirlines) tabAirlines.style.display = 'none';
      if (tabTickets) {
        tabTickets.style.display = 'flex';
        tabTickets.innerHTML = '🎫 ตรวจสอบตั๋วและเลขที่นั่ง (Ticket Officer)';
      }
      switchAdminTab('tickets');
    } else {
      if (liveBadge) liveBadge.innerHTML = '<span class="pulse-dot"></span> STAFF PORTAL';
      if (banner) banner.style.display = 'none';
      if (staffActions) staffActions.style.display = 'flex';

      if (tabDash) tabDash.style.display = 'flex';
      if (tabFlights) tabFlights.style.display = 'flex';
      if (tabAirports) tabAirports.style.display = 'flex';
      if (tabAirlines) tabAirlines.style.display = 'flex';
      if (tabTickets) {
        tabTickets.style.display = 'flex';
        tabTickets.innerHTML = '🎫 ตรวจสอบตั๋วโดยสาร (View Ticket)';
      }
      switchAdminTab('dashboard');
    }
  }

  refreshAdminDashboard();
}

function openFlightSeatSelectorForTicket() {
  const flights = Storage.getFlights();
  const options = flights.map(f => `${f.id}: ${f.from.city} → ${f.to.city} (${f.departure})`).join('\n');
  const chosen = prompt(`ระบุรหัสเที่ยวบินที่ต้องการตรวจสอบผังที่นั่งและผู้โดยสาร:\n\n${options}`, flights[0]?.id || 'XF101');
  if (chosen) {
    const flight = flights.find(f => f.id.toUpperCase() === chosen.trim().toUpperCase());
    if (flight) {
      openAdminSeatMap(flight.id);
    } else {
      alert('ไม่พบเที่ยวบิน ' + chosen);
    }
  }
}

function setupAdminLoginForm() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('adminLoginBtn');
    const err = document.getElementById('adminLoginError');
    err.classList.add('hidden');

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> กำลังตรวจสอบสิทธิ์...';

    // 1. Owner role selected
    if (selectedLoginRole === 'owner') {
      const verifiedOwner = Storage.verifyOwner(email, password);
      if (verifiedOwner) {
        sessionStorage.setItem('xfly_owner', JSON.stringify({
          id: verifiedOwner.id || 'OWN-001',
          email: verifiedOwner.email,
          name: verifiedOwner.name || 'Executive Owner',
          role: 'owner',
          loggedInAt: new Date().toISOString()
        }));
        showToast('เข้าสู่ระบบผู้บริหารสูงสุดสำเร็จ! 👑', 'success');
        setTimeout(() => {
          window.location.href = window.location.pathname.includes('/admin/') ? '../owner.html' : 'owner.html';
        }, 300);
        return;
      }
      err.innerHTML = 'อีเมลหรือรหัสผ่านผู้บริหาร (Owner) ไม่ถูกต้อง';
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '👑 เข้าสู่ระบบ Executive Owner';
      return;
    }

    // 2. Check if user is trying to log in with an Owner account while in Staff/Ticket mode
    const owners = Storage.getOwners();
    const isOwnerEmail = owners.some(o => o.email.toLowerCase() === email.toLowerCase()) || email.toLowerCase() === 'owner';
    if (isOwnerEmail) {
      err.innerHTML = '⚠️ บัญชีนี้เป็นของผู้บริหาร (Owner) กรุณากดเลือกแถบ 👑 <strong>Owner</strong> ด้านบน หรือเข้าสู่ระบบที่ <a href="owner.html" style="color:var(--primary);text-decoration:underline;font-weight:bold">Owner Portal</a>';
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = selectedLoginRole === 'ticket' ? '🎫 เข้าสู่ระบบ Ticket Officer' : '🚀 เข้าสู่ระบบ Staff';
      return;
    }

    // 3. Ticket role selected
    if (selectedLoginRole === 'ticket') {
      const matched = Storage.verifyAdmin(email, password);
      if (matched) {
        setAdminSession({
          id: matched.id,
          email: matched.email,
          name: matched.name || 'Ticket Officer',
          role: 'ticket',
          department: matched.department || 'Passenger & Ticket Services'
        });
        showToast(`ยินดีต้อนรับคุณ ${matched.name} เจ้าหน้าที่ตรวจสอบตั๋ว 🎫`, 'success');
        showAdminDashboard();
        btn.disabled = false;
        btn.innerHTML = '🎫 เข้าสู่ระบบ Ticket Officer';
        return;
      }
      err.innerHTML = 'อีเมลหรือรหัสผ่าน Ticket Officer ไม่ถูกต้อง (ใช้ ticket@xfly.com / ticket1234)';
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '🎫 เข้าสู่ระบบ Ticket Officer';
      return;
    }

    // 4. Staff role selected
    const matched = Storage.verifyAdmin(email, password);
    if (matched) {
      setAdminSession({
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: matched.role || 'staff',
        department: matched.department || 'Flight Operations'
      });
      showToast(`เข้าสู่ระบบสำเร็จ! สวัสดีคุณ ${matched.name} 🛡️`, 'success');
      showAdminDashboard();
      btn.disabled = false;
      btn.innerHTML = '🚀 เข้าสู่ระบบ Staff';
      return;
    }

    // 5. Supabase Auth fallback
    if (typeof db !== 'undefined') {
      try {
        const { data, error } = await db.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          setAdminSession({
            email: data.user.email,
            name: data.user.email.split('@')[0],
            role: 'staff',
            userId: data.user.id
          });
          showToast('เข้าสู่ระบบสำเร็จ! 🛡️', 'success');
          showAdminDashboard();
          btn.disabled = false;
          btn.innerHTML = '🚀 เข้าสู่ระบบ Staff';
          return;
        }
      } catch(ex) {}
    }

    err.innerHTML = 'อีเมลหรือรหัสผ่าน Staff ไม่ถูกต้อง (ใช้ staff@xfly.com / staff1234)';
    err.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '🚀 เข้าสู่ระบบ Staff';
  });
}

function setAdminSession(adminObj) {
  currentAdmin = adminObj;
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminObj));
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminObj));
}

function handleAdminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
  currentAdmin = null;
  showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  showAdminLogin();
}

function toggleAdminPassword() {
  const input = document.getElementById('adminPassword');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// ─── Tab Switching ─────────────────────────────────────────────
// Flow: Login → Dashboard → Manage Flight → Manage Airport → Manage Airline → View Ticket
function switchAdminTab(tab) {
  const tabs = ['dashboard', 'flights', 'airports', 'airlines', 'tickets'];

  tabs.forEach(t => {
    const sec = document.getElementById(`section${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    if (sec) sec.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });

  // Call module renderers on tab switch
  if (tab === 'dashboard') {
    renderAdminStats();
    renderDashboardLists();
  } else if (tab === 'flights') {
    if (typeof renderAdminFlightsSection === 'function') renderAdminFlightsSection();
  } else if (tab === 'airports') {
    if (typeof renderAdminAirportsSection === 'function') renderAdminAirportsSection();
  } else if (tab === 'airlines') {
    if (typeof renderAdminAirlinesSection === 'function') renderAdminAirlinesSection();
  } else if (tab === 'tickets') {
    if (typeof loadAdminTickets === 'function') loadAdminTickets();
  }
}

// ─── Dashboard Metrics ─────────────────────────────────────────
async function refreshAdminDashboard() {
  Storage.cleanExpiredLocks();
  renderAdminStats();
  renderDashboardLists();
  if (typeof renderAdminFlightsSection === 'function') renderAdminFlightsSection();
  if (typeof renderAdminAirportsSection === 'function') renderAdminAirportsSection();
  if (typeof renderAdminAirlinesSection === 'function') renderAdminAirlinesSection();
  if (typeof loadAdminTickets === 'function') loadAdminTickets();
}

function renderAdminStats() {
  const bookings = Storage.getAllBookings();
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const totalRevenue = confirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const flights = Storage.getFlights();
  const allSeats = Storage.getAllSeats();
  let totalBooked = 0;
  Object.keys(allSeats).forEach(k => {
    if (allSeats[k].status === 'booked') totalBooked++;
  });

  const totalCapacity = flights.length * 34;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  document.getElementById('statRevenue').textContent = formatPrice(totalRevenue);
  document.getElementById('statTotalBookings').textContent = bookings.length;
  document.getElementById('statConfirmedBookings').textContent = confirmed.length;
  document.getElementById('statCancelledBookings').textContent = cancelled.length;
  document.getElementById('statSeatRate').textContent = `${occupancyRate}%`;
  document.getElementById('statSeatCount').textContent = `${totalBooked}/${totalCapacity} ที่นั่ง`;
}

function renderDashboardLists() {
  const flights = Storage.getFlights();
  const bookings = Storage.getAllBookings();

  const flightsListEl = document.getElementById('dashboardRecentFlightsList');
  if (flightsListEl) {
    flightsListEl.innerHTML = flights.slice(0, 4).map(f => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
        <div>
          <strong>${f.id}</strong> <span style="font-size:12px;color:var(--text-muted)">(${f.airlineName || 'Xfly-Anyway'})</span>
          <div style="font-size:12px;color:var(--text-secondary)">${f.from.code} → ${f.to.code} (${f.departure})</div>
        </div>
        <div style="font-weight:700;color:var(--primary)">${formatPrice(f.price)}</div>
      </div>
    `).join('') || '<div style="color:var(--text-muted);font-size:13px">ไม่มีเที่ยวบิน</div>';
  }

  const bookingsListEl = document.getElementById('dashboardRecentBookingsList');
  if (bookingsListEl) {
    bookingsListEl.innerHTML = bookings.slice(0, 4).map(b => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
        <div>
          <strong style="color:var(--primary);cursor:pointer" onclick="switchAdminTab('tickets')">${b.id}</strong>
          <div style="font-size:12px;color:var(--text-secondary)">${b.passenger?.firstName || ''} ${b.passenger?.lastName || ''} · ${b.flightId} (${b.seatId})</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;font-weight:700">${formatPrice(b.totalPrice)}</div>
          <span style="font-size:10px;color:${b.status === 'confirmed' ? 'var(--success)' : 'var(--danger)'}">● ${b.status}</span>
        </div>
      </div>
    `).join('') || '<div style="color:var(--text-muted);font-size:13px">ยังไม่มีรายการจอง</div>';
  }
}

function cleanExpiredLocksAction() {
  Storage.cleanExpiredLocks();
  showToast('ปลดล็อกที่นั่งที่หมดเวลาแล้วเรียบร้อย ⚡', 'success');
  refreshAdminDashboard();
}

// ─── Seat Map Modal for Admin ──────────────────────────────────
function openAdminSeatModal(flightId) {
  const flight = Storage.getFlight(flightId);
  if (!flight) return;

  document.getElementById('modalFlightTitle').textContent = `ผังที่นั่ง ${flight.id} (${flight.from.code} → ${flight.to.code})`;
  document.getElementById('modalFlightSubtitle').textContent = `เส้นทาง ${flight.from.city} ถึง ${flight.to.city} | เวลา ${flight.departure} – ${flight.arrival}`;

  const container = document.getElementById('adminSeatMapContainer');
  Storage.cleanExpiredLocks();
  const bookings = Storage.getAllBookings();

  let html = '';
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

  // First Class
  html += `<div class="class-divider">
    <div class="class-divider-line"></div>
    <div class="class-divider-label">👑 First Class (แถว 1–2)</div>
    <div class="class-divider-line"></div>
  </div>`;
  [1, 2].forEach(row => {
    html += renderAdminRow(flight.id, row, 'first', bookings);
  });

  // Business Class
  html += `<div class="class-divider">
    <div class="class-divider-line"></div>
    <div class="class-divider-label">✨ Business Class (แถว 3–12)</div>
    <div class="class-divider-line"></div>
  </div>`;
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(row => {
    html += renderAdminRow(flight.id, row, 'business', bookings);
  });

  container.innerHTML = html;
  document.getElementById('adminSeatModal').classList.add('active');
}

function renderAdminRow(flightId, row, seatClass, bookings) {
  let html = `<div class="seat-row"><div class="row-num">${row}</div>`;
  ['A', 'B', 'C'].forEach(col => {
    html += renderAdminSeat(flightId, row, col, seatClass, bookings);
  });
  html += `<div class="aisle-space"><div style="width:1px;height:70%;background:var(--border);opacity:.3;"></div></div>`;
  ['D', 'E', 'F'].forEach(col => {
    html += renderAdminSeat(flightId, row, col, seatClass, bookings);
  });
  html += `</div>`;
  return html;
}

function renderAdminSeat(flightId, row, col, seatClass, bookings) {
  const seatId = `${row}${col}`;
  const seatData = Storage.getSeat(flightId, seatId);
  const status = seatData.status || 'available';

  let tooltip = `ที่นั่ง ${seatId} (${seatClass}) - สถานะ: ${status}`;
  if (status === 'booked') {
    const booking = bookings.find(b => b.flightId === flightId && b.seatId === seatId && b.status === 'confirmed');
    if (booking) {
      tooltip += ` | ผู้โดยสาร: ${booking.passenger?.firstName || ''} ${booking.passenger?.lastName || ''}`;
    }
  }

  return `
    <div class="seat ${status}" style="cursor:default" title="${tooltip}">
      ${seatId}
    </div>
  `;
}

function closeAdminSeatModal() {
  document.getElementById('adminSeatModal').classList.remove('active');
}
