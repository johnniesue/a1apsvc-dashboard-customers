let customers = JSON.parse(localStorage.getItem("customers") || "[]");
let editingIndex = null;

function renderTable() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";
  customers.forEach((c, i) => {
    const tr = document.createElement("tr");
    const link = `<a class="address-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}" target="_blank">${c.address}</a>`;
    tr.innerHTML = `
      <td>${c.first}</td><td>${c.last}</td><td>${c.company}</td>
      <td>${link}</td><td>${c.mobile}</td><td>${c.home}</td><td>${c.work}</td>
      <td>${c.email}</td><td>${c.type}</td><td>${c.source}</td><td>${c.notes}</td>
      <td>
        <button onclick="editCustomer(${i})">Edit</button>
        <button onclick="deleteCustomer(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getFormData() {
  return {
    first: document.getElementById("firstName").value,
    last: document.getElementById("lastName").value,
    company: document.getElementById("company").value,
    address: document.getElementById("address").value,
    mobile: document.getElementById("mobilePhone").value,
    home: document.getElementById("homePhone").value,
    work: document.getElementById("workPhone").value,
    email: document.getElementById("email").value,
    type: document.getElementById("type").value,
    source: document.getElementById("source").value,
    notes: document.getElementById("notes").value,
  };
}

function fillForm(data) {
  document.getElementById("firstName").value = data.first;
  document.getElementById("lastName").value = data.last;
  document.getElementById("company").value = data.company;
  document.getElementById("address").value = data.address;
  document.getElementById("mobilePhone").value = data.mobile;
  document.getElementById("homePhone").value = data.home;
  document.getElementById("workPhone").value = data.work;
  document.getElementById("email").value = data.email;
  document.getElementById("type").value = data.type;
  document.getElementById("source").value = data.source;
  document.getElementById("notes").value = data.notes;
}

function saveCustomer() {
  const data = getFormData();
  if (editingIndex !== null) {
    customers[editingIndex] = data;
    editingIndex = null;
  } else {
    customers.push(data);
  }
  localStorage.setItem("customers", JSON.stringify(customers));
  renderTable();
}

function deleteCustomer(i) {
  customers.splice(i, 1);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderTable();
}

function editCustomer(i) {
  fillForm(customers[i]);
  editingIndex = i;
}

function exportCustomers() {
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importCustomers() {
  const file = document.getElementById("importFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    customers = JSON.parse(e.target.result);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderTable();
  };
  reader.readAsText(file);
}

renderTable();
