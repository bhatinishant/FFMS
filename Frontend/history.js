document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.querySelector('.history-list');
    const noHistoryMsg = document.querySelector('.no-history');
    console.log('email '+localStorage.getItem('userEmail'))
    // Fetch order history
    fetch(`http://localhost:3000/api/order-history/${localStorage.getItem('userEmail')}`)
        .then(res => res.json())
        .then(data => {
            const history = data.history;
            console.log('history '+JSON.stringify(history));
            if (!history || history.length === 0) {
                historyList.innerHTML = '<li>No orders found. Start shopping now!</li>';
                return;
            }

            // Group orders by their unique identifier (e.g., flight number, order date, etc.)
            const orders = groupOrdersByHistory(history);
             console.log('orders '+ JSON.stringify(orders));
            // Display each order
            orders.forEach(order => {
                const item = document.createElement('li');
                item.classList.add('order-item');

                const flight = order.flight || 'N/A';
                const payment = order.payment || 'N/A';
                const orderDate = order.date ? new Date(order.date).toLocaleString() : 'N/A';
                const total = order.items.reduce((acc, item) => acc + item.totalPrice, 0);

                // Build HTML structure for each order
                item.innerHTML = `
                    <div class="order-header">
                        <h3> ${flight}</h3>
                        <span>Paid by: ${payment}</span>
                    </div>
                    <div class="order-details">
                        ${order.items.map(foodItem => `
                            <div>
                                <strong>${foodItem.foodName}</strong> x${foodItem.quantity} - $${foodItem.totalPrice.toFixed(2)}
                            </div>
                        `).join('')}
                        <div><strong>Total Price:</strong> $${total.toFixed(2)}</div>
                        <small>Order placed on: ${orderDate}</small>
                    </div>
                `;
                historyList.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading order history:', error);
            historyList.innerHTML = '<li>Error loading order history. Please try again later.</li>';
        });
});

// Helper function to group orders by their unique attributes
function groupOrdersByHistory(history) {
    const orders = [];

    // Iterate over each item in the history and group them by flight or order identifier
    history.forEach(order => {
        const existingOrder = orders.find(o => o.flight === order.ORDER_ID && o.date === order.ORDER_DATE);
        
        if (existingOrder) {
            // If order with same flight and date exists, push the current food item into the existing order
            existingOrder.items.push({
                foodName: order.FOOD_ITEM,
                quantity: order.QUANTITY,
                totalPrice: order.TOTAL_PRICE
            });
        } else {
            // Otherwise, create a new order object and add the food item
            orders.push({
                flight: order.ORDER_ID,
                payment: order.PAYMENT_METHOD,
                date: order.ORDER_DATE,
                items: [{
                    foodName: order.FOOD_ITEM,
                    quantity: order.QUANTITY,
                    totalPrice: order.TOTAL_PRICE
                }]
            });
        }
    });

    return orders;
}
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
 