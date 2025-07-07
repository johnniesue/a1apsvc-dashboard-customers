const scriptURL = "https://script.google.com/macros/s/AKfycbx9TZHJaZeLMuTmI30lXEXFe5pv8vNdlrsZFyHx4A62c49nruuY6DDirlWtdNGy2Lwl/exec";

document.getElementById("customerForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const data = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    company: document.getElementById("company").value,
    address: document.getElementById("address").value,
    mobile: document.getElementById("mobile").value,
    home: document.getElementById("home").value,
    work: document.getElementById("work").value,
    email: document.getElementById("email").value,
    customerType: document.getElementById("customerType").value,
    leadSource: document.getElementById("leadSource").value,
    notes: document.getElementById("notes").value,
    timestamp: new Date().toLocaleString()
  };

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    document.getElementById("responseMessage").textContent = "✅ Customer saved!";
    document.getElementById("customerForm").reset();
    loadCustomers();
    geocodeAndUpdateMap(data.address);
  })
  .catch(() => {
    document.getElementById("responseMessage").textContent = "❌ Failed to save customer.";
  });
});

function loadCustomers() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#customerTable tbody");
      tbody.innerHTML = "";
      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.firstName || ""}</td><td>${row.lastName || ""}</td><td>${row.company || ""}</td>
          <td>${row.address || ""}</td><td>${row.mobile || ""}</td><td>${row.home || ""}</td>
          <td>${row.work || ""}</td><td>${row.email || ""}</td><td>${row.customerType || ""}</td>
          <td>${row.leadSource || ""}</td><td>${row.notes || ""}</td><td>${row.timestamp || ""}</td>`;
        tbody.appendChild(tr);
      });
    });
}

function geocodeAndUpdateMap(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: results[0].geometry.location
      });
      new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
    } else {
      console.error("Geocode failed: " + status);
    }
  });
}

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: 33.1032, lng: -96.6706 } // Allen TX
  });
}

loadCustomers();
