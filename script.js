
const form = document.getElementById("customerForm");
const tableBody = document.querySelector("#customerTable tbody");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");

  const customer = {
    id: id ? parseInt(id) : Date.now(),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address")
  };

  if (id) {
    customers = customers.map(c => c.id === customer.id ? customer : c);
  } else {
    customers.push(customer);
  }

  localStorage.setItem("customers", JSON.stringify(customers));
  form.reset();
  loadCustomers();
});

function loadCustomers() {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  tableBody.innerHTML = "";
  customers.forEach(customer => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${customer.name}</td>
      <td>${customer.phone}</td>
      <td>${customer.email}</td>
      <td>${customer.address}</td>
      <td>
        <button class="edit" onclick="editCustomer(${customer.id})">Edit</button>
        <button class="delete" onclick="deleteCustomer(${customer.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function editCustomer(id) {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const customer = customers.find(c => c.id === id);
  if (!customer) return;

  form.name.value = customer.name;
  form.phone.value = customer.phone;
  form.email.value = customer.email;
  form.address.value = customer.address;
  form.id.value = customer.id;
}

function deleteCustomer(id) {
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers = customers.filter(c => c.id !== id);
  localStorage.setItem("customers", JSON.stringify(customers));
  loadCustomers();
}

function exportCustomers() {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "customers.json";
  link.click();
}

function importCustomers(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        localStorage.setItem("customers", JSON.stringify(data));
        loadCustomers();
        alert("Customers imported successfully.");
      } else {
        alert("Invalid format: expected an array.");
      }
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export All Customers";
  exportBtn.style.marginTop = "10px";
  exportBtn.onclick = exportCustomers;

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = "application/json";
  importInput.style.marginLeft = "10px";
  importInput.onchange = importCustomers;

  const container = document.createElement("div");
  container.style.marginTop = "20px";
  container.appendChild(exportBtn);
  container.appendChild(importInput);

  document.querySelector(".main").appendChild(container);
});
