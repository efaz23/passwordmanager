// Function to display a message on the screen
function showMessage(message, backgroundColor = 'lightgreen') {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.style.display = 'block';
    messageElement.style.backgroundColor = backgroundColor;

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000); // Hide message after 3 seconds
}

// Set up our register function
function register() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var full_name = document.getElementById('full_name').value;

    // Validate input
    if (!validate_email(email) || !validate_password(password)) {
        showMessage('Email or Password is out of line!!', 'red');
        return;
    }

    // Create user with email and password
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
            var user = firebase.auth().currentUser;

            // Send verification email
            user.sendEmailVerification().then(function() {
                // Email sent.
                showMessage('Verification email sent. Please check your email to verify your account.');
            }).catch(function(error) {
                // Handle Errors here.
                console.error('Error sending email verification', error);
                showMessage('Failed to send verification email: ' + error.message, 'red');
            });

            // Save user information in the database
            var database_ref = firebase.database().ref();
            var user_data = {
                email: email,
                full_name: full_name,
                last_login: Date.now()
            };
            database_ref.child('users/' + user.uid).set(user_data);

            // Redirect or inform the user
            showMessage('User created successfully! Please verify your email before logging in.');
            setTimeout(() => {
                window.location.href = 'login.html'; // Redirect to login page or home page
            }, 3000);
        })
        .catch(function(error) {
            // Handle Errors here.
            var error_message = error.message;
            showMessage('Failed to create user: ' + error_message, 'red');
        });
}

// Set up our login function
function login() {
    // Get all our input fields
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // Validate input fields
    if (!validate_email(email) || !validate_password(password)) {
        showMessage('Email or Password is out of line!!', 'red');
        return;  // Don't continue running the code
    }

    // Sign in with email and password
    auth.signInWithEmailAndPassword(email, password)
        .then(function(result) {
            // Declare user variable
            var user = result.user;

            // Check if the user's email is verified
            if (user.emailVerified) {
                // Add this user to Firebase Database
                var database_ref = database.ref();

                // Create User data
                var user_data = {
                    last_login: Date.now()
                };

                // Push to Firebase Database
                database_ref.child('users/' + user.uid).update(user_data);

                // Done
                showMessage('Login Successfull!!');
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect to home page
                }, 3000);
            } else {
                // If email not verified
                showMessage('Please verify your email first!', 'red');
                firebase.auth().signOut(); // Optionally sign the user out
            }
        })
        .catch(function(error) {
            // Firebase will use this to alert of its errors
            var error_code = error.code;
            var error_message;

            switch (error_code) {
                case 'auth/invalid-email':
                    error_message = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    error_message = 'This user account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    error_message = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    error_message = 'Incorrect password.';
                    break;
                default:
                    error_message = error.message;
                    break;
            }
            showMessage(error_message, 'red');
        });
}

// Handle log out
document.getElementById('logOut').addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
        console.log('Sign out successful');
        localStorage.clear(); // Clear the localStorage or sessionStorage if you're using it
        window.location.href = 'login.html'; // Redirect to the login page or any other page you want
    }).catch(function(error) {
        console.error('Error signing out: ', error);
        showMessage('Failed to log out: ' + error.message, 'red');
    });
});



let timeoutId; // Variable to store the timeout ID
const TIMEOUT_DURATION = 86400000; // 24 hours in milliseconds (1 day)

// Function to handle timeout and log out the user
function handleTimeout() {
  firebase.auth().signOut().then(() => {
    console.log('User signed out due to timeout');
    localStorage.clear(); // Clear localStorage or sessionStorage
    window.location.href = 'timeout.html'; // Redirect to a timeout page
  }).catch((error) => {
    console.error('Error signing out due to timeout: ', error);
    showMessage('Failed to log out due to timeout: ' + error.message, 'red');
  });
}
// Reset the timeout on user activity
document.addEventListener('click', resetTimeout);
document.addEventListener('keydown', resetTimeout);

// Function to reset the timeout
function resetTimeout() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(handleTimeout, TIMEOUT_DURATION);
}

// Set the initial timeout when the page loads
resetTimeout();

// Get a reference to the back button
const backButton = document.querySelector('button');

// Add an event listener to the back button
backButton.addEventListener('click', () => {
  // Refresh the current page
  window.location.reload();
});

// Prevent going back to the previous page
window.addEventListener('popstate', (event) => {
  event.preventDefault();
  console.log('Prevented going back to the previous page');
});

// Add a new state to the browser history
window.history.pushState(null, null, window.location.href);


document.getElementById('resetPasswordButton').addEventListener('click', function() {
    var emailAddress = document.getElementById('email').value; // Ensure this ID matches your email input field

    // Firebase Auth reference
    var auth = firebase.auth();

    auth.sendPasswordResetEmail(emailAddress).then(function() {
        // Email sent.
        showMessage('A password reset link will be sent if an account exists with us!');
    }).catch(function(error) {
        // An error happened.
        console.error("Error sending password reset email: ", error);
        showMessage('Error sending password reset email: ' + error.message, 'red');
    });
});



// Validate Functions
function validate_email(email) {
    var expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    return password.length >= 6;
}

function validate_field(field) {
    return field != null && field.length > 0;
}



// Handle authentication state changes
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("User is signed in");
        showPasswords();  // Refresh passwords on auth state change
    } else {
        console.log("User is signed out");
    }
});