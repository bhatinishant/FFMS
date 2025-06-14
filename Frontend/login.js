document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const loginError = document.getElementById('loginError');

  // ✅ Always hide error at the start
  loginError.classList.add('hidden');

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', errorText);
      loginError.textContent = "Invalid email or password";
      loginError.classList.remove('hidden');  // Show only on actual error
      return;
    }

    const data = await response.json();
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('userName', data.name);
    console.log('data.red '+  data.redirectPage)
    // ✅ Login successful — redirect
    console.log('data.role'+ data.role.toLowerCase());
    if (data.role && data.role.toLowerCase() !== 'admin') {
      window.location.href = data.redirectPage;
    }else {
      window.location.href = 'index.html';
    }
    

  } catch (err) {
    console.error('Login error:', err);
    loginError.textContent = "Error connecting to server.";
    loginError.classList.remove('hidden');
  }
});
