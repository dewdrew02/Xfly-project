/**
 * passenger.js — X-Fly Passenger Information Logic
 * Validates and preserves passenger draft before seat selection
 */

let currentFlight = null;

document.addEventListener('DOMContentLoaded', () => {
  Storage.init();

  const flightId = sessionStorage.getItem('selectedFlight');
  if (!flightId) {
    showToast('กรุณาเลือกเที่ยวบินก่อนทำรายการ', 'warning');
    setTimeout(() => window.location.href = 'index.html', 1200);
    return;
  }

  currentFlight = Storage.getFlight(flightId);
  if (!currentFlight) {
    showToast('ไม่พบข้อมูลเที่ยวบิน', 'error');
    setTimeout(() => window.location.href = 'index.html', 1200);
    return;
  }

  renderFlightBanner();
  populateSavedPassenger();
  setupPassengerForm();
});

function renderFlightBanner() {
  const f = currentFlight;
  document.getElementById('bannerFlightNum').textContent = `${f.id} — ${f.airlineName || 'Xfly-Anyway Airlines'}`;
  document.getElementById('bannerRoute').textContent = `${f.from.city} (${f.from.code}) → ${f.to.city} (${f.to.code})`;
  document.getElementById('bannerTime').textContent = `${f.departure} – ${f.arrival} (${f.duration})`;
  document.getElementById('bannerPrice').textContent = formatPrice(f.price);
}

function populateSavedPassenger() {
  const form = document.getElementById('passengerForm');
  if (!form) return;

  // 1. Check existing draft
  const draftStr = sessionStorage.getItem('passengerDraft');
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      if (draft.title) form.title.value = draft.title;
      if (draft.firstName) form.firstName.value = draft.firstName;
      if (draft.lastName) form.lastName.value = draft.lastName;
      if (draft.email) form.email.value = draft.email;
      if (draft.phone) form.phone.value = draft.phone;
      if (draft.idNumber) form.idNumber.value = draft.idNumber;
      if (draft.dob) form.dob.value = draft.dob;
      if (draft.specialRequest) form.specialRequest.value = draft.specialRequest;
      return;
    } catch(e) {}
  }

  // 2. Check logged in user profile
  if (typeof currentUser !== 'undefined' && currentUser) {
    if (currentUser.email) form.email.value = currentUser.email;
    if (currentUser.name) {
      const parts = currentUser.name.split(' ');
      form.firstName.value = parts[0] || '';
      form.lastName.value = parts.slice(1).join(' ') || '';
    }
    if (currentUser.phone) form.phone.value = currentUser.phone;
  }
}

function setupPassengerForm() {
  const form = document.getElementById('passengerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const passengerData = {
      title: form.title.value,
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      idNumber: form.idNumber.value.trim(),
      dob: form.dob.value,
      specialRequest: form.specialRequest.value.trim()
    };

    if (!passengerData.firstName || !passengerData.lastName || !passengerData.email || !passengerData.phone || !passengerData.idNumber) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'warning');
      return;
    }

    // Save draft
    sessionStorage.setItem('passengerDraft', JSON.stringify(passengerData));

    showToast('บันทึกข้อมูลผู้โดยสารเรียบร้อย กำลังไปหน้าเลือกที่นั่ง...', 'success', 1200);
    setTimeout(() => {
      window.location.href = 'seat.html';
    }, 500);
  });
}
