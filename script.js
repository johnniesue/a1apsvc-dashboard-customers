
let customers = JSON.parse(localStorage.getItem('a1_customers')) || [];
let editingIndex = null;

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

  if (editingIndex !== null) {
    customers[editingIndex] = customer;
    editingIndex = null;
  } else {
    customers.push(customer);
  }

  localStorage.setItem('a1_customers', JSON.stringify(customers));
  renderTable();
  document.querySelectorAll('.form input').forEach(input => input.value = '');
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
      <td>
        <button onclick="editCustomer(${index})">Edit</button>
        <button onclick="deleteCustomer(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editCustomer(index) {
  const c = customers[index];
  document.getElementById('firstName').value = c.firstName;
  document.getElementById('lastName').value = c.lastName;
  document.getElementById('company').value = c.company;
  document.getElementById('address').value = c.address;
  document.getElementById('mobile').value = c.mobile;
  document.getElementById('home').value = c.home;
  document.getElementById('work').value = c.work;
  document.getElementById('email').value = c.email;
  document.getElementById('type').value = c.type;
  document.getElementById('source').value = c.source;
  document.getElementById('notes').value = c.notes;
  editingIndex = index;
}

function deleteCustomer(index) {
  customers.splice(index, 1);
  localStorage.setItem('a1_customers', JSON.stringify(customers));
  renderTable();
}

function exportCustomers() {
  const blob = new Blob([JSON.stringify(customers)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importCustomers() {
  const fileInput = document.getElementById('importFile');
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      customers = JSON.parse(e.target.result);
      localStorage.setItem('a1_customers', JSON.stringify(customers));
      renderTable();
    } catch (err) {
      alert("Invalid JSON");
    }
  };
  reader.readAsText(fileInput.files[0]);
}

document.addEventListener("DOMContentLoaded", renderTable);
