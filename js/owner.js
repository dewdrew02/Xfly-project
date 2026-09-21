/**
 * owner.js — Xfly-Anyway Airlines Executive Owner Portal Controller
 * Coordinates Owner Auth, Executive KPIs, and Tab Navigation across modular files
 */

const OWNER_SESSION_KEY = 'xfly_owner_session';
let currentOwner = null;

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();
  checkOwnerAuth();
  setupOwnerLoginForm();
});

// ─── Authentication Check ──────────────────────────────────────
function checkOwnerAuth() {
  const sessionStr = sessionStorage.getItem(OWNER_SESSION_KEY) || localStorage.getItem(OWNER_SESSION_KEY);
  if (sessionStr) {
    try {
      currentOwner = JSON.parse(sessionStr);
      showOwnerDashboard();
      return;
    } catch(e) {
      sessionStorage.removeItem(OWNER_SESSION_KEY);
      localStorage.removeItem(OWNER_SESSION_KEY);
    }
  }
  showOwnerLogin();
}

function showOwnerLogin() {
  document.getElementById('ownerLoginView').style.display = 'flex';
  document.getElementById('ownerDashboardView').style.display = 'none';
}

function showOwnerDashboard() {
  document.getElementById('ownerLoginView').style.display = 'none';
  document.getElementById('ownerDashboardView').style.display = 'flex';
  refreshOwnerDashboard();
}

function setupOwnerLoginForm() {
  const form = document.getElementById('ownerLoginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('ownerLoginBtn');
    const err = document.getElementById('ownerLoginError');
    err.classList.add('hidden');

    const email = document.getElementById('ownerEmail').value.trim();
    const password = document.getElementById('ownerPassword').value;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> กำลังตรวจสอบสิทธิ์ระดับผู้บริหาร...';

    setTimeout(() => {
      // 1. Check if user is trying to use an Admin account in Owner portal
      const admins = Storage.getAdmins();
      const isAdminEmail = admins.some(a => a.email.toLowerCase() === email.toLowerCase()) || email.toLowerCase() === 'admin';
      if (isAdminEmail) {
        err.innerHTML = '⚠️ บัญชีนี้เป็นของเจ้าหน้าที่ (Staff) ไม่มีสิทธิ์เข้า Executive Portal กรุณาเข้าสู่ระบบที่ <a href="staff.html" style="color:var(--primary);text-decoration:underline;font-weight:bold">Staff Portal</a>';
        err.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '👑 เข้าสู่ระบบผู้บริหาร';
        return;
      }

      // 2. Verify with Owner accounts
      const verifiedOwner = Storage.verifyOwner(email, password);
      if (verifiedOwner) {
        const ownerObj = {
          id: verifiedOwner.id || 'OWN-001',
          email: verifiedOwner.email,
          name: verifiedOwner.name || 'Executive Owner',
          role: 'owner',
          loggedInAt: new Date().toISOString()
        };
        sessionStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(ownerObj));
        localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(ownerObj));
        currentOwner = ownerObj;

        showToast(`ยินดีต้อนรับท่านผู้บริหาร ${ownerObj.name} เข้าสู่ระบบสำเร็จ! 👑`, 'success');
        showOwnerDashboard();
      } else {
        err.innerHTML = 'อีเมลหรือรหัสผ่านผู้บริหาร (Owner) ไม่ถูกต้อง';
        err.classList.remove('hidden');
      }
      btn.disabled = false;
      btn.innerHTML = '👑 เข้าสู่ระบบผู้บริหาร';
    }, 400);
  });
}

function handleOwnerLogout() {
  sessionStorage.removeItem(OWNER_SESSION_KEY);
  localStorage.removeItem(OWNER_SESSION_KEY);
  currentOwner = null;
  showToast('ออกจากระบบผู้บริหารเรียบร้อยแล้ว', 'info');
  showOwnerLogin();
}

function toggleOwnerPassword() {
  const input = document.getElementById('ownerPassword');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// ─── Tab Switching ─────────────────────────────────────────────
// Requirement: Login → Dashboard → Sales/Revenue → Manage Admin
function switchOwnerTab(tab) {
  const tabs = ['dashboard', 'revenue', 'admins'];

  tabs.forEach(t => {
    const sec = document.getElementById(`sectionOwner${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const btn = document.getElementById(`tabOwner${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    if (sec) sec.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });

  if (tab === 'dashboard') {
    updateOwnerKpis();
  } else if (tab === 'revenue') {
    if (typeof renderOwnerRevenueSection === 'function') renderOwnerRevenueSection();
  } else if (tab === 'admins') {
    if (typeof renderOwnerAdminsSection === 'function') renderOwnerAdminsSection();
  }
}

// ─── Executive Dashboard KPIs ──────────────────────────────────
function refreshOwnerDashboard() {
  updateOwnerKpis();
  if (typeof renderOwnerRevenueSection === 'function') renderOwnerRevenueSection();
  if (typeof renderOwnerAdminsSection === 'function') renderOwnerAdminsSection();
}

function updateOwnerKpis() {
  const bookings = Storage.getAllBookings();
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const grossRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || b.basePrice || 0), 0);
  const netRevenue = confirmed.reduce((sum, b) => sum + (b.totalPrice || b.basePrice || 0), 0);

  const avgTicket = confirmed.length > 0 ? Math.round(netRevenue / confirmed.length) : 0;
  const confirmedRate = bookings.length > 0 ? Math.round((confirmed.length / bookings.length) * 100) : 100;

  const admins = Storage.getAdmins();

  document.getElementById('kpiNetRevenue').textContent = formatPrice(netRevenue);
  document.getElementById('kpiGrossCompare').textContent = `● ยอดรวมก่อนหัก: ${formatPrice(grossRevenue)} (ยกเลิก ${cancelled.length} รายการ)`;
  document.getElementById('kpiTicketsSold').textContent = `${confirmed.length} ใบ`;
  document.getElementById('kpiConfirmedRate').textContent = `อัตราความสำเร็จ: ${confirmedRate}%`;
  document.getElementById('kpiAvgTicket').textContent = formatPrice(avgTicket);
  document.getElementById('kpiTotalAdmins').textContent = `${admins.length} คน`;

  renderTopRoutes(confirmed);
  renderSeatClassShare(confirmed);
}

function renderTopRoutes(confirmedBookings) {
  const container = document.getElementById('topRoutesList');
  if (!container) return;

  const flights = Storage.getFlights();

  // Aggregate revenue by flight
  const routeStats = flights.map(f => {
    const flightBookings = confirmedBookings.filter(b => b.flightId === f.id);
    const rev = flightBookings.reduce((sum, b) => sum + (b.totalPrice || b.basePrice || 0), 0);
    return {
      flight: f,
      tickets: flightBookings.length,
      revenue: rev
    };
  }).sort((a, b) => b.revenue - a.revenue);

  container.innerHTML = routeStats.slice(0, 4).map((r, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:24px;height:24px;border-radius:50%;background:${i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)'};color:${i === 0 ? '#000' : '#fff'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px">
          ${i + 1}
        </div>
        <div>
          <div style="font-weight:700">${r.flight.id} — ${r.flight.from.code} → ${r.flight.to.code}</div>
          <div style="font-size:11px;color:var(--text-muted)">จำหน่าย ${r.tickets} ที่นั่ง</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:800;color:var(--primary)">${formatPrice(r.revenue)}</div>
      </div>
    </div>
  `).join('') || '<div style="color:var(--text-muted);font-size:13px">ไม่มีข้อมูล</div>';
}

function renderSeatClassShare(confirmedBookings) {
  const firstCount = confirmedBookings.filter(b => b.seatClass === 'first').length;
  const businessCount = confirmedBookings.filter(b => b.seatClass === 'business' || b.seatClass === 'economy').length;
  const total = firstCount + businessCount;

  const firstPercent = total > 0 ? Math.round((firstCount / total) * 100) : 25;
  const bizPercent = total > 0 ? Math.round((businessCount / total) * 100) : 75;

  const elFirst = document.getElementById('classPercentFirst');
  const elBiz = document.getElementById('classPercentBusiness');
  const barFirst = document.getElementById('barFirst');
  const barBiz = document.getElementById('barBusiness');

  if (elFirst) elFirst.textContent = `${firstPercent}% (${firstCount} ที่นั่ง)`;
  if (elBiz) elBiz.textContent = `${bizPercent}% (${businessCount} ที่นั่ง)`;
  if (barFirst) barFirst.style.width = `${firstPercent}%`;
  if (barBiz) barBiz.style.width = `${bizPercent}%`;
}
