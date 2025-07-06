
const scriptURL = "https://script.google.com/macros/s/AKfycbyiIBViuKCv816QkHyOhwKX9g9YDKRIQ3f7d_Rgs7d0Q8bR0VFwWk8LrUog8ESxS2X7/exec";

document.getElementById("customerForm").addEventListener("submit", function(event) {
  event.preventDefault();
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
    appendCustomerToTable(data);
    document.getElementById("customerForm").reset();
  })
  .catch(() => {
    document.getElementById("responseMessage").textContent = "❌ Failed to save customer.";
  });
});

function appendCustomerToTable(data) {
  const table = document.getElementById("customerTable").querySelector("tbody");
  const row = table.insertRow();
  Object.values(data).forEach(value => {
    const cell = row.insertCell();
    cell.textContent = value;
  });
}
