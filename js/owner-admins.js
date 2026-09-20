/**
 * owner-admins.js — Manage Admin Module for Executive Owner
 * Allows Owner to create, configure permissions, suspend, or delete Admin accounts
 */

function renderOwnerAdminsSection() {
  const tbody = document.getElementById('adminsTableBody');
  if (!tbody) return;

  const admins = Storage.getAdmins();

  if (admins.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">ยังไม่มีบัญชีแอดมินในระบบ</td></tr>`;
    return;
  }

  tbody.innerHTML = admins.map(a => {
    const isActive = a.status === 'active';
    const roleBadge = a.role === 'superadmin'
      ? `<span class="tag tag-gold" style="font-size:11px">Super Admin</span>`
      : `<span class="tag" style="background:rgba(255,255,255,0.08);color:#ccc;font-size:11px">${a.role}</span>`;

    const statusBadge = isActive
      ? `<span class="tag" style="background:rgba(0,200,150,0.15);color:var(--success);font-size:11px">● ใช้งานได้ (Active)</span>`
      : `<span class="tag" style="background:rgba(255,68,68,0.15);color:var(--danger);font-size:11px">● ระงับใช้งาน (Suspended)</span>`;

    return `
      <tr>
        <td>
          <strong style="color:var(--primary)">${a.id}</strong>
        </td>
        <td>
          <div style="font-weight:700">${a.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">สร้างเมื่อ: ${formatDate(a.createdAt)}</div>
        </td>
        <td>${a.email}</td>
        <td>${a.department || 'Flight Operations'}</td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td style="text-align:right;white-space:nowrap">
          <button class="btn btn-ghost btn-sm" onclick="toggleAdminStatus('${a.email}')" style="padding:4px 10px;font-size:12px">
            ${isActive ? '⏸️ ระงับ' : '▶️ เปิดใช้งาน'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteAdminAction('${a.email}')" style="padding:4px 10px;font-size:12px;margin-left:4px" ${a.email === 'admin@xfly.com' ? 'disabled title="ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้"' : ''}>
            🗑 ลบ
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  const form = document.getElementById('adminAccountForm');
  form.reset();
  document.getElementById('adminAccountEditEmail').value = '';
  document.getElementById('adminEmailInput').disabled = false;
  modal.classList.add('active');
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('active');
}

function saveAdminSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('adminNameInput').value.trim();
  const email = document.getElementById('adminEmailInput').value.trim().toLowerCase();
  const password = document.getElementById('adminPasswordInput').value;
  const role = document.getElementById('adminRoleSelect').value;
  const department = document.getElementById('adminDeptInput').value.trim();

  if (!name || !email || !password) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
    return;
  }

  // Prevent creating admin with owner's email
  const owners = Storage.getOwners();
  if (owners.some(o => o.email.toLowerCase() === email) || email === 'owner@xfly.com') {
    showToast('ไม่อนุญาตให้ใช้อีเมลของผู้บริหาร (Owner) ในการสร้างบัญชีแอดมิน', 'error');
    return;
  }

  Storage.saveAdmin({
    name,
    email,
    password,
    role,
    department,
    status: 'active'
  });

  showToast(`สร้างบัญชี Admin สำหรับ ${email} เรียบร้อย! 👥`, 'success');
  closeAdminModal();
  renderOwnerAdminsSection();
  if (typeof updateOwnerKpis === 'function') updateOwnerKpis();
}

function toggleAdminStatus(email) {
  const admins = Storage.getAdmins();
  const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return;

  admin.status = admin.status === 'active' ? 'suspended' : 'active';
  Storage.saveAdmin(admin);
  showToast(`อัปเดตสถานะบัญชี ${email} แล้ว`, 'info');
  renderOwnerAdminsSection();
}

function deleteAdminAction(email) {
  if (email === 'admin@xfly.com') {
    showToast('ไม่สามารถลบบัญชี Superadmin เริ่มต้นได้', 'warning');
    return;
  }
  if (!confirm(`ยืนยันการลบบัญชีแอดมิน ${email} ออกจากระบบ?`)) return;

  Storage.deleteAdmin(email);
  showToast(`ลบบัญชีแอดมิน ${email} เรียบร้อยแล้ว`, 'info');
  renderOwnerAdminsSection();
  if (typeof updateOwnerKpis === 'function') updateOwnerKpis();
}
