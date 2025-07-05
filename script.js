
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const tableBody = document.querySelector("#customerTable tbody");

let customers = JSON.parse(localStorage.getItem("customers") || "[]");

function saveCustomerList() {
  localStorage.setItem("customers", JSON.stringify(customers));
  renderTable();
}

function renderTable() {
  tableBody.innerHTML = "";
  customers.forEach((c, i) => {
    const row = document.createElement("tr");
    row.innerHTML = \`
      <td>\${c.firstName}</td><td>\${c.lastName}</td><td>\${c.company}</td>
      <td><a href="https://maps.google.com/?q=\${encodeURIComponent(c.address)}" target="_blank">\${c.address}</a></td>
      <td>\${c.mobile}</td><td>\${c.home}</td><td>\${c.work}</td><td>\${c.email}</td>
      <td>\${c.type}</td><td>\${c.source}</td><td>\${c.notes}</td>
      <td>
        <button onclick="editCustomer(\${i})">Edit</button>
        <button onclick="deleteCustomer(\${i})">Delete</button>
      </td>
    \`;
    tableBody.appendChild(row);
  });
}

function clearForm() {
  document.querySelectorAll(".form-container input").forEach(input => input.value = "");
}

saveBtn.onclick = () => {
  const customer = {
    firstName: document.querySelector('input[name="firstName"]').value.trim(),
    lastName: document.querySelector('input[name="lastName"]').value.trim(),
    company: document.querySelector('input[name="company"]').value.trim(),
    address: document.querySelector('input[name="address"]').value.trim(),
    mobile: document.querySelector('input[name="mobile"]').value.trim(),
    home: document.querySelector('input[name="home"]').value.trim(),
    work: document.querySelector('input[name="work"]').value.trim(),
    email: document.querySelector('input[name="email"]').value.trim(),
    type: document.querySelector('input[name="type"]').value.trim(),
    source: document.querySelector('input[name="source"]').value.trim(),
    notes: document.querySelector('input[name="notes"]').value.trim()
  };
  customers.push(customer);
  saveCustomerList();
  clearForm();
};

function deleteCustomer(index) {
  customers.splice(index, 1);
  saveCustomerList();
}

function editCustomer(index) {
  const c = customers[index];
  document.querySelector('input[name="firstName"]').value = c.firstName;
  document.querySelector('input[name="lastName"]').value = c.lastName;
  document.querySelector('input[name="company"]').value = c.company;
  document.querySelector('input[name="address"]').value = c.address;
  document.querySelector('input[name="mobile"]').value = c.mobile;
  document.querySelector('input[name="home"]').value = c.home;
  document.querySelector('input[name="work"]').value = c.work;
  document.querySelector('input[name="email"]').value = c.email;
  document.querySelector('input[name="type"]').value = c.type;
  document.querySelector('input[name="source"]').value = c.source;
  document.querySelector('input[name="notes"]').value = c.notes;
  customers.splice(index, 1);
}

exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
  URL.revokeObjectURL(url);
};

importBtn.onclick = () => importFile.click();
importFile.onchange = (e) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        customers = data;
        saveCustomerList();
      }
    } catch (err) {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(e.target.files[0]);
};

renderTable();
