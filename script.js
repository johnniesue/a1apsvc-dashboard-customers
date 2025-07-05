
const form = document.getElementById("customerForm");
const tableBody = document.querySelector("#customerTable tbody");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");

  const customer = {
    id: id ? parseInt(id) : Date.now(),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    address: formData.get("address"),
    mobile: formData.get("mobile"),
    home: formData.get("home"),
    work: formData.get("work"),
    email: formData.get("email"),
    type: formData.get("type"),
    source: formData.get("source"),
    notes: formData.get("notes")
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
      <td>${customer.firstName}</td>
      <td>${customer.lastName}</td>
      <td>${customer.company}</td>
      <td>${customer.address}</td>
      <td>${customer.mobile}</td>
      <td>${customer.home}</td>
      <td>${customer.work}</td>
      <td>${customer.email}</td>
      <td>${customer.type}</td>
      <td>${customer.source}</td>
      <td>${customer.notes}</td>
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

  form.firstName.value = customer.firstName;
  form.lastName.value = customer.lastName;
  form.company.value = customer.company;
  form.address.value = customer.address;
  form.mobile.value = customer.mobile;
  form.home.value = customer.home;
  form.work.value = customer.work;
  form.email.value = customer.email;
  form.type.value = customer.type;
  form.source.value = customer.source;
  form.notes.value = customer.notes;
  form.id.value = customer.id;
}

function deleteCustomer(id) {
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");
  customers = customers.filter(c => c.id !== id);
  localStorage.setItem("customers", JSON.stringify(customers));
  loadCustomers();
}

document.addEventListener("DOMContentLoaded", loadCustomers);
