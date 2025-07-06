const sheetURL = "https://opensheet.elk.sh/1OXs1quJSyRegLVuU5G96QVhcMrJygvxwBuCgA6_mwqI/Sheet1";
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    document.getElementById("responseMessage").textContent = "✅ Customer saved!";
    document.getElementById("customerForm").reset();
    loadCustomers();
  })
  .catch(() => {
    document.getElementById("responseMessage").textContent = "❌ Failed to save customer.";
  });
});

function loadCustomers() {
  fetch(sheetURL)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#customerTable tbody");
      tbody.innerHTML = "";
      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row["First Name"]}</td>
          <td>${row["Last Name"]}</td>
          <td>${row["Company"]}</td>
          <td>${row["Address"]}</td>
          <td>${row["Mobile"]}</td>
          <td>${row["Home"]}</td>
          <td>${row["Work"]}</td>
          <td>${row["Email"]}</td>
          <td>${row["Type"]}</td>
          <td>${row["Source"]}</td>
          <td>${row["Notes"]}</td>
          <td>${row["Timestamp"]}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function initAutocomplete() {
  const input = document.getElementById("address");
  if (input) {
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(["formatted_address"]);
  }
}

window.onload = loadCustomers;
