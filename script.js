// Enhanced Firebase Customer Dashboard with Edit/Delete Functionality
// Replace your existing script.js with this enhanced version

// Firebase configuration - YOUR ACTUAL CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyDeVLmKQXCMN_JZNwFL9OhfCQKVRHsVNy4",
    authDomain: "a1-customer-dashboard.firebaseapp.com",
    projectId: "a1-customer-dashboard",
    storageBucket: "a1-customer-dashboard.firebasestorage.app",
    messagingSenderId: "981606789719",
    appId: "1:981606789719:web:327592a2cefa2536bda912"
};

// Initialize Firebase when the page loads
let db;
let editingCustomerId = null;

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // Load customers after Firebase is initialized
    loadCustomers();
    
    // Set up form submission handler
    document.getElementById("customerForm").addEventListener("submit", handleFormSubmission);
    
    // Set up cancel edit button
    document.getElementById("cancelEdit").addEventListener("click", cancelEdit);
});

// Form submission handler (handles both new customers and edits)
async function handleFormSubmission(event) {
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
        timestamp: new Date().toLocaleString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (editingCustomerId) {
            // Update existing customer
            await db.collection("customers").doc(editingCustomerId).update(data);
            document.getElementById("responseMessage").textContent = "✅ Customer updated successfully!";
            cancelEdit();
        } else {
            // Add new customer
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("customers").add(data);
            document.getElementById("responseMessage").textContent = "✅ Customer saved successfully!";
        }
        
        document.getElementById("responseMessage").style.color = "#4caf50";
        document.getElementById("customerForm").reset();
        
        // Reload customers table
        loadCustomers();
        
        // Update map if address provided
        if (data.address) {
            geocodeAndUpdateMap(data.address);
        }
        
    } catch (error) {
        console.error("Error saving customer:", error);
        document.getElementById("responseMessage").textContent = "❌ Failed to save customer: " + error.message;
        document.getElementById("responseMessage").style.color = "#d32f2f";
    }
}

// Load customers from Firebase with edit/delete buttons
async function loadCustomers() {
    try {
        console.log("Loading customers from Firebase...");
        
        const querySnapshot = await db.collection("customers")
            .orderBy("createdAt", "desc")
            .get();
        
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = "";
        
        if (querySnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                        No customers found. Add your first customer using the form above.
                    </td>
                </tr>
            `;
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const customer = doc.data();
            const customerId = doc.id;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${customer.firstName || ""}</td>
                <td>${customer.lastName || ""}</td>
                <td>${customer.company || ""}</td>
                <td>${customer.address || ""}</td>
                <td>${customer.mobile || ""}</td>
                <td>${customer.home || ""}</td>
                <td>${customer.work || ""}</td>
                <td>${customer.email || ""}</td>
                <td>${customer.customerType || ""}</td>
                <td>${customer.leadSource || ""}</td>
                <td>${customer.notes || ""}</td>
                <td>${customer.timestamp || ""}</td>
                <td>
                    <button class="edit-btn" onclick="editCustomer('${customerId}')">Edit</button>
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteCustomer('${customerId}', '${customer.firstName} ${customer.lastName}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`✅ Loaded ${querySnapshot.size} customers`);
        
    } catch (error) {
        console.error("Error loading customers:", error);
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="14" style="text-align: center; padding: 20px; color: #d32f2f;">
                    Error loading customers: ${error.message}<br>
                    <small>Please check your Firebase configuration and internet connection.</small>
                </td>
            </tr>
        `;
    }
}

// Edit customer function
async function editCustomer(customerId) {
    try {
        const doc = await db.collection("customers").doc(customerId).get();
        if (doc.exists) {
            const customer = doc.data();
            
            // Populate form with customer data
            document.getElementById("firstName").value = customer.firstName || "";
            document.getElementById("lastName").value = customer.lastName || "";
            document.getElementById("company").value = customer.company || "";
            document.getElementById("address").value = customer.address || "";
            document.getElementById("mobile").value = customer.mobile || "";
            document.getElementById("home").value = customer.home || "";
            document.getElementById("work").value = customer.work || "";
            document.getElementById("email").value = customer.email || "";
            document.getElementById("customerType").value = customer.customerType || "";
            document.getElementById("leadSource").value = customer.leadSource || "";
            document.getElementById("notes").value = customer.notes || "";
            
            // Set editing mode
            editingCustomerId = customerId;
            document.getElementById("submitBtn").textContent = "Update Customer";
            document.getElementById("cancelEdit").style.display = "inline-block";
            document.getElementById("responseMessage").textContent = "Editing customer - make changes and click Update Customer";
            document.getElementById("responseMessage").style.color = "#2196f3";
            
            // Scroll to form
            document.getElementById("customerForm").scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Error loading customer for edit:", error);
        document.getElementById("responseMessage").textContent = "❌ Error loading customer data";
        document.getElementById("responseMessage").style.color = "#d32f2f";
    }
}

// Cancel edit function
function cancelEdit() {
    editingCustomerId = null;
    document.getElementById("submitBtn").textContent = "Save Customer";
    document.getElementById("cancelEdit").style.display = "none";
    document.getElementById("customerForm").reset();
    document.getElementById("responseMessage").textContent = "";
}

// Delete customer function
async function deleteCustomer(customerId, customerName) {
    if (confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
        try {
            await db.collection("customers").doc(customerId).delete();
            document.getElementById("responseMessage").textContent = `✅ ${customerName} deleted successfully`;
            document.getElementById("responseMessage").style.color = "#4caf50";
            loadCustomers();
        } catch (error) {
            console.error("Error deleting customer:", error);
            document.getElementById("responseMessage").textContent = "❌ Error deleting customer";
            document.getElementById("responseMessage").style.color = "#d32f2f";
        }
    }
}

// Geocode address and update map
function geocodeAndUpdateMap(address) {
    if (!window.google || !window.google.maps) {
        console.error("Google Maps API not loaded");
        return;
    }
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: results[0].geometry.location,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true
            });
            
            new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                title: address
            });
            
            console.log("Map updated for address:", address);
        } else {
            console.error("Geocode failed: " + status);
        }
    });
}

// Initialize Google Map
function initMap() {
    if (!document.getElementById("map")) {
        console.error("Map container not found");
        return;
    }
    
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 33.1032, lng: -96.6706 }, // Allen TX coordinates
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
    });
    
    console.log("Google Map initialized");
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;

// Make edit and delete functions globally available
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;

// Utility function to test Firebase connection
async function testFirebaseConnection() {
    try {
        await db.collection("test").doc("connection").set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: "Connection test successful"
        });
        console.log("✅ Firebase connection test successful");
        return true;
    } catch (error) {
        console.error("❌ Firebase connection test failed:", error);
        return false;
    }
}

