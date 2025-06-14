document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const flightNumber = params.get('flight');
    document.getElementById('flightNumber').textContent = flightNumber;

    let allMenuItem = [];

    const userRole = localStorage.getItem('userRole');
    const addMenuItemBtn = document.getElementById('addMenuItemBtn');
    const adminControls = document.getElementById('adminControls');

    // Show admin button and form if role is Admin
    if (userRole === 'Admin') {
        addMenuItemBtn.style.display = 'block';
    }

    // Handle floating + button toggle
    addMenuItemBtn.addEventListener('click', () => {
        if (adminControls.style.display === 'none') {
            adminControls.style.display = 'block';
            addMenuItemBtn.textContent = '×'; // Close icon
        } else {
            adminControls.style.display = 'none';
            addMenuItemBtn.textContent = '+'; // Plus icon
        }
    });
    fetch(`http://localhost:3000/api/menu/${flightNumber}`)
    .then(response => response.json())
    .then(data => {
        allMenuItem = data.menu;
        renderMenuList(data.menu);
    })
    .catch(error => {
        console.error('Error loading menu data:', error);
        const menuList = document.querySelector('.menu-list');
        menuList.innerHTML = "<li>Error loading menu. Please try again later.</li>";
    });
    function renderMenuList(menuItems) {
        console.log('menuItems '+JSON.stringify(menuItems));
        const menuList = document.querySelector('.menu-list');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        menuList.innerHTML = '';
    
        if (!menuItems.length) {
            menuList.innerHTML = "<li>No matching menu items found.</li>";
            return;
        }
    
        menuItems.forEach(item => {
            const existing = cart.find(c => c.name === item.FOOD_ITEM);
            const quantity = existing ? existing.quantity : 0;
    
            const menuItem = document.createElement('li');
            menuItem.innerHTML = `
                <div class="menu-item-row">
                    <div class="item-info">
                        <h3><span contenteditable="false" class="editable fooditem">${item.FOOD_ITEM}</span></h3>
                        <p><span contenteditable="false" class="editable price">price: $${item.PRICE.toFixed(2)}</span></p>
                    </div>
                    <div class="menu-actions">
                    ${localStorage.getItem('userRole') === 'Admin' ? `
                        <button class="edit-btn">Edit</button>
                        <button class="save-btn" style="display:none;">Save</button>
                        <button class="delete-btn">Delete</button> </div>
                    ` : ''}
                    <div class="cart-controls" data-name="${item.FOOD_ITEM}" data-price="${item.PRICE}">
                        ${quantity === 0 ? `
                            <button class="flight-btn add-item">Add</button>
                        ` : `
                            <div class="qty-wrapper">
                                <button class="flight-btn minus">-</button>
                                <span class="qty">${quantity}</span>
                                <button class="flight-btn plus">+</button>
                            </div>
                        `}
                    </div>
                </div>
            `; 
           
                    const fooditemIn = menuItem.querySelector('.fooditem').innerText.trim();
                    const editBtn = menuItem.querySelector('.edit-btn');
        const saveBtn = menuItem.querySelector('.save-btn');
        const deleteBtn = menuItem.querySelector('.delete-btn');

        editBtn?.addEventListener('click', () => {
            menuItem.querySelectorAll('.editable').forEach(el => el.contentEditable = "false");
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        });

        saveBtn?.addEventListener('click', async () => {
            const fooditemEl = menuItem.querySelector('.fooditem');
            const priceEl = menuItem.querySelector('.price');
            const priceText = priceEl.innerText.trim();
            const cleanedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

            const updatedMenu = {
                FOOD_ITEM: menuItem.querySelector('.fooditem').innerText.trim(),
                PRICE: cleanedPrice
            };
        
            // Validation: Check if any field is empty and highlight
            let hasEmptyField = false;
            [fooditemEl, priceEl].forEach(el => {
                if (!el.innerText.trim()) {
                    el.style.border = '2px solid red';
                    hasEmptyField = true;
                } else {
                    el.style.border = '';
                }
            });
        
            if (hasEmptyField) {
                alert("Missing required fields");
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/menu/${fooditemIn}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedMenu)
                });

                const result = await res.json();
                if (res.ok) {
                    alert('Menu updated successfully');
                    fooditemEl.contentEditable = 'false';
            priceEl.contentEditable = 'false';
            priceEl.innerText = `price: $${updatedMenu.PRICE.toFixed(2)}`;
            saveBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';
                } else {
                    alert(result.message || 'Update failed');
                }
            } catch (err) {
                alert('Server error during update');
                console.error(err);
            }
        });

        deleteBtn?.addEventListener('click', async () => {
            if (!confirm("Are you sure you want to delete this Menu Item?")) return;

            try {
                const res = await fetch(`http://localhost:3000/api/menu/${fooditemIn}`, {
                    method: 'DELETE'
                });

                const result = await res.json();
                if (res.ok) {
                    alert('Item deleted');
                } else {
                    alert(result.message || 'Delete failed');
                }
            } catch (err) {
                alert('Server error during deletion');
                console.error(err);
            }
        });

                    menuList.appendChild(menuItem);
                });
            }
    // Add menu form submission
    const form = document.getElementById('addMenuForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const foodItem = document.getElementById('foodItem').value;
            const price = parseFloat(document.getElementById('price').value);

            if (!foodItem || isNaN(price)) return alert("Please enter valid food item and price");

            try {
                const res = await fetch('http://localhost:3000/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flightNumber, foodItem, price })
                });

                const result = await res.json();
                if (res.ok) {
                    alert("Menu item added successfully");
                    location.reload();
                } else {
                    alert(result.message || "Failed to add menu item");
                }
            } catch (err) {
                console.error('Error adding menu item:', err);
                alert("Server error while adding menu item");
            }
        });
    }

    // Search box
const searchBox = document.getElementById('searchBox');
if (searchBox) {
    searchBox.addEventListener('input', () => {
        const term = searchBox.value.toLowerCase();
        const filtered = allMenuItem.filter(f =>
            f.FOOD_ITEM.toLowerCase().includes(term)
        );
        renderMenuList(filtered);
    });
}
    
});

// Cart logic
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-item')) {
        const parent = e.target.closest('.cart-controls');
        const name = parent.dataset.name;
        const price = parseFloat(parent.dataset.price);
        updateCart(name, price, 1, parent);
    }

    if (e.target.classList.contains('plus')) {
        const parent = e.target.closest('.cart-controls');
        const name = parent.dataset.name;
        const price = parseFloat(parent.dataset.price);
        updateCart(name, price, 1, parent);
    }

    if (e.target.classList.contains('minus')) {
        const parent = e.target.closest('.cart-controls');
        const name = parent.dataset.name;
        const price = parseFloat(parent.dataset.price);
        updateCart(name, price, -1, parent);
    }
});

function updateCart(name, price, change, parent) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let item = cart.find(i => i.name === name);

    if (!item && change > 0) {
        item = { name, price, quantity: 0 };
        cart.push(item);
    }

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderControls(parent, item ? item.quantity : 0);
}

function renderControls(parent, quantity) {
    if (quantity <= 0) {
        parent.innerHTML = `<button class="flight-btn add-item">Add</button>`;
    } else {
        parent.innerHTML = `
            <div class="qty-wrapper">
                <button class="flight-btn minus">-</button>
                <span class="qty">${quantity}</span>
                <button class="flight-btn plus">+</button>
            </div>
        `;
    }
}

function goToCart() {
    const flightNumber = new URLSearchParams(window.location.search).get('flight');
    window.location.href = `cart.html?flight=${flightNumber}`;
}

// Edit & Delete Event Listeners

document.addEventListener('click', async (e) => {
    // Existing cart logic
    //...

    // Delete item
    if (e.target.classList.contains('delete-item')) {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this menu item?")) {
            try {
                const res = await fetch(`http://localhost:3000/api/menu/${id}`, {
                    method: 'DELETE'
                });
                const result = await res.json();
                if (res.ok) {
                    alert("Menu item deleted successfully");
                    location.reload();
                } else {
                    alert(result.message || "Failed to delete item");
                }
            } catch (err) {
                console.error('Error deleting menu item:', err);
                alert("Server error while deleting menu item");
            }
        }
    }

    // Edit item
    if (e.target.classList.contains('edit-item')) {
        const id = e.target.dataset.id;
        const foodItem = prompt("Enter new food item name:");
        const price = prompt("Enter new price:");
        if (foodItem && price && !isNaN(parseFloat(price))) {
            try {
                const res = await fetch(`http://localhost:3000/api/menu/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ foodItem, price: parseFloat(price) })
                });
                const result = await res.json();
                if (res.ok) {
                    alert("Menu item updated successfully");
                    location.reload();
                } else {
                    alert(result.message || "Failed to update item");
                }
            } catch (err) {
                console.error('Error updating menu item:', err);
                alert("Server error while updating menu item");
            }
        } else {
            alert("Invalid input for edit");
        }
    }
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
            <a href="#" id="orderHistory" style="display:block; padding:10px; text-decoration:none; color:#333;">Order History</a>
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

    //Order History
    document.getElementById('orderHistory').addEventListener('click', () => {
        window.location.href = 'history.html';
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
