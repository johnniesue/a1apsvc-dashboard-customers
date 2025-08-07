// Initialize Firebase
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

// Get Realtime Database reference
const realtimeDB = firebase.database();
const statusRef = realtimeDB.ref("status");

// Write a test value (optional)
statusRef.set("Connected");

// Listen for changes and update UI
statusRef.on("value", (snapshot) => {
  const status = snapshot.val();
  console.log("Status value:", status);
  document.getElementById("firebase-status").textContent = status || "No status";
});
