
const scriptURL = "https://script.google.com/macros/s/AKfycbyiIBViuKCv816QkHyOhwKX9g9YDKRIQ3f7d_Rgs7d0Q8bR0VFwWk8LrUog8ESxS2X7/exec";

document.getElementById("customerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
        "First Name": document.getElementById("firstName").value,
        "Last Name": document.getElementById("lastName").value,
        "Company": document.getElementById("company").value,
        "Address": document.getElementById("address").value,
        "Mobile": document.getElementById("mobile").value,
        "Home": document.getElementById("home").value,
        "Work": document.getElementById("work").value,
        "Email": document.getElementById("email").value,
        "Type": document.getElementById("type").value,
        "Source": document.getElementById("source").value,
        "Notes": document.getElementById("notes").value,
        "Timestamp": new Date().toLocaleString()
    };

    fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById("responseMessage").textContent = "✅ Customer saved!";
        document.getElementById("customerForm").reset();
        setTimeout(loadCustomers, 1000);
    })
    .catch(() => {
        document.getElementById("responseMessage").textContent = "❌ Failed to save customer.";
    });
});

function loadCustomers() {
    fetch(scriptURL)
    .then(response => response.json())
    .then(data => {
        const table = document.querySelector("#customerTable tbody");
        table.innerHTML = "";
        data.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    });
}

// Load existing entries on page load
window.onload = loadCustomers;
