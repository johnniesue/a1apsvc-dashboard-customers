
function showView(id) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

let customers = JSON.parse(localStorage.getItem('customers')) || [];

function saveCustomer() {
  const customer = {
    first: document.getElementById('firstName').value,
    last: document.getElementById('lastName').value,
    company: document.getElementById('company').value,
    address: document.getElementById('address').value,
    mobile: document.getElementById('mobile').value,
    home: document.getElementById('home').value,
    work: document.getElementById('work').value,
    email: document.getElementById('email').value,
    type: document.getElementById('type').value,
    source: document.getElementById('source').value,
    notes: document.getElementById('notes').value
  };
  customers.push(customer);
  localStorage.setItem('customers', JSON.stringify(customers));
  renderCustomers();
}

function renderCustomers() {
  const tbody = document.getElementById('customerTableBody');
  tbody.innerHTML = '';
  customers.forEach((c, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.first}</td><td>${c.last}</td><td>${c.company}</td>
      <td><a href="https://www.google.com/maps/search/${encodeURIComponent(c.address)}" target="_blank">${c.address}</a></td>
      <td>${c.mobile}</td><td>${c.home}</td><td>${c.work}</td>
      <td>${c.email}</td><td>${c.type}</td><td>${c.source}</td><td>${c.notes}</td>
      <td>
        <button onclick="editCustomer(${index})">Edit</button>
        <button onclick="deleteCustomer(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editCustomer(index) {
  const c = customers[index];
  document.getElementById('firstName').value = c.first;
  document.getElementById('lastName').value = c.last;
  document.getElementById('company').value = c.company;
  document.getElementById('address').value = c.address;
  document.getElementById('mobile').value = c.mobile;
  document.getElementById('home').value = c.home;
  document.getElementById('work').value = c.work;
  document.getElementById('email').value = c.email;
  document.getElementById('type').value = c.type;
  document.getElementById('source').value = c.source;
  document.getElementById('notes').value = c.notes;
  customers.splice(index, 1);
}

function deleteCustomer(index) {
  customers.splice(index, 1);
  localStorage.setItem('customers', JSON.stringify(customers));
  renderCustomers();
}

function importCustomers() {
  const file = document.getElementById('importFile').files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const imported = JSON.parse(e.target.result);
    customers = imported;
    localStorage.setItem('customers', JSON.stringify(customers));
    renderCustomers();
  };
  reader.readAsText(file);
}

function exportCustomers() {
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'customers.json';
  link.click();
}

window.onload = renderCustomers;
