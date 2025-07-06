
let customers = [];

function saveCustomer() {
  const customer = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    company: document.getElementById('company').value.trim(),
    address: document.getElementById('address').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    home: document.getElementById('home').value.trim(),
    work: document.getElementById('work').value.trim(),
    email: document.getElementById('email').value.trim(),
    type: document.getElementById('type').value.trim(),
    source: document.getElementById('source').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };
  customers.push(customer);
  localStorage.setItem('a1_customers', JSON.stringify(customers));
  renderTable();
}

function renderTable() {
  const tbody = document.querySelector('#customerTable tbody');
  tbody.innerHTML = '';
  customers.forEach((c, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.firstName}</td><td>${c.lastName}</td><td>${c.company}</td>
      <td><a href="https://maps.google.com/?q=${encodeURIComponent(c.address)}" target="_blank">${c.address}</a></td>
      <td>${c.mobile}</td><td>${c.home}</td><td>${c.work}</td><td>${c.email}</td>
      <td>${c.type}</td><td>${c.source}</td><td>${c.notes}</td>
      <td><button onclick="deleteCustomer(${index})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteCustomer(index) {
  customers.splice(index, 1);
  localStorage.setItem('a1_customers', JSON.stringify(customers));
  renderTable();
}

function exportCustomers() {
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'customers.json';
  a.click();
}

function importCustomers() {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      customers = JSON.parse(reader.result);
      localStorage.setItem('a1_customers', JSON.stringify(customers));
      renderTable();
    } catch (e) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
}

window.onload = function() {
  const stored = localStorage.getItem('a1_customers');
  if (stored) {
    customers = JSON.parse(stored);
    renderTable();
  }
};
