// Script for Cart Page (cart.js)
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-price');
    const checkoutBtn = document.getElementById('checkout');
    const paymentSelect = document.getElementById('paymentMethod');
    
    const params = new URLSearchParams(window.location.search);
    const flightNumber = params.get('flight');

    // Function to Update Cart Display
    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * (item.quantity || 1); 
            total += itemTotal;
            const cartItem = document.createElement('li');
            cartItem.innerHTML = `
                <span>${item.name} x ${(item.quantity || 1)}</span>
                <span>$${itemTotal.toFixed(2)}</span>
                <button class="flight-btn red-clr" onclick="removeFromCart(${index})">Remove</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        totalAmount.innerText = `$${total.toFixed(2)}`;

        // Disable checkout if cart is empty
        if (cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('disabled');
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('disabled');
        }
    }

    // Handle back to menu button
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    if (flightNumber && backToMenuBtn) {
        backToMenuBtn.onclick = () => {
            window.location.href = `menu.html?flight=${flightNumber}`;
        };
    } else if (backToMenuBtn) {
        backToMenuBtn.onclick = () => {
            alert("Flight number not found. Redirecting to flights list.");
            window.location.href = 'index.html';
        };
    }

    // Remove Item from Cart
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    };

    // Show Popup Message
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerText = message;
        document.body.appendChild(popup);

        setTimeout(() => popup.classList.add('show'), 100);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 3000);
    }

    // Checkout Button Event
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        document.getElementById('confirmationModal').classList.add('show');
    });

    // Confirm Order Button Event
    document.getElementById('confirmOrder').addEventListener('click', async () => {
        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }
    
        const userEmail = localStorage.getItem('userEmail') || 'guest@example.com';
        const flightNumber = new URLSearchParams(window.location.search).get('flight');
        const orderId = `ORD-${Date.now()}`; // Already done correctly
        try {
            const res = await fetch('http://localhost:3000/api/order-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    userEmail,
                    flightNumber,
                    cart,
                    paymentMethod
                })
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                alert("Failed to store order: " + errorData.message);
                return;
            }
    
            // Continue existing logic
            localStorage.setItem('currentOrder', JSON.stringify(cart));
            localStorage.removeItem('cart');
            cart = [];
            updateCart();
            document.getElementById('confirmationModal').classList.remove('show');
            showPopup('Order confirmed!');
    
            setTimeout(() => {
                window.location.href = 'confirmation.html';
            }, 1000);
        } catch (err) {
            console.error('Error confirming order:', err);
            alert("Failed to place order");
        }
    });
    

    // Cancel Order Button Event
    document.getElementById('cancelOrder').addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.remove('show');
    });

    updateCart();
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

