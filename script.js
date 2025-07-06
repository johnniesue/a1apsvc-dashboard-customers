const webhookURL = "https://script.google.com/macros/s/AKfycbzFjcnYB9pnJ-PtZtkGuk2NKzNGzhqbMDES-IDzL1dkgCcyF1Z2HfxwHF58R3wOerdR/exec";
let customers = JSON.parse(localStorage.getItem("customers") || "[]");
let history = JSON.parse(localStorage.getItem("history") || "{}");
let editIndex = -1;
let currentKey = "";

function val(id) { return document.getElementById(id).value.trim(); }

function saveCustomer() {
  const c = {
    first: val("first"), last: val("last"), company: val("company"),
    address: val("address"), mobile: val("mobile"), home: val("home"),
    work: val("work"), email: val("email"), type: val("type"),
    source: val("source"), notes: val("notes")
  };

  if (editIndex >= 0) {
    customers[editIndex] = c;
    editIndex = -1;
  } else {
    customers.push(c);
  }

  localStorage.setItem("customers", JSON.stringify(customers));
  sendToSheets(c);
  renderCustomers();
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
}

function renderCustomers() {
  const tbody = document.getElementById("customerTableBody");
  tbody.innerHTML = "";
  customers.forEach((c, i) => {
    const row = tbody.insertRow();
    row.innerHTML = \`
      <td>\${c.first}</td><td>\${c.last}</td><td>\${c.address}</td><td>\${c.email}</td>
      <td>
        <button onclick="editCustomer(\${i})">Edit</button>
        <button onclick="deleteCustomer(\${i})">Delete</button>
        <button onclick="openHistory('\${c.address}')">History</button>
      </td>
    \`;
  });
}

function editCustomer(index) {
  const c = customers[index];
  Object.entries(c).forEach(([k, v]) => {
    const el = document.getElementById(k);
    if (el) el.value = v;
  });
  editIndex = index;
}

function deleteCustomer(index) {
  customers.splice(index, 1);
  localStorage.setItem("customers", JSON.stringify(customers));
  renderCustomers();
}

function sendToSheets(data) {
  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

function importCustomers() {
  const input = document.getElementById("importFile");
  const reader = new FileReader();
  reader.onload = () => {
    customers = JSON.parse(reader.result);
    localStorage.setItem("customers", JSON.stringify(customers));
    renderCustomers();
  };
  reader.readAsText(input.files[0]);
}

function exportCustomers() {
  const blob = new Blob([JSON.stringify(customers)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "customers.json";
  a.click();
}

function searchCustomers() {
  const q = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll("#customerTableBody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
  });
}

// --- Service History ---
function openHistory(key) {
  currentKey = key;
  const notes = history[key] || [];
  const ul = document.getElementById("historyList");
  ul.innerHTML = "";
  notes.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    ul.appendChild(li);
  });
  document.getElementById("historyNote").value = "";
  document.getElementById("historyModal").style.display = "block";
}

function addHistoryNote() {
  const note = document.getElementById("historyNote").value.trim();
  if (!note) return;
  if (!history[currentKey]) history[currentKey] = [];
  history[currentKey].push(note);
  localStorage.setItem("history", JSON.stringify(history));
  openHistory(currentKey);
}

function closeHistory() {
  document.getElementById("historyModal").style.display = "none";
}

window.onload = renderCustomers;