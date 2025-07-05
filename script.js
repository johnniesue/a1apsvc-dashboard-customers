
const form = document.getElementById("customerForm");
const tableBody = document.querySelector("#customerTable tbody");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  let customers = JSON.parse(localStorage.getItem("customers") || "[]");

  const customer = {
    id: id ? parseInt(id) : Date.now(),
    firstName: formData.get("firstName") || "",
    lastName: formData.get("lastName") || "",
    company: formData.get("company") || "",
    address: formData.get("address") || "",
    mobile: formData.get("mobile") || "",
    home: formData.get("home") || "",
    work: formData.get("work") || "",
    email: formData.get("email") || "",
    type: formData.get("type") || "",
    source: formData.get("source") || "",
    notes: formData.get("notes") || ""
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
    const safeAddress = customer.address ? customer.address.replace(/"/g, '&quot;') : "";
    const mapLink = \`https://www.google.com/maps/search/\${encodeURIComponent(safeAddress)}\`;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>\${customer.firstName}</td>
      <td>\${customer.lastName}</td>
      <td>\${customer.company}</td>
      <td><a href="\${mapLink}" target="_blank" rel="noopener noreferrer">\${customer.address}</a></td>
      <td>\${customer.mobile}</td>
      <td>\${customer.home}</td>
      <td>\${customer.work}</td>
      <td>\${customer.email}</td>
      <td>\${customer.type}</td>
      <td>\${customer.source}</td>
      <td>\${customer.notes}</td>
      <td>
        <button class="edit" onclick="editCustomer(\${customer.id})">Edit</button>
        <button class="delete" onclick="deleteCustomer(\${customer.id})">Delete</button>
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

function exportCustomers() {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "customers.json";
  link.click();
}

document.addEventListener("DOMContentLoaded", loadCustomers);

function importCustomers(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid JSON format");
      localStorage.setItem("customers", JSON.stringify(data));
      loadCustomers();
      alert("Customer data imported successfully!");
    } catch (err) {
      alert("Failed to import customers: " + err.message);
    }
  };
  reader.readAsText(file);
}


document.addEventListener("DOMContentLoaded", () => {
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.style.marginTop = "10px";
  importInput.addEventListener("change", importCustomers);
  document.querySelector(".main").appendChild(importInput);
});
