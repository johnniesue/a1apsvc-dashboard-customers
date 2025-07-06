
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
        "Notes": document.getElementById("notes").value
    };

    fetch("https://script.google.com/macros/s/AKfycbzFjcnYB9pnJ-PtZtkGuk2NKzNGzhqbMDES-IDzL1dkgCcyF1Z2HfxwHF58R3wOerdR/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(() => {
        document.getElementById("responseMessage").textContent = "✅ Customer saved!";
        document.getElementById("customerForm").reset();
    }).catch(() => {
        document.getElementById("responseMessage").textContent = "❌ Failed to save customer.";
    });
});
