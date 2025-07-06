
let editingIndex = -1;

function saveCustomer() {
    const customer = {
        first: document.getElementById("first").value,
        last: document.getElementById("last").value,
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

    let customers = JSON.parse(localStorage.getItem("customers") || "[]");

    if (editingIndex >= 0) {
        customers[editingIndex] = customer;
        editingIndex = -1;
    } else {
        customers.push(customer);
    }

    localStorage.setItem("customers", JSON.stringify(customers));
    loadCustomers();
    clearForm();
}

function loadCustomers() {
    const tbody = document.querySelector("#customerTable tbody");
    tbody.innerHTML = "";
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    customers.forEach((c, i) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${c.first}</td><td>${c.last}</td><td>${c.company}</td><td><a href="https://maps.google.com/?q=${encodeURIComponent(c.address)}" target="_blank">${c.address}</a></td>
            <td>${c.mobile}</td><td>${c.home}</td><td>${c.work}</td><td>${c.email}</td><td>${c.type}</td><td>${c.source}</td><td>${c.notes}</td>
            <td><button onclick="editCustomer(${i})">Edit</button><button onclick="deleteCustomer(${i})">Delete</button></td>
        `;
    });
}

function deleteCustomer(index) {
    let customers = JSON.parse(localStorage.getItem("customers") || "[]");
    customers.splice(index, 1);
    localStorage.setItem("customers", JSON.stringify(customers));
    loadCustomers();
}

function editCustomer(index) {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const c = customers[index];
    document.getElementById("first").value = c.first;
    document.getElementById("last").value = c.last;
    document.getElementById("company").value = c.company;
    document.getElementById("address").value = c.address;
    document.getElementById("mobile").value = c.mobile;
    document.getElementById("home").value = c.home;
    document.getElementById("work").value = c.work;
    document.getElementById("email").value = c.email;
    document.getElementById("type").value = c.type;
    document.getElementById("source").value = c.source;
    document.getElementById("notes").value = c.notes;
    editingIndex = index;
}

function clearForm() {
    document.querySelectorAll(".form input").forEach(input => input.value = "");
}

function exportCustomers() {
    const data = localStorage.getItem("customers");
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customers.json";
    a.click();
}

function importCustomers() {
    const input = document.getElementById("fileInput");
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem("customers", e.target.result);
        loadCustomers();
    };
    reader.readAsText(input.files[0]);
}

window.onload = loadCustomers;
