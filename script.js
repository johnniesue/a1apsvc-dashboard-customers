
const form = document.getElementById("customerForm");
const tableBody = document.querySelector("#customerTable tbody");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const customer = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    id: Date.now()
  };
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers.push(customer);
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
      <td><button class="delete" onclick="deleteCustomer(${customer.id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function deleteCustomer(id) {
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers = customers.filter(c => c.id !== id);
  localStorage.setItem("customers", JSON.stringify(customers));
  loadCustomers();
}

document.addEventListener("DOMContentLoaded", loadCustomers);
