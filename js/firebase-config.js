// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFN7Az5D2166bt9vwQ85BrrTCnKS8M6QM",
  authDomain: "freshcart-9bfa9.firebaseapp.com",
  projectId: "freshcart-9bfa9",
  storageBucket: "freshcart-9bfa9.appspot.com", // Fixed this line
  messagingSenderId: "136628369416",
  appId: "1:136628369416:web:41d23d1adc04fec6d239bd",
  measurementId: "G-1V6CQBD2YQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get auth instance
const auth = firebase.auth();

// Log authentication status for debugging
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    console.log("User is signed out");
  }
});


