// 🔥 Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDeVLmKQXCMN_JZNwFL9OhfCQKVRHsVNy4",
  authDomain: "a1-customer-dashboard.firebaseapp.com",
  databaseURL: "https://a1-customer-dashboard-default-rtdb.firebaseio.com",
  projectId: "a1-customer-dashboard",
  storageBucket: "a1-customer-dashboard.appspot.com",
  messagingSenderId: "981606789719",
  appId: "1:981606789719:web:327592a2cefa2536bda912"
};

firebase.initializeApp(firebaseConfig);

// 🔄 Realtime Database listener
const realtimeDB = firebase.database();
const statusRef = realtimeDB.ref("status");

statusRef.set("Connected");

statusRef.on("value", (snapshot) => {
  const status = snapshot.val();
  console.log("Status value:", status);
  document.getElementById("firebase-status").textContent = status || "No status";
});

// 🗺️ Google Maps setup
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 32.9029, lng: -96.5639 },
    zoom: 12,
  });

  new google.maps.Marker({
    position: { lat: 32.9029, lng: -96.5639 },
    map: map,
    title: "A1 Affordable Plumbing",
  });
}

// 🚀 Load Google Maps dynamically
function loadGoogleMaps() {
  const script = document.createElement("script");
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDeVLmKQXCMN_JZNwFL9OhfCQKVRHsVNy4&callback=initMap";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", loadGoogleMaps);
