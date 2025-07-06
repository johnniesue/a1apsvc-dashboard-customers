
const scriptURL = 'https://script.google.com/macros/s/AKfycbzFjcnYB9pnJ-PtZtkGuk2NKzNGzhqbMDES-IDzL1dkgCcyF1Z2HfxwHF58R3wOerdR/exec';

document.getElementById('saveCustomer').addEventListener('click', () => {
  const data = {
    "First Name": document.getElementById('firstName').value,
    "Last Name": document.getElementById('lastName').value,
    "Company": document.getElementById('company').value,
    "Address": document.getElementById('address').value,
    "Mobile": document.getElementById('mobilePhone').value,
    "Home": document.getElementById('homePhone').value,
    "Work": document.getElementById('workPhone').value,
    "Email": document.getElementById('email').value,
    "Type": document.getElementById('type').value,
    "Source": document.getElementById('source').value,
    "Notes": document.getElementById('notes').value,
    "Timestamp": new Date().toLocaleString()
  };

  fetch(scriptURL, {
    method: 'POST',
    body: new URLSearchParams(data)
  })
  .then(response => {
    alert('Customer saved successfully!');
    loadCustomers();
  })
  .catch(error => {
    alert('Failed to save customer');
    console.error('Error!', error.message);
  });
});

function loadCustomers() {
  fetch(scriptURL)
    .then(response => response.json())
    .then(data => {
      const table = document.querySelector('#customerTable tbody');
      table.innerHTML = '';
      data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row['First Name']}</td><td>${row['Last Name']}</td><td>${row.Company}</td><td><a href="https://maps.google.com/?q=${row.Address}" target="_blank">${row.Address}</a></td>
          <td>${row.Mobile}</td><td>${row.Home}</td><td>${row.Work}</td><td>${row.Email}</td>
          <td>${row.Type}</td><td>${row.Source}</td><td>${row.Notes}</td>
          <td><button onclick="deleteCustomer(${index})">Delete</button></td>
        `;
        table.appendChild(tr);
      });
    });
}

function deleteCustomer(index) {
  alert('Delete functionality is pending');
}

function exportCustomers() {
  alert('Export functionality is pending');
}

function importCustomers() {
  alert('Import functionality is pending');
}

window.onload = loadCustomers;
