// Firebase v9 Configuration and Customer Dashboard Script
// Replace your existing script.js with this complete file

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

// Initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // Load customers after Firebase is initialized
    loadCustomers();
    
    // Set up form submission handler
    document.getElementById("customerForm").addEventListener("submit", handleFormSubmission);
});

// Form submission handler
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        // Save to Firebase Firestore
        await db.collection("customers").add(data);
        
        document.getElementById("responseMessage").textContent = "✅ Customer saved successfully!";
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

// Load customers from Firebase
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
                    <td colspan="12" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                        No customers found. Add your first customer using the form above.
                    </td>
                </tr>
            `;
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const customer = doc.data();
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
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`✅ Loaded ${querySnapshot.size} customers`);
        
    } catch (error) {
        console.error("Error loading customers:", error);
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align: center; padding: 20px; color: #d32f2f;">
                    Error loading customers: ${error.message}<br>
                    <small>Please check your Firebase configuration and internet connection.</small>
                </td>
            </tr>
        `;
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

