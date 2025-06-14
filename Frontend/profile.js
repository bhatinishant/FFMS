const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const inputs = document.querySelectorAll('#profileForm input, #profileForm select');

editBtn.addEventListener('click', () => {
  inputs.forEach(input => input.disabled = false);
  saveBtn.classList.remove('hidden');
  editBtn.classList.add('hidden');
});

document.getElementById('profileForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  // For now, just log updated data
  const updatedData = {
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    mealType: document.getElementById('mealType').value
  };

  console.log("Profile updated:", updatedData);

  // Lock fields again
  inputs.forEach(input => input.disabled = true);
  saveBtn.classList.add('hidden');
  editBtn.classList.remove('hidden');

  // You can add localStorage or backend API call here
});
