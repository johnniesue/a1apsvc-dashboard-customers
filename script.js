let customers = JSON.parse(localStorage.getItem("customers")) || [];

function renderCustomers() {
  const tbody = document.getElementById("customerTableBody");
  tbody.innerHTML = "";
  customers.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = \`
      <td>\${c.firstName}</td><td>\${c.lastName}</td><td>\${c.company}</td>
      <td><a href="https://www.google.com/maps/search/\${encodeURIComponent(c.address)}" target="_blank">\${c.address}</a></td>
      <td>\${c.mobile}</td><td>\${c.home}</td><td>\${c.work}</td><td>\${c.email}</td>
      <td>\${c.type}</td><td>\${c.source}</td><td>\${c.notes}</td>
      <td>
        <button onclick="editCustomer(\${i})">Edit</button>
        <button onclick="deleteCustomer(\${i})">Delete</button>
      </td>
    \`;
    tbody.appendChild(row);
  });
}

function saveCustomer() {
  const c = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    company: document.getElementById("company").value,
    address: document.getElementById("address").value,
    mobile: document.getElementById("mobile").value,
    home: document.getElementById("home").value,
    work: document.getElementById("work").value,
    email: document.getElementById("email").value,
    type: document.getElementById("type").value,
    source: document.getElementById("source").value,
    notes: document.getElementById("notes").value
  };
  customers.push(c);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();
}

function deleteCustomer(index) {
  customers.splice(index, 1);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();
}

function editCustomer(index) {
  const c = customers[index];
  document.getElementById("firstName").value = c.firstName;
  document.getElementById("lastName").value = c.lastName;
  document.getElementById("company").value = c.company;
  document.getElementById("address").value = c.address;
  document.getElementById("mobile").value = c.mobile;
  document.getElementById("home").value = c.home;
  document.getElementById("work").value = c.work;
  document.getElementById("email").value = c.email;
  document.getElementById("type").value = c.type;
  document.getElementById("source").value = c.source;
  document.getElementById("notes").value = c.notes;
  customers.splice(index, 1);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();
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
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    customers = JSON.parse(reader.result);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomers();
  };
  reader.readAsText(file);
}

function searchCustomers() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("#customerTableBody tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchValue) ? "" : "none";
  });
}

renderCustomers();