
let customers = JSON.parse(localStorage.getItem("customers") || "[]");
let editingIndex = null;

function renderTable() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";
  customers.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = \`
      <td>\${c.firstName}</td><td>\${c.lastName}</td><td>\${c.company}</td>
      <td><a href="https://maps.google.com/?q=\${encodeURIComponent(c.address)}" target="_blank">\${c.address}</a></td>
      <td>\${c.mobile}</td><td>\${c.home}</td><td>\${c.work}</td>
      <td>\${c.email}</td><td>\${c.type}</td><td>\${c.source}</td><td>\${c.notes}</td>
      <td>
        <button onclick="editCustomer(\${i})">Edit</button>
        <button onclick="deleteCustomer(\${i})">Delete</button>
      </td>
    \`;
    tbody.appendChild(row);
  });
}

function saveCustomer() {
  const get = id => document.getElementById(id).value;
  const newCustomer = {
    firstName: get("firstName"), lastName: get("lastName"), company: get("company"),
    address: get("address"), mobile: get("mobile"), home: get("home"), work: get("work"),
    email: get("email"), type: get("type"), source: get("source"), notes: get("notes")
  };

  if (editingIndex !== null) {
    customers[editingIndex] = newCustomer;
    editingIndex = null;
  } else {
    customers.push(newCustomer);
  }

  localStorage.setItem("customers", JSON.stringify(customers));
  renderTable();
  document.querySelectorAll('.form-row input').forEach(input => input.value = "");
}

function deleteCustomer(index) {
  if (confirm("Delete this customer?")) {
    customers.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderTable();
  }
}

function editCustomer(index) {
  const c = customers[index];
  for (let key in c) {
    const field = document.getElementById(key);
    if (field) field.value = c[key];
  }
  editingIndex = index;
}

function exportCustomers() {
  const data = JSON.stringify(customers, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
}

function importCustomers() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
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
