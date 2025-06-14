const signupForm = document.getElementById('signupForm');
const contactField = document.getElementById('signupContact');
const signupRole = document.getElementById('signupRole');
const adminFields = document.getElementById('adminFields');
const passengerFields = document.getElementById('passengerFields'); // New block for passenger
const employeeIdInput = document.getElementById('employeeId');
const empIdError = document.getElementById('empIdError');
const workEmailInput = document.getElementById('workEmail');
const passkeyInput = document.getElementById('passkey');
const signupMessage = document.getElementById('signupMessage');
const pnrInput = document.getElementById('pnrNumber');         // new
const seatInput = document.getElementById('seatNumber');       // new

// Allow only numbers and '+' in contact
if (contactField) {
  contactField.addEventListener('input', function () {
    let value = this.value.replace(/[^0-9+]/g, '');
    if (value.includes('+')) {
      value = '+' + value.replace(/\+/g, '');
    }
    this.value = value;
  });
}

// Show/hide fields based on role selection
if (signupRole) {
  signupRole.addEventListener('change', function () {
    if (this.value === 'Admin') {
      adminFields.style.display = 'block';
      passengerFields.style.display = 'none';
      empIdError.style.display = 'none';
    } else if (this.value === 'Passenger') {
      adminFields.style.display = 'none';
      passengerFields.style.display = 'block';
    } else {
      adminFields.style.display = 'none';
      passengerFields.style.display = 'none';
      empIdError.style.display = 'none';
    }
  });
}

signupForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const role = signupRole.value;
  const contact = contactField?.value.trim() || '';
  const gender = document.getElementById('signupGender').value;
  const address = document.getElementById('signupAddress').value;
  const employeeId = employeeIdInput?.value.trim();
  const workEmail = workEmailInput?.value.trim();
  const passkey = passkeyInput?.value.trim();
  const pnrNumber = pnrInput?.value.trim();
  const seatNumber = seatInput?.value.trim();

  if (!email || !password || !name) {
    signupMessage.textContent = "Name, email, and password are required.";
    signupMessage.style.color = "red";
    signupMessage.classList.remove('hidden');
    return;
  }

  // Admin-specific validation
  if (role === 'Admin') {
    if (!employeeId || !/^EMP\d{4}$/.test(employeeId)) {
      empIdError.textContent = "Invalid Employee ID (format: EMP1234)";
      empIdError.style.display = 'block';
      return;
    } else {
      empIdError.style.display = 'none';
    }

    if (!workEmail || !passkey) {
      signupMessage.textContent = "Admin work email and passkey are required.";
      signupMessage.style.color = "red";
      signupMessage.classList.remove('hidden');
      return;
    }
  }

  // Passenger-specific validation
  if (role === 'Passenger') {
    if (!pnrNumber || !seatNumber) {
      signupMessage.textContent = "PNR number and seat number are required.";
      signupMessage.style.color = "red";
      signupMessage.classList.remove('hidden');
      return;
    }
  }

  const payload = { name, email, password, role, contact, gender, address };
  console.log('role '+role);
  if (role === 'Admin') {
    payload.employeeId = employeeId;
    payload.workEmail = workEmail;
    payload.passkey = passkey;
  }
  console.log('payload admin '+JSON.stringify(payload));
  if (role === 'Passenger') {
    payload.pnrNumber = pnrNumber;
    payload.seatNumber = seatNumber;
  }
  try {
    console.log('payload '+JSON.stringify(payload));
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      signupMessage.textContent = result.message || "Signup successful! Redirecting to login...";
      signupMessage.style.color = "green";
      signupMessage.classList.remove('hidden');

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      signupMessage.textContent = result.message || "Signup failed.";
      signupMessage.style.color = "red";
      signupMessage.classList.remove('hidden');
    }

  } catch (error) {
    signupMessage.textContent = "Error connecting to server.";
    signupMessage.style.color = "red";
    signupMessage.classList.remove('hidden');
    console.error('Signup error:', error);
  }
});
