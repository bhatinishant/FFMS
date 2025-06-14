document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    let allFlights = [];

    if (userRole === 'Admin') {
        setupAdminUI();
    }

    function setupAdminUI() {
        if (document.getElementById('addFlightBtn')) return;

        const flightsSection = document.querySelector('.flights');

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'addFlightBtn';
        toggleBtn.innerHTML = '+';
        toggleBtn.title = 'Add Flight';
        toggleBtn.style.cssText = `
            position: absolute;
            top: 113px;
            right: 30px;
            font-size: 24px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const form = document.createElement('form');
        form.id = 'addFlightForm';
        form.classList.add('hidden');
        form.style.cssText = `
            display: none;
            background-color: #f9f9f9;
            border: 1px solid #ccc;
            padding: 20px;
            margin-top: 113px ;
            border-radius: 8px;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
            flex-direction: column;
            gap: 10px;
        `;

        form.innerHTML = `
            <input type="text" id="airline" placeholder="Airline" required style="padding: 10px;">
            <input type="text" id="flightNumber" placeholder="Flight Number" required style="padding: 10px;">
            <input type="text" id="departure" placeholder="Departure" required style="padding: 10px;">
            <input type="text" id="arrival" placeholder="Arrival" required style="padding: 10px;">
            <button type="submit" style="
                padding: 10px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Add Flight</button>
        `;

        flightsSection.style.position = 'relative';
        flightsSection.prepend(form);
        flightsSection.prepend(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const isHidden = form.style.display === 'none';
            form.style.display = isHidden ? 'flex' : 'none';
            toggleBtn.innerHTML = isHidden ? '−' : '+';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const airline = document.getElementById('airline').value;
            const flightNumber = document.getElementById('flightNumber').value;
            const departure = document.getElementById('departure').value;
            const arrival = document.getElementById('arrival').value;

            try {
                const res = await fetch('http://localhost:3000/api/flights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ airline, flightNumber, departure, arrival })
                });

                const result = await res.json();
                if (res.ok) {
                    alert('Flight added successfully');
                    form.reset();
                    form.style.display = 'none';
                    toggleBtn.innerHTML = '+';
                    allFlights.push({ AIRLINE: airline, FLIGHT_NUMBER: flightNumber, DEPARTURE: departure, ARRIVAL: arrival });
                    displayFlights(allFlights);
                } else {
                    alert(result.message || 'Failed to add flight');
                }
            } catch (err) {
                console.error('Server error:', err);
                alert('Server error occurred.');
            }
        });
    }

    // Fetch flights
    fetch('http://localhost:3000/api/flights')
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch flights");
            return res.json();
        })
        .then(data => {
            allFlights = data.flights;
            displayFlights(allFlights);
        })
        .catch(err => {
            console.error("Fetch error:", err);
        });

    // Display Flights
    function displayFlights(flights) {
        const flightList = document.querySelector('.flight-list');
        flightList.innerHTML = '';

        flights.forEach((flight, index) => {
            const flightItem = document.createElement('li');
            flightItem.innerHTML = `
                <div style="flex:1;">
                    <h3 contenteditable="false" class="editable airline">${flight.AIRLINE}</h3>
                    <p>
                        Flight No: <span contenteditable="false" class="editable flight">${flight.FLIGHT_NUMBER}</span> |
                        Departure: <span contenteditable="false" class="editable departure">${flight.DEPARTURE}</span> |
                        Arrival: <span contenteditable="false" class="editable arrival">${flight.ARRIVAL}</span>
                    </p>
                </div>
                <div class="flight-actions">
                <button onclick="window.location.href='menu.html?flight=${flight.FLIGHT_NUMBER}'">Order Food</button>
                ${userRole === 'Admin' ? `
                    <button class="edit-btn">Edit</button>
                    <button class="save-btn" style="display:none;">Save</button>
                    <button class="delete-btn">Delete</button> </div>
                ` : ''}
            `;

            const editBtn = flightItem.querySelector('.edit-btn');
            const saveBtn = flightItem.querySelector('.save-btn');
            const deleteBtn = flightItem.querySelector('.delete-btn');

            editBtn?.addEventListener('click', () => {
                flightItem.querySelectorAll('.editable').forEach(el => el.contentEditable = "true");
                editBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';
            });

            saveBtn?.addEventListener('click', async () => {
                const airlineEl = flightItem.querySelector('.airline');
                const flightNumberEl = flightItem.querySelector('.flight');
                const departureEl = flightItem.querySelector('.departure');
                const arrivalEl = flightItem.querySelector('.arrival');

                const updatedFlight = {
                    AIRLINE: flightItem.querySelector('.airline').innerText.trim(),
                    FLIGHT_NUMBER: flightItem.querySelector('.flight').innerText.trim(),
                    DEPARTURE: flightItem.querySelector('.departure').innerText.trim(),
                    ARRIVAL: flightItem.querySelector('.arrival').innerText.trim()
                };

                // Validation: Check if any field is empty and highlight
                let hasEmptyField = false;
                [airlineEl, flightNumberEl, departureEl, arrivalEl].forEach(el => {
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
                const originalFlightNumber = flight.FLIGHT_NUMBER;

                try {
                    const res = await fetch(`http://localhost:3000/api/flights/${flight.FLIGHT_NUMBER}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedFlight)
                    });

                    const result = await res.json();
                    if (res.ok) {
                        alert('Flight updated successfully');
                        allFlights[index] = updatedFlight;
                        displayFlights(allFlights);
                    } else {
                        alert(result.message || 'Update failed');
                    }
                } catch (err) {
                    alert('Server error during update');
                    console.error(err);
                }
            });

            deleteBtn?.addEventListener('click', async () => {
                if (!confirm("Are you sure you want to delete this flight?")) return;

                try {
                    const res = await fetch(`http://localhost:3000/api/flights/${flight.FLIGHT_NUMBER}`, {
                        method: 'DELETE'
                    });

                    const result = await res.json();
                    if (res.ok) {
                        alert('Flight deleted');
                        allFlights.splice(index, 1);
                        displayFlights(allFlights);
                    } else {
                        alert(result.message || 'Delete failed');
                    }
                } catch (err) {
                    alert('Server error during deletion');
                    console.error(err);
                }
            });

            flightList.appendChild(flightItem);
        });
    }

    // Search box
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', () => {
            const term = searchBox.value.toLowerCase();
            const filtered = allFlights.filter(f =>
                f.AIRLINE.toLowerCase().includes(term) ||
                f.FLIGHT_NUMBER.toLowerCase().includes(term) ||
                f.DEPARTURE.toLowerCase().includes(term) ||
                f.ARRIVAL.toLowerCase().includes(term)
            );
            displayFlights(filtered);
        });
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

