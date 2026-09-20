/**
 * auth.js — X-Fly Authentication (Supabase)
 * Login / Register / Forgot Password
 * Single button → Modal with Tabs
 */

// ─── Auth State ────────────────────────────────────────────────
let currentUser = null;

async function initAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (session?.user) {
    await loadUserProfile(session.user);
  }
  db.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await loadUserProfile(session.user);
    } else {
      currentUser = null;
    }
    renderAuthNav();
  });
}

async function loadUserProfile(user) {
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  currentUser = {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email.split('@')[0],
    phone: profile?.phone || '',
    avatar: (profile?.name || user.email)[0].toUpperCase()
  };
}

// ─── Modal Injection ───────────────────────────────────────────
function injectAuthModal() {
  const html = `
  <!-- Auth Modal: Single button with Tabs -->
  <div class="modal-overlay" id="authModal">
    <div class="modal" style="max-width:440px;padding:0;overflow:hidden">

      <!-- Tab Bar -->
      <div class="auth-tab-bar">
        <button class="auth-tab active" id="tabLoginBtn" onclick="switchAuthTab('login')">
          🔑 เข้าสู่ระบบ
        </button>
        <button class="auth-tab" id="tabRegisterBtn" onclick="switchAuthTab('register')">
          ✨ สมัครสมาชิก
        </button>
      </div>

      <div style="padding:32px 36px 36px">

        <!-- ─── Login Panel ─── -->
        <div id="loginPanel">
          <div class="modal-icon" style="margin-bottom:12px">✈️</div>
          <div class="modal-title">ยินดีต้อนรับกลับ</div>
          <div class="modal-subtitle">เข้าสู่ระบบเพื่อจัดการการจอง</div>
          <form id="loginForm" autocomplete="off">
            <div class="form-group" style="margin-bottom:14px">
              <label for="loginEmail">📧 อีเมล</label>
              <input type="email" id="loginEmail" name="loginEmail" placeholder="example@email.com" required>
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label for="loginPassword">🔒 รหัสผ่าน</label>
              <div style="position:relative">
                <input type="password" id="loginPassword" name="loginPassword" placeholder="••••••••" required>
                <button type="button" onclick="togglePwd('loginPassword',this)" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px">👁</button>
              </div>
            </div>
            <div style="text-align:right;margin-bottom:20px">
              <button type="button" class="btn-link" onclick="switchAuthTab('forgot')">ลืมรหัสผ่าน?</button>
            </div>
            <div id="loginError" class="auth-error hidden"></div>
            <button type="submit" class="btn btn-primary w-full" id="loginBtn">🚀 เข้าสู่ระบบ</button>
          </form>
          <div style="text-align:center;margin-top:16px;font-size:13px;color:var(--text-muted)">
            ยังไม่มีบัญชี?
            <button type="button" class="btn-link" onclick="switchAuthTab('register')">สมัครสมาชิกฟรี →</button>
          </div>
        </div>

        <!-- ─── Register Panel ─── -->
        <div id="registerPanel" class="hidden">
          <div class="modal-icon" style="margin-bottom:12px">🎉</div>
          <div class="modal-title">สร้างบัญชีใหม่</div>
          <div class="modal-subtitle">เข้าร่วมครอบครัว X-Fly วันนี้ฟรี!</div>
          <form id="registerForm" autocomplete="off">
            <div class="form-group" style="margin-bottom:14px">
              <label for="regName">👤 ชื่อ-นามสกุล</label>
              <input type="text" id="regName" placeholder="สมชาย ใจดี" required>
            </div>
            <div class="form-group" style="margin-bottom:14px">
              <label for="regEmail">📧 อีเมล</label>
              <input type="email" id="regEmail" placeholder="example@email.com" required>
            </div>
            <div class="form-group" style="margin-bottom:14px">
              <label for="regPhone">📱 เบอร์โทรศัพท์</label>
              <input type="tel" id="regPhone" placeholder="08X-XXX-XXXX">
            </div>
            <div class="form-group" style="margin-bottom:14px">
              <label for="regPassword">🔒 รหัสผ่าน</label>
              <div style="position:relative">
                <input type="password" id="regPassword" placeholder="อย่างน้อย 6 ตัวอักษร" required minlength="6">
                <button type="button" onclick="togglePwd('regPassword',this)" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px">👁</button>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:20px">
              <label for="regConfirm">🔒 ยืนยันรหัสผ่าน</label>
              <input type="password" id="regConfirm" placeholder="••••••••" required>
            </div>
            <div id="registerError" class="auth-error hidden"></div>
            <button type="submit" class="btn btn-primary w-full" id="registerBtn">✨ สมัครสมาชิก</button>
          </form>
          <div style="text-align:center;margin-top:16px;font-size:13px;color:var(--text-muted)">
            มีบัญชีแล้ว?
            <button type="button" class="btn-link" onclick="switchAuthTab('login')">เข้าสู่ระบบ →</button>
          </div>
        </div>

        <!-- ─── Forgot Password Panel ─── -->
        <div id="forgotPanel" class="hidden">
          <div class="modal-icon" style="margin-bottom:12px">🔑</div>
          <div class="modal-title">ลืมรหัสผ่าน?</div>
          <div class="modal-subtitle">กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่านทางอีเมล</div>
          <form id="forgotForm" autocomplete="off">
            <div class="form-group" style="margin-bottom:20px">
              <label for="forgotEmail">📧 อีเมลที่ลงทะเบียนไว้</label>
              <input type="email" id="forgotEmail" placeholder="example@email.com" required>
            </div>
            <div id="forgotError" class="auth-error hidden"></div>
            <div id="forgotSuccess" class="auth-success hidden">
              📬 ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว กรุณาตรวจสอบอีเมล
            </div>
            <button type="submit" class="btn btn-primary w-full">📬 ส่งลิงก์รีเซ็ต</button>
          </form>
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchAuthTab('login')" style="width:100%;margin-top:12px">← กลับหน้าเข้าสู่ระบบ</button>
        </div>

        <!-- Close button -->
        <button class="btn btn-ghost btn-sm" onclick="closeAuthModal()" style="width:100%;margin-top:12px">ยกเลิก</button>
      </div>
    </div>
  </div>

  <!-- User Dropdown -->
  <div id="userDropdown" class="user-dropdown hidden">
    <div class="user-dropdown-header">
      <div class="user-avatar-sm" id="dropdownAvatar">A</div>
      <div>
        <div style="font-weight:700;font-size:14px" id="dropdownName">ผู้ใช้</div>
        <div style="font-size:12px;color:var(--text-muted)" id="dropdownEmail">email</div>
      </div>
    </div>
    <div class="user-dropdown-divider"></div>
    <a href="history.html" class="user-dropdown-item">📋 ประวัติการจอง</a>
    <div class="user-dropdown-divider"></div>
    <button onclick="handleLogout()" class="user-dropdown-item danger">🚪 ออกจากระบบ</button>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// ─── Tab Switching ─────────────────────────────────────────────
function switchAuthTab(tab) {
  // Update tab buttons
  const tabs = { login: 'tabLoginBtn', register: 'tabRegisterBtn' };
  Object.entries(tabs).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', key === tab);
  });

  // Show/hide tab bar for forgot panel
  const tabBar = document.querySelector('.auth-tab-bar');
  if (tabBar) tabBar.style.display = tab === 'forgot' ? 'none' : 'flex';

  // Show/hide panels
  ['loginPanel', 'registerPanel', 'forgotPanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== tab + 'Panel');
  });

  // Clear errors
  ['loginError', 'registerError', 'forgotError', 'forgotSuccess'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

// ─── Modal Open/Close ──────────────────────────────────────────
function openAuthModal(tab = 'login') {
  document.getElementById('authModal').classList.add('active');
  // Restore tab bar display
  const tabBar = document.querySelector('.auth-tab-bar');
  if (tabBar) tabBar.style.display = 'flex';
  switchAuthTab(tab);
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.add('hidden');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
  ['loginForm','registerForm','forgotForm'].forEach(id => {
    const f = document.getElementById(id);
    if (f) f.reset();
  });
}

// ─── Navbar Render ─────────────────────────────────────────────
function renderAuthNav() {
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;

  // Check if Admin is logged in
  const adminSession = sessionStorage.getItem('xfly_admin') || localStorage.getItem('xfly_admin');
  if (adminSession) {
    try {
      const admin = JSON.parse(adminSession);
      navAuth.innerHTML = `
        <a href="admin.html" class="btn btn-outline btn-sm" style="border-color:var(--border-gold);color:var(--primary);display:inline-flex;align-items:center;gap:6px">
          🛡️ แผง Admin
        </a>
        <button class="nav-user-btn" onclick="handleAdminLogoutFromNav()" title="คลิกเพื่อออกจากระบบ Admin (${admin.email || ''})">
          <div class="user-avatar" style="background:linear-gradient(135deg,#FF8C00,#FF4444);color:#fff">A</div>
          <span style="font-size:13px;font-weight:600;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${admin.name || 'Admin'}</span>
          <span style="font-size:10px;color:var(--text-muted)">🚪</span>
        </button>`;
      return;
    } catch(e) {}
  }

  // If a regular user is logged in via Supabase
  if (currentUser) {
    navAuth.innerHTML = `
      <button class="nav-user-btn" id="navUserBtn" onclick="toggleUserDropdown()">
        <div class="user-avatar">${currentUser.avatar}</div>
        <span style="font-size:14px;font-weight:600;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${currentUser.name}</span>
        <span style="font-size:10px;color:var(--text-muted)">▼</span>
      </button>`;
    const a = document.getElementById('dropdownAvatar');
    const n = document.getElementById('dropdownName');
    const e = document.getElementById('dropdownEmail');
    if (a) a.textContent = currentUser.avatar;
    if (n) n.textContent = currentUser.name;
    if (e) e.textContent = currentUser.email;
    return;
  }

  // Not logged in: DO NOT show "เข้าสู่ระบบ" button on main page
  navAuth.innerHTML = '';
}

function handleAdminLogoutFromNav() {
  if (confirm('คุณต้องการออกจากระบบ Admin หรือไม่?')) {
    sessionStorage.removeItem('xfly_admin');
    localStorage.removeItem('xfly_admin');
    if (typeof db !== 'undefined') db.auth.signOut().catch(() => {});
    showToast('ออกจากระบบ Admin เรียบร้อยแล้ว', 'info');
    renderAuthNav();
  }
}

// ─── User Dropdown ─────────────────────────────────────────────
function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  const btn = document.getElementById('navUserBtn');
  if (!dd) return;
  dd.classList.toggle('hidden');
  if (!dd.classList.contains('hidden') && btn) {
    const rect = btn.getBoundingClientRect();
    dd.style.top = (rect.bottom + 8) + 'px';
    dd.style.right = (window.innerWidth - rect.right) + 'px';
  }
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('userDropdown');
  const btn = document.getElementById('navUserBtn');
  if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
    dd.classList.add('hidden');
  }
  const modal = document.getElementById('authModal');
  if (modal && e.target === modal) closeAuthModal();
});

// ─── Form Handlers ─────────────────────────────────────────────
function setupAuthForms() {

  // LOGIN
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const err = document.getElementById('loginError');
      err.classList.add('hidden');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> กำลังเข้าสู่ระบบ...';

      const { data, error } = await db.auth.signInWithPassword({
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value
      });

      if (error) {
        let msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        if (error.message.includes('Email not confirmed')) msg = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';
        err.textContent = msg;
        err.classList.remove('hidden');
      } else {
        await loadUserProfile(data.user);
        closeAuthModal();
        showToast(`ยินดีต้อนรับ ${currentUser?.name || ''}! 🎉`, 'success');
        renderAuthNav();
      }

      btn.disabled = false;
      btn.innerHTML = '🚀 เข้าสู่ระบบ';
    });
  }

  // REGISTER
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      const err = document.getElementById('registerError');
      err.classList.add('hidden');

      const name     = document.getElementById('regName').value.trim();
      const email    = document.getElementById('regEmail').value.trim();
      const phone    = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm  = document.getElementById('regConfirm').value;

      if (password !== confirm) {
        err.textContent = 'รหัสผ่านไม่ตรงกัน';
        err.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> กำลังสมัคร...';

      // 1) Create Supabase Auth user
      const { data, error } = await db.auth.signUp({ email, password });

      if (error) {
        let msg = 'สมัครสมาชิกไม่สำเร็จ: ' + error.message;
        if (error.message.includes('already registered')) msg = 'อีเมลนี้ถูกใช้งานแล้ว';
        err.textContent = msg;
        err.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '✨ สมัครสมาชิก';
        return;
      }

      // 2) Insert profile
      if (data.user) {
        await db.from('profiles').insert({
          id: data.user.id,
          name,
          email: email.toLowerCase(),
          phone: phone || null
        });
        await loadUserProfile(data.user);
      }

      closeAuthModal();

      // Check if email confirmation is required
      if (!data.session) {
        showToast('สมัครสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ 📬', 'info', 6000);
      } else {
        showToast(`สมัครสำเร็จ! ยินดีต้อนรับ ${name} 🎉`, 'success');
        renderAuthNav();
      }

      btn.disabled = false;
      btn.innerHTML = '✨ สมัครสมาชิก';
    });
  }

  // FORGOT PASSWORD
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = document.getElementById('forgotError');
      const suc = document.getElementById('forgotSuccess');
      err.classList.add('hidden');
      suc.classList.add('hidden');

      const email = document.getElementById('forgotEmail').value.trim();
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/index.html'
      });

      if (error) {
        err.textContent = 'ไม่สามารถส่งอีเมลได้: ' + error.message;
        err.classList.remove('hidden');
      } else {
        suc.classList.remove('hidden');
        forgotForm.reset();
      }
    });
  }
}

// ─── Logout ────────────────────────────────────────────────────
async function handleLogout() {
  await db.auth.signOut();
  currentUser = null;
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.add('hidden');
  showToast('ออกจากระบบสำเร็จ', 'info');
  renderAuthNav();
}

// ─── Helpers ───────────────────────────────────────────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

// ─── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  injectAuthModal();
  await initAuth();
  renderAuthNav();
  setupAuthForms();
});

