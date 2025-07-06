
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let editIndex = -1;

function saveCustomer() {
    const customer = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        company: document.getElementById('company').value,
        address: document.getElementById('address').value,
        mobile: document.getElementById('mobile').value,
        home: document.getElementById('home').value,
        work: document.getElementById('work').value,
        email: document.getElementById('email').value,
        type: document.getElementById('type').value,
        source: document.getElementById('source').value,
        notes: document.getElementById('notes').value
    };
    if (editIndex > -1) {
        customers[editIndex] = customer;
        editIndex = -1;
    } else {
        customers.push(customer);
    }
    localStorage.setItem('customers', JSON.stringify(customers));
    renderCustomers();
    clearForm();
}

function renderCustomers() {
    const table = document.getElementById('customerTable');
    table.innerHTML = '';
    customers.forEach((cust, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cust.firstName}</td>
            <td>${cust.lastName}</td>
            <td>${cust.company}</td>
            <td><a href="https://maps.google.com/?q=${encodeURIComponent(cust.address)}" target="_blank">${cust.address}</a></td>
            <td>${cust.mobile}</td>
            <td>${cust.home}</td>
            <td>${cust.work}</td>
            <td>${cust.email}</td>
            <td>${cust.type}</td>
            <td>${cust.source}</td>
            <td>${cust.notes}</td>
            <td>
                <button onclick="editCustomer(${index})">Edit</button>
                <button onclick="deleteCustomer(${index})">Delete</button>
            </td>`;
        table.appendChild(row);
    });
}

function deleteCustomer(index) {
    customers.splice(index, 1);
    localStorage.setItem('customers', JSON.stringify(customers));
    renderCustomers();
}

function editCustomer(index) {
    const c = customers[index];
    document.getElementById('firstName').value = c.firstName;
    document.getElementById('lastName').value = c.lastName;
    document.getElementById('company').value = c.company;
    document.getElementById('address').value = c.address;
    document.getElementById('mobile').value = c.mobile;
    document.getElementById('home').value = c.home;
    document.getElementById('work').value = c.work;
    document.getElementById('email').value = c.email;
    document.getElementById('type').value = c.type;
    document.getElementById('source').value = c.source;
    document.getElementById('notes').value = c.notes;
    editIndex = index;
}

function clearForm() {
    document.querySelectorAll('.form input').forEach(input => input.value = '');
}

function exportCustomers() {
    const blob = new Blob([JSON.stringify(customers)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "customers.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importCustomers() {
    const fileInput = document.getElementById('importFile');
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            customers = JSON.parse(e.target.result);
            localStorage.setItem('customers', JSON.stringify(customers));
            renderCustomers();
        } catch (err) {
            alert("Invalid JSON");
        }
    };
    reader.readAsText(fileInput.files[0]);
}

document.addEventListener("DOMContentLoaded", renderCustomers);
