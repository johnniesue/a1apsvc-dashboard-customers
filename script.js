// A-1 Plumbing Customer & Job Management with Google Maps Integration
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeVLmKQXCMN_JZNwFL9OhfCQKVRHsVNy4",
    authDomain: "a1-customer-dashboard.firebaseapp.com",
    projectId: "a1-customer-dashboard",
    storageBucket: "a1-customer-dashboard.firebasestorage.app",
    messagingSenderId: "981606789719",
    appId: "1:981606789719:web:327592a2cefa2536bda912"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Google Maps Configuration
const GOOGLE_MAPS_API_KEY = 'AIzaSyBwP09_HDy1_u_VWDlZbz43CK_17aL-J4I';
let map;
let geocoder;
let autocomplete;
let placesService;

// Global variables
let editingCustomerId = null;
let customers = [];

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGoogleMaps();
    loadCustomers();
    setupEventListeners();
    setupQuickActions();
});

// Initialize Google Maps
function initializeGoogleMaps() {
    // Initialize map centered on Allen, TX (A-1 Plumbing service area)
    const allenTX = { lat: 33.1031, lng: -96.6706 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: allenTX,
        mapTypeId: 'roadmap'
    });

    // Initialize geocoder
    geocoder = new google.maps.Geocoder();
    
    // Initialize places service
    placesService = new google.maps.places.PlacesService(map);

    // Setup address autocomplete
    setupAddressAutocomplete();
    
    // Add click listener to map for getting addresses
    map.addListener('click', function(event) {
        getAddressFromCoordinates(event.latLng);
    });
}

// Setup address autocomplete
function setupAddressAutocomplete() {
    const addressInput = document.getElementById('serviceAddress');
    if (addressInput) {
        autocomplete = new google.maps.places.Autocomplete(addressInput, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry', 'address_components']
        });

        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                // Update map to show selected location
                map.setCenter(place.geometry.location);
                map.setZoom(15);
                
                // Add marker
                new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.formatted_address
                });
                
                // Verify address
                verifyAddress(place.formatted_address);
            }
        });
    }
}

// Verify address using Geocoding API
function verifyAddress(address) {
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK') {
            const result = results[0];
            const addressStatus = document.getElementById('addressStatus');
            if (addressStatus) {
                addressStatus.innerHTML = `
                    <div class="address-verified">
                        ✅ Address verified: ${result.formatted_address}
                    </div>
                `;
            }
        } else {
            const addressStatus = document.getElementById('addressStatus');
            if (addressStatus) {
                addressStatus.innerHTML = `
                    <div class="address-error">
                        ⚠️ Address could not be verified. Please check and try again.
                    </div>
                `;
            }
        }
    });
}

// Get address from map coordinates
function getAddressFromCoordinates(latLng) {
    geocoder.geocode({ location: latLng }, function(results, status) {
        if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            document.getElementById('serviceAddress').value = address;
            verifyAddress(address);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('customerForm').addEventListener('submit', handleFormSubmit);
    
    // Address input real-time verification
    const addressInput = document.getElementById('serviceAddress');
    if (addressInput) {
        addressInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                verifyAddress(this.value.trim());
            }
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    try {
        if (editingCustomerId) {
            // Update existing customer
            await db.collection('customers').doc(editingCustomerId).update({
                ...formData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showMessage('Customer updated successfully!', 'success');
            cancelEdit();
        } else {
            // Add new customer
            await db.collection('customers').add({
                ...formData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showMessage('Customer saved successfully!', 'success');
        }
        
        document.getElementById('customerForm').reset();
        document.getElementById('addressStatus').innerHTML = '';
        loadCustomers();
        
    } catch (error) {
        console.error('Error saving customer:', error);
        showMessage('Error saving customer. Please try again.', 'error');
    }
}

// Get form data
function getFormData() {
    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        company: document.getElementById('company').value.trim(),
        serviceAddress: document.getElementById('serviceAddress').value.trim(),
        mobilePhone: document.getElementById('mobilePhone').value.trim(),
        homePhone: document.getElementById('homePhone').value.trim(),
        workPhone: document.getElementById('workPhone').value.trim(),
        email: document.getElementById('email').value.trim(),
        customerType: document.getElementById('customerType').value,
        leadSource: document.getElementById('leadSource').value.trim(),
        jobType: document.getElementById('jobType').value,
        priority: document.getElementById('priority').value,
        jobStatus: document.getElementById('jobStatus').value,
        assignedTech: document.getElementById('assignedTech').value,
        scheduledDate: document.getElementById('scheduledDate').value,
        estimatedDuration: document.getElementById('estimatedDuration').value,
        notes: document.getElementById('notes').value.trim()
    };
}

// Load customers from Firebase
async function loadCustomers() {
    try {
        const snapshot = await db.collection('customers')
            .orderBy('createdAt', 'desc')
            .get();
        
        customers = [];
        snapshot.forEach(doc => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        
        displayCustomers();
        updateMapMarkers();
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showMessage('Error loading customers.', 'error');
    }
}

// Display customers in table
function displayCustomers() {
    const tbody = document.querySelector('#customersTable tbody');
    if (!tbody) return;
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="15" class="no-data">Loading customer data...</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr class="customer-row" data-status="${customer.jobStatus || 'quote'}">
            <td>${customer.firstName || ''}</td>
            <td>${customer.lastName || ''}</td>
            <td>${customer.company || ''}</td>
            <td class="address-cell">
                ${customer.serviceAddress || ''}
                ${customer.serviceAddress ? `<button class="map-btn" onclick="showOnMap('${customer.serviceAddress}')" title="Show on map">📍</button>` : ''}
            </td>
            <td>${customer.mobilePhone || ''}</td>
            <td>${customer.email || ''}</td>
            <td>${customer.jobType || ''}</td>
            <td><span class="priority-badge priority-${customer.priority || 'normal'}">${customer.priority || 'Normal'}</span></td>
            <td>
                <select class="status-select" onchange="updateStatus('${customer.id}', this.value)">
                    <option value="quote" ${customer.jobStatus === 'quote' ? 'selected' : ''}>Quote</option>
                    <option value="scheduled" ${customer.jobStatus === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="enroute" ${customer.jobStatus === 'enroute' ? 'selected' : ''}>En Route</option>
                    <option value="inprogress" ${customer.jobStatus === 'inprogress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${customer.jobStatus === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>${customer.assignedTech || ''}</td>
            <td>${customer.scheduledDate || ''}</td>
            <td>${customer.estimatedDuration || ''}</td>
            <td class="notes-cell">${customer.notes || ''}</td>
            <td>${formatTimestamp(customer.createdAt)}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editCustomer('${customer.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteCustomer('${customer.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update map markers
function updateMapMarkers() {
    // Clear existing markers (you might want to keep track of markers)
    
    customers.forEach(customer => {
        if (customer.serviceAddress) {
            geocoder.geocode({ address: customer.serviceAddress }, function(results, status) {
                if (status === 'OK') {
                    const marker = new google.maps.Marker({
                        position: results[0].geometry.location,
                        map: map,
                        title: `${customer.firstName} ${customer.lastName} - ${customer.jobStatus || 'Quote'}`
                    });
                    
                    // Add info window
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div class="marker-info">
                                <h4>${customer.firstName} ${customer.lastName}</h4>
                                <p><strong>Address:</strong> ${customer.serviceAddress}</p>
                                <p><strong>Job Type:</strong> ${customer.jobType || 'N/A'}</p>
                                <p><strong>Status:</strong> ${customer.jobStatus || 'Quote'}</p>
                                <p><strong>Priority:</strong> ${customer.priority || 'Normal'}</p>
                                <p><strong>Tech:</strong> ${customer.assignedTech || 'Unassigned'}</p>
                            </div>
                        `
                    });
                    
                    marker.addListener('click', function() {
                        infoWindow.open(map, marker);
                    });
                }
            });
        }
    });
}

// Show address on map
function showOnMap(address) {
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            map.setZoom(15);
            
            // Highlight the marker or create a temporary one
            const marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: map,
                animation: google.maps.Animation.BOUNCE,
                title: address
            });
            
            // Stop bouncing after 2 seconds
            setTimeout(() => {
                marker.setAnimation(null);
            }, 2000);
        }
    });
}

// Setup quick actions for techs
function setupQuickActions() {
    // Mark Scheduled
    document.getElementById('markScheduled').addEventListener('click', function() {
        updateSelectedCustomersStatus('scheduled');
    });
    
    // I'm En Route
    document.getElementById('markEnRoute').addEventListener('click', function() {
        updateSelectedCustomersStatus('enroute');
    });
    
    // Job Started
    document.getElementById('markStarted').addEventListener('click', function() {
        updateSelectedCustomersStatus('inprogress');
    });
    
    // Job Complete
    document.getElementById('markComplete').addEventListener('click', function() {
        updateSelectedCustomersStatus('completed');
    });
}

// Update status for a specific customer
async function updateStatus(customerId, newStatus) {
    try {
        await db.collection('customers').doc(customerId).update({
            jobStatus: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage(`Status updated to ${newStatus}`, 'success');
        loadCustomers(); // Reload to update map markers
        
    } catch (error) {
        console.error('Error updating status:', error);
        showMessage('Error updating status', 'error');
    }
}

// Update selected customers status (for quick actions)
function updateSelectedCustomersStatus(status) {
    // This would work with checkboxes if you add them to the table
    showMessage(`Quick action: ${status} - Feature can be enhanced with customer selection`, 'info');
}

// Edit customer
function editCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    editingCustomerId = customerId;
    
    // Populate form with customer data
    Object.keys(customer).forEach(key => {
        const element = document.getElementById(key);
        if (element && key !== 'id') {
            element.value = customer[key] || '';
        }
    });
    
    // Update form button
    const submitBtn = document.querySelector('#customerForm button[type="submit"]');
    submitBtn.textContent = 'Update Customer & Job';
    submitBtn.style.backgroundColor = '#ff9800';
    
    // Show cancel button
    showCancelButton();
    
    // Scroll to form
    document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth' });
    
    // Show address on map if available
    if (customer.serviceAddress) {
        showOnMap(customer.serviceAddress);
    }
}

// Cancel edit
function cancelEdit() {
    editingCustomerId = null;
    document.getElementById('customerForm').reset();
    document.getElementById('addressStatus').innerHTML = '';
    
    // Reset form button
    const submitBtn = document.querySelector('#customerForm button[type="submit"]');
    submitBtn.textContent = 'Save Customer & Job';
    submitBtn.style.backgroundColor = '#2196F3';
    
    // Hide cancel button
    hideCancelButton();
}

// Show cancel button
function showCancelButton() {
    let cancelBtn = document.getElementById('cancelEditBtn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel Edit';
        cancelBtn.style.cssText = 'background-color: #f44336; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;';
        cancelBtn.onclick = cancelEdit;
        
        const submitBtn = document.querySelector('#customerForm button[type="submit"]');
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
    }
}

// Hide cancel button
function hideCancelButton() {
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

// Delete customer
async function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        return;
    }
    
    try {
        await db.collection('customers').doc(customerId).delete();
        showMessage('Customer deleted successfully!', 'success');
        loadCustomers();
        
    } catch (error) {
        console.error('Error deleting customer:', error);
        showMessage('Error deleting customer.', 'error');
    }
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Show message
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        ${type === 'success' ? 'background-color: #4CAF50;' : ''}
        ${type === 'error' ? 'background-color: #f44336;' : ''}
        ${type === 'info' ? 'background-color: #2196F3;' : ''}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

