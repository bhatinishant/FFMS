// Selectors
const addFlightBtn = document.getElementById('addFlightBtn');
const flightFormModal = document.getElementById('flightFormModal');
const flightForm = document.getElementById('flightForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const flightTableBody = document.getElementById('flightTableBody');

// Form fields
const flightNo = document.getElementById('flightNo');
const departure = document.getElementById('departure');
const arrival = document.getElementById('arrival');
const flightDate = document.getElementById('flightDate');
const flightTime = document.getElementById('flightTime');
const status = document.getElementById('status');

let flights = JSON.parse(localStorage.getItem('flights')) || [];
let editIndex = null;

// Functions
function openModal(isEdit = false) {
  flightForm.reset();
  flightFormModal.classList.remove('hidden');
  modalTitle.textContent = isEdit ? 'Edit Flight' : 'Add Flight';
}

function closeModal() {
  flightFormModal.classList.add('hidden');
  editIndex = null;
}

function renderFlights() {
  flightTableBody.innerHTML = '';

  flights.forEach((flight, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${flight.flightNo}</td>
      <td>${flight.departure}</td>
      <td>${flight.arrival}</td>
      <td>${flight.date}</td>
      <td>${flight.time}</td>
      <td>${flight.status}</td>
      <td>
        <button onclick="editFlight(${index})">Edit</button>
        <button onclick="deleteFlight(${index})" style="background-color:#dc3545;">Delete</button>
      </td>
    `;

    flightTableBody.appendChild(row);
  });
}

function saveFlightsToStorage() {
  localStorage.setItem('flights', JSON.stringify(flights));
}

function addFlight(e) {
  e.preventDefault();

  const newFlight = {
    flightNo: flightNo.value.trim(),
    departure: departure.value.trim(),
    arrival: arrival.value.trim(),
    date: flightDate.value,
    time: flightTime.value,
    status: status.value
  };

  if (editIndex !== null) {
    flights[editIndex] = newFlight;
  } else {
    flights.push(newFlight);
  }

  saveFlightsToStorage();
  renderFlights();
  closeModal();
}

function editFlight(index) {
  const flight = flights[index];
  flightNo.value = flight.flightNo;
  departure.value = flight.departure;
  arrival.value = flight.arrival;
  flightDate.value = flight.date;
  flightTime.value = flight.time;
  status.value = flight.status;

  editIndex = index;
  openModal(true);
}

function deleteFlight(index) {
  if (confirm("Are you sure you want to delete this flight?")) {
    flights.splice(index, 1);
    saveFlightsToStorage();
    renderFlights();
  }
}

// Event Listeners
addFlightBtn.addEventListener('click', () => openModal(false));
cancelBtn.addEventListener('click', closeModal);
flightForm.addEventListener('submit', addFlight);

// On page load
renderFlights();

// Make edit/delete accessible globally
window.editFlight = editFlight;
window.deleteFlight = deleteFlight;
