// Script for Confirmation Page (confirmation.js)
document.addEventListener('DOMContentLoaded', () => {
    const orderSummary = document.querySelector('.order-summary');
    const confirmationTotal = document.querySelector('.confirmation-total');

    // Get the current order from localStorage
    let order = JSON.parse(localStorage.getItem('currentOrder')) || [];
    let total = 0;

    // Displaying each item in the order summary
    order.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1); 
        total += itemTotal;
        const orderItem = document.createElement('li');
        orderItem.innerHTML = `
            <span>${item.name} x ${(item.quantity || 1)}</span>
            <span>$${itemTotal.toFixed(2)}</span>
        `;
        orderSummary.appendChild(orderItem);
    });

    // Display total amount
    confirmationTotal.innerText = `${total.toFixed(2)}`;

    // Save Order History
    if (order.length > 0) {
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.push({ 
            items: order, 
            total: total.toFixed(2), 
            date: new Date().toLocaleString() 
        });
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }

    // Clear current order after saving
    localStorage.removeItem('currentOrder');
});
 /// Create Profile Icon UI
 const header = document.createElement('div');
 header.className = 'profile-container';
 header.innerHTML = `
     <div class="profile-dropdown" style="position:relative;">
         <span class="profile-icon" id="profileIcon" style="cursor:pointer;">
             <img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjY2NjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48cGF0aCBkPSJNMTIgMTBjLTMuMzEgMC02IDMuMTMtNiA2aDEyYzAtMi44Ny0yLjY5LTYtNi02eiIvPjwvc3ZnPg==" 
                  alt="Profile" style="width:50px; height:50px; border-radius:50%;">
         </span>
         <div class="dropdown-menu" id="dropdownMenu" 
              style="display:none; position:absolute; right:0; top:40px; background:#fff; box-shadow:0 2px 6px rgba(0,0,0,0.2); border-radius:6px; overflow:hidden; z-index:1000;">
             <a href="#" id="personalInfo" style="display:block; padding:10px; text-decoration:none; color:#333;">Personal Information</a>
             <a href="#" id="logoutBtn" style="display:block; padding:10px; text-decoration:none; color:#333;">Logout</a>
         </div>
     </div>
 `;
 document.body.appendChild(header);
 
 
     // Style header positioning
     header.style.position = 'fixed';
     header.style.top = '10px';
     header.style.right = '20px';
     header.style.zIndex = '1000';
 
     // Toggle dropdown menu
     const profileIcon = document.getElementById('profileIcon');
     const dropdownMenu = document.getElementById('dropdownMenu');
     profileIcon.addEventListener('click', () => {
         dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
     });
     // Redirect to personal info page
     document.getElementById('personalInfo').addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = 'personal-info.html';  // 🔁 Redirect to your page
        });
    
     // Logout functionality
     document.getElementById('logoutBtn').addEventListener('click', () => {
         localStorage.clear();
         window.location.href = 'login.html';
     });
 
     // Personal Info display
     document.getElementById('personalInfo').addEventListener('click', () => {
         const name = localStorage.getItem('userName') || 'Unknown';
         const role = localStorage.getItem('userRole') || 'User';
         const email = localStorage.getItem('userEmail') || 'N/A';
         const contact = localStorage.getItem('userContact') || 'N/A';
         const address = localStorage.getItem('userAddress') || 'N/A';
         //alert(`Name: ${name}\nRole: ${role}\nEmail: ${email}\nContact: ${contact}\nAddress: ${address}`);
         dropdownMenu.style.display = 'none';
     });
 
     // Close dropdown when clicking outside
     document.addEventListener('click', (e) => {
         if (!e.target.closest('.profile-dropdown')) {
             dropdownMenu.style.display = 'none';
         }
     });
 
