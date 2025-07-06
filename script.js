
const form = document.getElementById('customerForm');
const successMsg = document.getElementById('successMessage');
const tableBody = document.querySelector('#customersTable tbody');

// Replace with your own Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_WEBAPP_URL/exec';

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: data
  })
    .then(response => response.text())
    .then(result => {
      successMsg.style.display = 'block';
      form.reset();
      loadCustomers(); // Refresh table
    })
    .catch(error => console.error('Error!', error.message));
});

function loadCustomers() {
  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
      tableBody.innerHTML = '';
      data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
    });
}

function initMap() {
  const center = { lat: 33.0532, lng: -96.6608 }; // Default to Allen, TX
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center
  });
}
window.onload = loadCustomers;
