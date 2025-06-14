const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const profileForm = document.getElementById('profileForm');
const expiredMessage = document.getElementById('expiredMessage');
const flightBtn = document.getElementById('flightBtn');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const contactInput = document.getElementById('contact');
const genderInput = document.getElementById('gender');
const addressInput = document.getElementById('address');
const pnrInput = document.getElementById('pnr');
const seatInput = document.getElementById('seat');
const expiryInput = document.getElementById('expiry');

const pnrError = document.getElementById('pnrError');
const pnralreadyUseError = document.getElementById('pnralreadyUseError');
const statusMessage = document.getElementById('statusMessage');


pnrError.classList.add('hidden');
pnralreadyUseError.classList.add('hidden');

// Store original values
let originalValues = {};

[pnrInput, seatInput].forEach(input => {
  input.addEventListener('input', () => {
    pnrError.classList.add('hidden');
    pnralreadyUseError.classList.add('hidden');
  });
});

editBtn.addEventListener('click', () => {
  [nameInput, contactInput, genderInput, addressInput, pnrInput, seatInput].forEach(input => {
    input.disabled = false;
    originalValues[input.id] = input.value;
  });

  saveBtn.classList.remove('hidden');
  cancelBtn.classList.remove('hidden');
  editBtn.classList.add('hidden');
});

cancelBtn.addEventListener('click', () => {
  for (const id in originalValues) {
    const field = document.getElementById(id);
    field.value = originalValues[id];
    field.disabled = true;
  }

  saveBtn.classList.add('hidden');
  cancelBtn.classList.add('hidden');
  editBtn.classList.remove('hidden');

  pnrError.classList.add('hidden');
  pnralreadyUseError.classList.add('hidden');
  statusMessage.classList.add('hidden');
});

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const updatedData = {
    email: emailInput.value,
    name: nameInput.value,
    contact: contactInput.value,
    gender: genderInput.value,
    address: addressInput.value,
    pnr: pnrInput.value,
    seat: seatInput.value,
    expiry: expiryInput.value
  };

  console.log("Sending user update:", updatedData);

  if (expiryInput.dataset.original !== updatedData.expiry) {
    const resp = await fetch(`http://localhost:3000/api/validate-pnr?pnr=${updatedData.pnr}&seat=${updatedData.seat}&expiry=${updatedData.expiry}`);
    const result = await resp.json();

    if (!result.valid) {
      pnrError.textContent = "Invalid or expired PNR details. Please check.";
      pnrError.classList.remove('hidden');
      return;
    }
  }

  const response = await fetch('http://localhost:3000/api/user-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });

  if (response.ok) {
    statusMessage.textContent = "Profile updated successfully.";
    statusMessage.classList.remove('hidden');
    statusMessage.classList.add('success-message');

    setTimeout(() => {
      statusMessage.classList.add('hidden');
    }, 5000);

    [nameInput, contactInput, genderInput, addressInput, pnrInput, seatInput].forEach(input => input.disabled = true);
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    editBtn.classList.remove('hidden');
  } else {
    const err = await response.json();

    if (err.error?.includes("PNR and Seat combination")) {
      pnrError.textContent = err.error;
      pnrError.classList.remove('hidden');
    } else if (err.error?.includes("already assigned")) {
      pnralreadyUseError.textContent = err.error;
      pnralreadyUseError.classList.remove('hidden');
    } else {
      alert("Failed to update profile.");
    }
  }
});

// Load user info
(async () => {
  const email = localStorage.getItem('userEmail');
  if (!email) {
    alert("Not logged in!");
    window.location.href = "login.html";
    return;
  }

  const response = await fetch(`http://localhost:3000/api/user-info?email=${encodeURIComponent(email)}`);
  const result = await response.json();

  if (result.success) {
    const user = result.user;
    nameInput.value = user.NAME || '-';
    emailInput.value = user.EMAIL || '-';
    contactInput.value = user.CONTACT || '-';
    genderInput.value = user.GENDER || '-';
    addressInput.value = user.ADDRESS || '-';
    pnrInput.value = user.PNR || '-';
    seatInput.value = user.SEAT || '-';
    expiryInput.value = user.EXPIRY ? user.EXPIRY.split('T')[0] : '';
    expiryInput.dataset.original = expiryInput.value;
    console.log(user.ROLE + JSON.stringify(result.user));
      // 🟨 Hide PNR-related fields if user is admin\
      console.log("Raw EXPIRY from backend:", user.EXPIRY);
      if (user.EXPIRY) {
        const parts = user.EXPIRY.split(' ')[0].split('-'); // ["11", "06", "2025"]
        if (parts.length === 3) {
          const [day, month, year] = parts;
          expiryInput.value = `${year}-${month}-${day}`; // "2025-06-11"
        } else {
          expiryInput.value = '';
        }
      } else {
        expiryInput.value = '';
      }
      expiryInput.dataset.original = expiryInput.value;
  if (user.ROLE && user.ROLE.toLowerCase() === 'admin') {
    document.getElementById('pnr').closest('div').style.display = 'none';
    document.getElementById('seat').closest('div').style.display = 'none';
    document.getElementById('expiry').closest('div').style.display = 'none';
  }

    const today = new Date().toISOString().split('T')[0];
    if (expiryInput.value < today && user.ROLE && user.ROLE.toLowerCase() !== 'admin') {
      expiredMessage.textContent = "⚠️ Your PNR number has expired or Blank. You cannot place orders. Please update your profile with an active PNR to continue.";
      expiredMessage.classList.remove('hidden');
      flightBtn.disabled = true;
      flightBtn.classList.add('gray-out');
    }
    if (expiryInput.value > today || user.ROLE.toLowerCase() === 'admin') {
        expiredMessage.classList.add('hidden');
       flightBtn.disabled = false;
       flightBtn.classList.remove('gray-out');
      }
  } else {
    alert(result.message || "Unable to fetch user info.");
  }
})();
