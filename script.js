// Simplified A-1 Plumbing Customer & Job Management System
// Core Firebase functionality without Google Maps complexity

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
let editingCustomerId = null;

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initializing A-1 Plumbing Dashboard...");
    
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("✅ Firebase initialized successfully");
        
        // Load customers after Firebase is initialized
        loadCustomers();
        
        // Set up form submission handler
        document.getElementById("customerForm").addEventListener("submit", handleFormSubmission);
        
        // Set up cancel edit button
        document.getElementById("cancelEdit").addEventListener("click", cancelEdit);
        
        // Set up quick status update buttons
        setupQuickStatusButtons();
        
        console.log("✅ Dashboard initialization complete");
        
    } catch (error) {
        console.error("❌ Error initializing dashboard:", error);
        showMessage("❌ Error initializing dashboard: " + error.message, "error");
    }
});

// Enhanced form submission with job tracking
async function handleFormSubmission(event) {
    event.preventDefault();
    
    console.log("📝 Processing form submission...");
    
    const data = {
        // Customer information
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        company: document.getElementById("company").value.trim(),
        address: document.getElementById("address").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        home: document.getElementById("home").value.trim(),
        work: document.getElementById("work").value.trim(),
        email: document.getElementById("email").value.trim(),
        customerType: document.getElementById("customerType").value,
        leadSource: document.getElementById("leadSource").value,
        notes: document.getElementById("notes").value.trim(),
        
        // Job information
        jobType: document.getElementById("jobType").value,
        jobPriority: document.getElementById("jobPriority").value,
        jobStatus: document.getElementById("jobStatus").value,
        assignedTech: document.getElementById("assignedTech").value,
        scheduledDate: document.getElementById("scheduledDate").value,
        estimatedDuration: document.getElementById("estimatedDuration").value,
        
        // Timestamps
        timestamp: new Date().toLocaleString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.address) {
        showMessage("❌ Please fill in all required fields (First Name, Last Name, Address)", "error");
        return;
    }
    
    try {
        if (editingCustomerId) {
            // Update existing customer/job
            console.log("📝 Updating existing customer/job:", editingCustomerId);
            
            const existingDoc = await db.collection("customers").doc(editingCustomerId).get();
            const existingData = existingDoc.data();
            
            // Preserve and update status history
            let statusHistory = existingData.statusHistory || [];
            
            if (existingData.jobStatus !== data.jobStatus && data.jobStatus) {
                statusHistory.push({
                    status: data.jobStatus,
                    timestamp: new Date().toLocaleString(),
                    updatedBy: "Office"
                });
            }
            
            data.statusHistory = statusHistory;
            
            await db.collection("customers").doc(editingCustomerId).update(data);
            showMessage("✅ Customer/Job updated successfully!", "success");
            cancelEdit();
            
        } else {
            // Add new customer/job
            console.log("📝 Adding new customer/job");
            
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            // Initialize status history
            if (data.jobStatus) {
                data.statusHistory = [{
                    status: data.jobStatus,
                    timestamp: new Date().toLocaleString(),
                    updatedBy: "Office"
                }];
            }
            
            await db.collection("customers").add(data);
            showMessage("✅ Customer/Job saved successfully!", "success");
        }
        
        // Reset form and reload data
        document.getElementById("customerForm").reset();
        loadCustomers();
        
    } catch (error) {
        console.error("❌ Error saving customer/job:", error);
        showMessage("❌ Failed to save: " + error.message, "error");
    }
}

// Load customers with enhanced job information
async function loadCustomers() {
    console.log("📊 Loading customers/jobs from Firebase...");
    
    try {
        const querySnapshot = await db.collection("customers")
            .orderBy("createdAt", "desc")
            .get();
        
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = "";
        
        if (querySnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="16" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                        No customers/jobs found. Add your first customer using the form above.
                    </td>
                </tr>
            `;
            console.log("📊 No customers found");
            return;
        }
        
        let customerCount = 0;
        querySnapshot.forEach((doc) => {
            const customer = doc.data();
            const customerId = doc.id;
            const tr = document.createElement("tr");
            
            // Add status-based row styling
            const statusClass = (customer.jobStatus || '').toLowerCase().replace(/\s+/g, '-');
            tr.className = `status-${statusClass}`;
            
            tr.innerHTML = `
                <td>${customer.firstName || ""}</td>
                <td>${customer.lastName || ""}</td>
                <td>${customer.company || ""}</td>
                <td>${customer.address || ""}</td>
                <td>${customer.mobile || ""}</td>
                <td>${customer.email || ""}</td>
                <td>${customer.jobType || ""}</td>
                <td><span class="priority-${(customer.jobPriority || '').toLowerCase()}">${customer.jobPriority || ""}</span></td>
                <td><span class="status-badge status-${statusClass}">${customer.jobStatus || ""}</span></td>
                <td>${customer.assignedTech || ""}</td>
                <td>${customer.scheduledDate || ""}</td>
                <td>${customer.estimatedDuration || ""}</td>
                <td class="notes-cell">${customer.notes || ""}</td>
                <td>${customer.timestamp || ""}</td>
                <td>
                    <button class="edit-btn" onclick="editCustomer('${customerId}')">✏️ Edit</button>
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteCustomer('${customerId}', '${customer.firstName} ${customer.lastName}')">🗑️ Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
            customerCount++;
        });
        
        console.log(`✅ Loaded ${customerCount} customers/jobs successfully`);
        
    } catch (error) {
        console.error("❌ Error loading customers:", error);
        const tbody = document.querySelector("#customerTable tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="16" style="text-align: center; padding: 20px; color: #d32f2f;">
                    ❌ Error loading customers: ${error.message}
                </td>
            </tr>
        `;
        showMessage("❌ Error loading customers: " + error.message, "error");
    }
}

// Quick status update for techs
async function quickStatusUpdate(customerId, newStatus) {
    if (!newStatus) return;
    
    console.log(`🔄 Quick status update: ${customerId} -> ${newStatus}`);
    
    try {
        const doc = await db.collection("customers").doc(customerId).get();
        const existingData = doc.data();
        
        const statusHistory = existingData.statusHistory || [];
        statusHistory.push({
            status: newStatus,
            timestamp: new Date().toLocaleString(),
            updatedBy: "Quick Update"
        });
        
        await db.collection("customers").doc(customerId).update({
            jobStatus: newStatus,
            statusHistory: statusHistory,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage(`✅ Status updated to: ${newStatus}`, "success");
        loadCustomers();
        
    } catch (error) {
        console.error("❌ Error updating status:", error);
        showMessage("❌ Failed to update status", "error");
    }
}

// Edit customer function
async function editCustomer(customerId) {
    console.log("✏️ Editing customer:", customerId);
    
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
            document.getElementById("submitBtn").textContent = "💾 Update Customer/Job";
            document.getElementById("cancelEdit").style.display = "inline-block";
            showMessage("✏️ Editing customer/job - make changes and click Update", "info");
            
            // Scroll to form
            document.getElementById("customerForm").scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("❌ Error loading customer for edit:", error);
        showMessage("❌ Error loading customer data", "error");
    }
}

// Cancel edit function
function cancelEdit() {
    console.log("❌ Canceling edit");
    
    editingCustomerId = null;
    document.getElementById("submitBtn").textContent = "💾 Save Customer & Job";
    document.getElementById("cancelEdit").style.display = "none";
    document.getElementById("customerForm").reset();
    showMessage("", "");
}

// Delete customer function
async function deleteCustomer(customerId, customerName) {
    if (confirm(`⚠️ Are you sure you want to delete ${customerName}?\n\nThis action cannot be undone.`)) {
        console.log("🗑️ Deleting customer:", customerId);
        
        try {
            await db.collection("customers").doc(customerId).delete();
            showMessage(`✅ ${customerName} deleted successfully`, "success");
            loadCustomers();
        } catch (error) {
            console.error("❌ Error deleting customer:", error);
            showMessage("❌ Error deleting customer", "error");
        }
    }
}

// Setup quick status buttons for mobile techs
function setupQuickStatusButtons() {
    console.log("📱 Setting up quick status buttons");
    
    // Add event listeners for quick action buttons if they exist
    const quickButtons = [
        { id: "quickScheduled", status: "Scheduled" },
        { id: "quickEnRoute", status: "En Route" },
        { id: "quickInProgress", status: "In Progress" },
        { id: "quickCompleted", status: "Completed" }
    ];
    
    quickButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener("click", () => {
                showMessage(`📱 Quick ${button.status} - Select customers from table to update`, "info");
            });
        }
    });
}

// Show messages to user
function showMessage(message, type) {
    const messageElement = document.getElementById("responseMessage");
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `response-message ${type}`;
        
        // Auto-clear success messages after 5 seconds
        if (type === "success") {
            setTimeout(() => {
                messageElement.textContent = "";
                messageElement.className = "response-message";
            }, 5000);
        }
    }
}

// Make functions globally available
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.quickStatusUpdate = quickStatusUpdate;

// Test Firebase connection on load
async function testFirebaseConnection() {
    try {
        console.log("🔥 Testing Firebase connection...");
        
        await db.collection("test").doc("connection").set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: "Connection test successful",
            userAgent: navigator.userAgent
        });
        
        console.log("✅ Firebase connection test successful");
        return true;
        
    } catch (error) {
        console.error("❌ Firebase connection test failed:", error);
        showMessage("❌ Firebase connection failed: " + error.message, "error");
        return false;
    }
}

// Run connection test after initialization
setTimeout(testFirebaseConnection, 2000);

