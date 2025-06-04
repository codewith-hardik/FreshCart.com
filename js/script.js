// Global functions for modal controls
function login() {
  console.log("Login function called");
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  loginModal.show();
}

function signup() {
  console.log("Signup function called");
  const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
  signupModal.show();
}

function openLoginModal() {
  console.log("Opening login modal");
  const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
  if (signupModal) {
    signupModal.hide();
  }
  setTimeout(() => {
    login();
  }, 500);
}

function openSignupModal() {
  console.log("Opening signup modal");
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  if (loginModal) {
    loginModal.hide();
  }
  setTimeout(() => {
    signup();
  }, 500);
}

// Main document ready handler
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  console.log("Bootstrap available:", typeof bootstrap !== 'undefined');
  console.log("Modal component available:", typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined');
  
  // Check if Firebase is loaded
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK is not loaded!");
    showErrorToast("Firebase SDK could not be loaded. Please refresh the page or check your internet connection.");
    return;
  }

  // Check if Firebase Auth is available
  try {
    if (!firebase.auth) {
      console.error("Firebase Auth is not available!");
      showErrorToast("Firebase Authentication service is not available.");
      return;
    }
    console.log("Firebase Auth is available");
  } catch (error) {
    console.error("Error checking Firebase Auth:", error);
    showErrorToast("Error initializing authentication service.");
    return;
  }

  // Check if login form exists
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    console.error("Login form not found in the DOM");
  } else {
    console.log("Login form found successfully");
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Disable submit button and show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      console.log("Attempting to login with email:", email);
      
      // Sign in with Firebase
      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in successfully
          console.log("Login successful:", userCredential.user.email);
          
          const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
          loginModal.hide();
          
          // Show success toast
          const loginToast = new bootstrap.Toast(document.getElementById('loginSuccessToast'), {
            delay: 3000,
            animation: true
          });
          loginToast.show();
          
          // Reset form
          this.reset();
        })
        .catch((error) => {
          // Handle errors
          console.error("Login error:", error.code, error.message);
          showErrorToast(error.message);
        })
        .finally(() => {
          // Re-enable button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        });
    });
  }

  // Check if signup form exists
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) {
    console.error("Signup form not found in the DOM");
  } else {
    console.log("Signup form found successfully");
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Disable submit button and show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      
      console.log("Attempting to create account with email:", email);
      
      // Create user with Firebase
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log("Account created successfully:", userCredential.user.email);
          // Update user profile with display name
          return userCredential.user.updateProfile({
            displayName: firstName + " " + lastName
          });
        })
        .then(() => {
          // Successfully created user and updated profile
          console.log("Profile updated with name:", firstName + " " + lastName);
          
          const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
          signupModal.hide();
          
          // Show success toast
          const signupToast = new bootstrap.Toast(document.getElementById('signupSuccessToast'), {
            delay: 3000,
            animation: true
          });
          signupToast.show();
          
          // Reset form
          this.reset();
        })
        .catch((error) => {
          // Handle errors
          console.error("Signup error:", error.code, error.message);
          showErrorToast(error.message);
        })
        .finally(() => {
          // Re-enable button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        });
    });
  }
  
  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      const passwordInput = this.closest('.input-group').querySelector('input');
      const icon = this.querySelector('i');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });

  // Check if user is already logged in - with better error handling
  try {
    if (auth) {
      auth.onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in
          console.log("Auth state changed: User is signed in:", user.email);
          document.querySelectorAll('.login-btn, .signup-btn').forEach(button => {
            button.style.display = 'none';
          });
          
          // Add logout button to navbar if it doesn't exist
          if (!document.getElementById('logoutBtn')) {
            const navbarNav = document.querySelector('.navbar-nav');
            if (navbarNav) {
              const logoutLi = document.createElement('li');
              logoutLi.className = 'nav-item mx-2';
              logoutLi.innerHTML = `<a class="nav-link btn login-btn px-3" id="logoutBtn" href="#">Logout</a>`;
              navbarNav.appendChild(logoutLi);
              
              // Add event listener to logout button
              document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                auth.signOut().then(() => {
                  console.log("User signed out successfully");
                  // Sign-out successful, show toast
                  const logoutToast = document.getElementById('logoutSuccessToast');
                  if (logoutToast) {
                    const toast = new bootstrap.Toast(logoutToast, {
                      delay: 3000,
                      animation: true
                    });
                    toast.show();
                  }
                  
                  // Show login and signup buttons again
                  document.querySelectorAll('.login-btn, .signup-btn').forEach(button => {
                    button.style.display = 'block';
                  });
                  
                  // Remove logout button
                  this.parentElement.remove();
                }).catch((error) => {
                  // An error happened
                  console.error("Sign out error:", error);
                  showErrorToast(error.message);
                });
              });
            } else {
              console.error("Navbar nav element not found");
            }
          }
        } else {
          console.log("Auth state changed: User is signed out");
        }
      });
    } else {
      console.error("Auth is not available for onAuthStateChanged");
    }
  } catch (error) {
    console.error("Error setting up auth state observer:", error);
  }
});

// Error toast function - keep this outside any event handlers
function showErrorToast(message) {
  // Create a more user-friendly error message
  let friendlyMessage = message;
  
  // Map common Firebase error codes to user-friendly messages
  if (message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
    friendlyMessage = "Invalid email or password. Please try again.";
  } else if (message.includes('auth/email-already-in-use')) {
    friendlyMessage = "This email is already registered. Please login instead.";
  } else if (message.includes('auth/weak-password')) {
    friendlyMessage = "Please use a stronger password (at least 6 characters).";
  } else if (message.includes('auth/invalid-email')) {
    friendlyMessage = "Please enter a valid email address.";
  } else if (message.includes('auth/network-request-failed')) {
    friendlyMessage = "Network error. Please check your internet connection.";
  }
  
  // Create a new toast element
  const toastContainer = document.querySelector('.position-fixed.bottom-0.end-0.p-3');
  if (!toastContainer) {
    console.error("Toast container not found");
    alert(friendlyMessage); // Fallback to alert if toast container is missing
    return;
  }
  
  const toastElement = document.createElement('div');
  toastElement.className = 'toast align-items-center text-white bg-danger border-0';
  toastElement.setAttribute('role', 'alert');
  toastElement.setAttribute('aria-live', 'assertive');
  toastElement.setAttribute('aria-atomic', 'true');
  
  toastElement.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi bi-exclamation-circle me-2"></i>
        ${friendlyMessage}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toastElement);
  
  const errorToast = new bootstrap.Toast(toastElement, {
    delay: 5000,
    animation: true
  });
  
  errorToast.show();
  
  // Remove the toast element after it's hidden
  toastElement.addEventListener('hidden.bs.toast', function () {
    toastElement.remove();
  });
}

// Function to test Firebase connection - can be called from console
function testFirebaseConnection() {
  try {
    console.log("Firebase app:", firebase.app().name);
    console.log("Firebase auth available:", !!firebase.auth());
    console.log("Current user:", firebase.auth().currentUser);
    return "Firebase connection test completed - check console for details";
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return "Firebase connection test failed - check console for error details";
  }
}

// Add this to window so it can be called from the console
window.testFirebaseConnection = testFirebaseConnection;