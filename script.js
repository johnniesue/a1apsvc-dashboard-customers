
let editIndex = null;

function saveCustomer() {
  const customer = {
    first: document.getElementById("firstName").value,
    last: document.getElementById("lastName").value,
    company: document.getElementById("company").value,
    address: document.getElementById("address").value,
    mobile: document.getElementById("mobile").value,
    home: document.getElementById("home").value,
    work: document.getElementById("work").value,
    email: document.getElementById("email").value,
    type: document.getElementById("type").value,
    source: document.getElementById("source").value,
    notes: document.getElementById("notes").value,
  };

  const customers = JSON.parse(localStorage.getItem("customers") || "[]");

  if (editIndex !== null) {
    customers[editIndex] = customer;
    editIndex = null;
  } else {
    customers.push(customer);
  }

  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();
  clearForm();
}

function renderCustomers() {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const table = document.getElementById("customerList");
  table.innerHTML = "";
  customers.forEach((c, index) => {
    const row = document.createElement("tr");
    row.innerHTML = \`
      <td>\${c.first}</td>
      <td>\${c.last}</td>
      <td>\${c.company}</td>
      <td><a href="https://www.google.com/maps/search/\${encodeURIComponent(c.address)}" target="_blank">\${c.address}</a></td>
      <td>\${c.mobile}</td>
      <td>\${c.home}</td>
      <td>\${c.work}</td>
      <td>\${c.email}</td>
      <td>\${c.type}</td>
      <td>\${c.source}</td>
      <td>\${c.notes}</td>
      <td>
        <button onclick="editCustomer(\${index})">Edit</button>
        <button onclick="deleteCustomer(\${index})">Delete</button>
      </td>
    \`;
    table.appendChild(row);
  });
}

function deleteCustomer(index) {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers.splice(index, 1);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();
}

function editCustomer(index) {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const c = customers[index];
  document.getElementById("firstName").value = c.first;
  document.getElementById("lastName").value = c.last;
  document.getElementById("company").value = c.company;
  document.getElementById("address").value = c.address;
  document.getElementById("mobile").value = c.mobile;
  document.getElementById("home").value = c.home;
  document.getElementById("work").value = c.work;
  document.getElementById("email").value = c.email;
  document.getElementById("type").value = c.type;
  document.getElementById("source").value = c.source;
  document.getElementById("notes").value = c.notes;
  editIndex = index;
}

function clearForm() {
  document.querySelectorAll(".form-row input").forEach(input => input.value = "");
}

function exportCustomers() {
  const data = localStorage.getItem("customers");
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
}

function importCustomers() {
  const file = document.getElementById("importFile").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const customers = JSON.parse(reader.result);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomers();
  };
  reader.readAsText(file);
}

function showView(view) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  document.getElementById(view).style.display = "block";
  document.getElementById("viewTitle").innerText =
    view.charAt(0).toUpperCase() + view.slice(1) + " Dashboard";
}

renderCustomers();
