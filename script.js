==============================================

// Enhanced Customer & Job Management System with Google Maps
// A-1 Affordable Plumbing Services Dashboard

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeVLmKQXCMN_JZNwFL9OhfCQKVRHsVNy4",
    authDomain: "a1-customer-dashboard.firebaseapp.com",
    projectId: "a1-customer-dashboard",
    storageBucket: "a1-customer-dashboard.firebasestorage.app",
    messagingSenderId: "981606789719",
    appId: "1:981606789719:web:327592a2cefa2536bda912"
};

// Global variables
let db;
let map;
let geocoder;
let editingCustomerId = null;
let currentMarker = null;

// Initialize Firebase and Google Maps when page loads
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
    
    // Set up address verification
    document.getElementById("address").addEventListener("blur", verifyAddress);
    
    // Set up quick status update buttons
    setupQuickStatusButtons();
});

// Initialize Google Map with proper error handling
function initMap() {
    try {
        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.error("Map container not found");
            return;
        }
        
        // Initialize map centered on Allen, TX (A-1 Plumbing service area)
        map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: { lat: 33.1032, lng: -96.6706 }, // Allen TX coordinates
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });
        
        // Initialize geocoder
        geocoder = new google.maps.Geocoder();
        
        console.log("✅ Google Map initialized successfully");
        
        // Add click listener for map
        map.addListener("click", function(event) {
            reverseGeocode(event.latLng);
        });
        
    } catch (error) {
        console.error("❌ Error initializing Google Map:", error);
        document.getElementById("map").innerHTML = `
            <div style="padding: 20px; text-align: center; color: #d32f2f;">
                <h3>Map Loading Error</h3>
                <p>Unable to load Google Maps. Please check your internet connection.</p>
            </div>
        `;
    }
}

// Verify address using Google Maps Geocoding
async function verifyAddress() {
    const addressInput = document.getElementById("address");
    const address = addressInput.value.trim();
    
    if (!address || !geocoder) return;
    
    try {
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results[0]) {
                const location = results[0].geometry.location;
                const formattedAddress = results[0].formatted_address;
                
                // Update map
                map.setCenter(location);
                map.setZoom(16);
                
                // Clear previous marker
                if (currentMarker) {
                    currentMarker.setMap(null);
                }
                
                // Add new marker
                currentMarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: formattedAddress,
                    animation: google.maps.Animation.DROP
                });
                
                // Show verification status
                showAddressStatus("✅ Address verified: " + formattedAddress, "success");
                
                // Optionally update the address field with formatted address
                if (formattedAddress !== address) {
                    addressInput.value = formattedAddress;
                }
                
            } else {
                showAddressStatus("⚠️ Address not found. Please check and try again.", "warning");
                console.warn("Geocoding failed:", status);
            }
        });
    } catch (error) {
        console.error("Address verification error:", error);
        showAddressStatus("❌ Address verification failed", "error");
    }
}

// Reverse geocode from map click
function reverseGeocode(latLng) {
    if (!geocoder) return;
    
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            document.getElementById("address").value = address;
            showAddressStatus("📍 Address selected from map: " + address, "info");
        }
    });
}

// Show address verification status
function showAddressStatus(message, type) {
    const statusElement = document.getElementById("addressStatus");
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `address-status ${type}`;
        
        // Clear after 5 seconds
        setTimeout(() => {
            statusElement.textContent = "";
            statusElement.className = "address-status";
        }, 5000);
    }
}

// Enhanced form submission with job tracking
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const data = {
        // Customer information
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
        
        // Job information
        jobType: document.getElementById("jobType").value,
        jobPriority: document.getElementById("jobPriority").value,
        jobStatus: document.getElementById("jobStatus").value,
        assignedTech: document.getElementById("assignedTech").value,
        scheduledDate: document.getElementById("scheduledDate").value,
        estimatedDuration: document.getElementById("estimatedDuration").value,
        
        // Timestamps
        timestamp: new Date().toLocaleString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        statusHistory: [{
            status: document.getElementById("jobStatus").value,
            timestamp: new Date().toLocaleString(),
            updatedBy: "Office"
        }]
    };
    
    try {
        if (editingCustomerId) {
            // Update existing customer/job
            const existingDoc = await db.collection("customers").doc(editingCustomerId).get();
            const existingData = existingDoc.data();
            
            // Preserve status history and add new entry if status changed
            if (existingData.jobStatus !== data.jobStatus) {
                data.statusHistory = existingData.statusHistory || [];
                data.statusHistory.push({
                    status: data.jobStatus,
                    timestamp: new Date().toLocaleString(),
                    updatedBy: "Office"
                });
            } else {
                data.statusHistory = existingData.statusHistory || [];
            }
            
            await db.collection("customers").doc(editingCustomerId).update(data);
            document.getElementById("responseMessage").textContent = "✅ Customer/Job updated successfully!";
            cancelEdit();
        } else {
            // Add new customer/job
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("customers").add(data);
            document.getElementById("responseMessage").textContent = "✅ Customer/Job saved successfully!";
        }
        
        document.getElementById("responseMessage").style.color = "#4caf50";
        document.getElementById("customerForm").reset();
        
        // Reload customers table
        loadCustomers();
        
    } catch (error) {
        console.error("Error saving customer/job:", error);
        document.getElementById("responseMessage").textContent = "❌ Failed to save: " + error.message;
        document.getElementById("responseMessage").style.color = "#d32f2f";
    }
}

// Load customers with enhanced job information
async function loadCustomers() {
    try {
        console.log("Loading customers/jobs from Firebase...");
        
        const querySnapshot = await db.collection("customers")
            .orderBy("createdAt", "desc")
            .get();
        
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = "";
        
        if (querySnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="18" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                        No customers/jobs found. Add your first customer using the form above.
                    </td>
                </tr>
            `;
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const customer = doc.data();
            const customerId = doc.id;
            const tr = document.createElement("tr");
            
            // Add status-based row styling
            tr.className = `status-${(customer.jobStatus || '').toLowerCase().replace(/\s+/g, '-')}`;
            
            tr.innerHTML = `
                <td>${customer.firstName || ""}</td>
                <td>${customer.lastName || ""}</td>
                <td>${customer.company || ""}</td>
                <td>${customer.address || ""}</td>
                <td>${customer.mobile || ""}</td>
                <td>${customer.email || ""}</td>
                <td>${customer.jobType || ""}</td>
                <td><span class="priority-${(customer.jobPriority || '').toLowerCase()}">${customer.jobPriority || ""}</span></td>
                <td><span class="status-badge status-${(customer.jobStatus || '').toLowerCase().replace(/\s+/g, '-')}">${customer.jobStatus || ""}</span></td>
                <td>${customer.assignedTech || ""}</td>
                <td>${customer.scheduledDate || ""}</td>
                <td>${customer.estimatedDuration || ""}</td>
                <td>${customer.notes || ""}</td>
                <td>${customer.timestamp || ""}</td>
                <td>
                    <button class="edit-btn" onclick="editCustomer('${customerId}')">Edit</button>
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteCustomer('${customerId}', '${customer.firstName} ${customer.lastName}')">Delete</button>
                </td>
                <td>
                    <select class="quick-status" onchange="quickStatusUpdate('${customerId}', this.value)">
                        <option value="">Quick Update</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="En Route">En Route</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="map-btn" onclick="showOnMap('${customer.address}')">📍 Map</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`✅ Loaded ${querySnapshot.size} customers/jobs`);
        
    } catch (error) {
        console.error("Error loading customers:", error);
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="18" style="text-align: center; padding: 20px; color: #d32f2f;">
                    Error loading customers: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Quick status update for techs
async function quickStatusUpdate(customerId, newStatus) {
    if (!newStatus) return;
    
    try {
        const doc = await db.collection("customers").doc(customerId).get();
        const existingData = doc.data();
        
        const statusHistory = existingData.statusHistory || [];
        statusHistory.push({
            status: newStatus,
            timestamp: new Date().toLocaleString(),
            updatedBy: "Tech/Field Update"
        });
        
        await db.collection("customers").doc(customerId).update({
            jobStatus: newStatus,
            statusHistory: statusHistory,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show success message
        showQuickUpdateStatus(`✅ Status updated to: ${newStatus}`, "success");
        
        // Reload table
        loadCustomers();
        
    } catch (error) {
        console.error("Error updating status:", error);
        showQuickUpdateStatus("❌ Failed to update status", "error");
    }
}

// Show address on map
function showOnMap(address) {
    if (!address || !geocoder) {
        alert("Address not available or map not loaded");
        return;
    }
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            
            map.setCenter(location);
            map.setZoom(16);
            
            // Clear previous marker
            if (currentMarker) {
                currentMarker.setMap(null);
            }
            
            // Add new marker
            currentMarker = new google.maps.Marker({
                position: location,
                map: map,
                title: address,
                animation: google.maps.Animation.BOUNCE
            });
            
            // Stop bouncing after 2 seconds
            setTimeout(() => {
                if (currentMarker) {
                    currentMarker.setAnimation(null);
                }
            }, 2000);
            
            // Scroll to map
            document.getElementById("map").scrollIntoView({ behavior: 'smooth' });
            
        } else {
            alert("Could not locate address on map");
        }
    });
}

// Edit customer function (enhanced)
async function editCustomer(customerId) {
    try {
        const doc = await db.collection("customers").doc(customerId).get();
        if (doc.exists) {
            const customer = doc.data();
            
            // Populate customer fields
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
            
            // Populate job fields
            document.getElementById("jobType").value = customer.jobType || "";
            document.getElementById("jobPriority").value = customer.jobPriority || "";
            document.getElementById("jobStatus").value = customer.jobStatus || "";
            document.getElementById("assignedTech").value = customer.assignedTech || "";
            document.getElementById("scheduledDate").value = customer.scheduledDate || "";
            document.getElementById("estimatedDuration").value = customer.estimatedDuration || "";
            
            // Set editing mode
            editingCustomerId = customerId;
            document.getElementById("submitBtn").textContent = "Update Customer/Job";
            document.getElementById("cancelEdit").style.display = "inline-block";
            document.getElementById("responseMessage").textContent = "Editing customer/job - make changes and click Update";
            document.getElementById("responseMessage").style.color = "#2196f3";
            
            // Verify address on map if available
            if (customer.address) {
                verifyAddress();
            }
            
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
    document.getElementById("submitBtn").textContent = "Save Customer/Job";
    document.getElementById("cancelEdit").style.display = "none";
    document.getElementById("customerForm").reset();
    document.getElementById("responseMessage").textContent = "";
    
    // Clear map marker
    if (currentMarker) {
        currentMarker.setMap(null);
        currentMarker = null;
    }
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

// Setup quick status buttons for mobile techs
function setupQuickStatusButtons() {
    // Add event listeners for quick action buttons if they exist
    const enRouteBtn = document.getElementById("quickEnRoute");
    const inProgressBtn = document.getElementById("quickInProgress");
    const completedBtn = document.getElementById("quickCompleted");
    
    if (enRouteBtn) {
        enRouteBtn.addEventListener("click", () => updateAllSelectedJobs("En Route"));
    }
    if (inProgressBtn) {
        inProgressBtn.addEventListener("click", () => updateAllSelectedJobs("In Progress"));
    }
    if (completedBtn) {
        completedBtn.addEventListener("click", () => updateAllSelectedJobs("Completed"));
    }
}

// Show quick update status
function showQuickUpdateStatus(message, type) {
    const statusElement = document.getElementById("quickUpdateStatus");
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `quick-status ${type}`;
        
        setTimeout(() => {
            statusElement.textContent = "";
            statusElement.className = "quick-status";
        }, 3000);
    } else {
        // Fallback to main response message
        document.getElementById("responseMessage").textContent = message;
        document.getElementById("responseMessage").style.color = type === "success" ? "#4caf50" : "#d32f2f";
    }
}

// Make functions globally available
window.initMap = initMap;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.quickStatusUpdate = quickStatusUpdate;
window.showOnMap = showOnMap;

// Test Firebase connection
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