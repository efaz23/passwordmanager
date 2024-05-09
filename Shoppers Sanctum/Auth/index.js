// Set up our register function
function register() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  var full_name = document.getElementById('full_name').value;

  // Validate input
  if (!validate_email(email) || !validate_password(password)) {
      alert('Email or Password is Outta Line!!');
      return;
  }

  // Create user with email and password
  firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function() {
          var user = firebase.auth().currentUser;

          // Send verification email
          user.sendEmailVerification().then(function() {
              // Email sent.
              alert('Verification email sent. Please check your email to verify your account.');
          }).catch(function(error) {
              // Handle Errors here.
              console.error('Error sending email verification', error);
              alert('Failed to send verification email: ' + error.message);
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
          alert('User created successfully! Please verify your email before logging in.');
          window.location.href = 'login.html'; // Redirect to login page or home page
      })
      .catch(function(error) {
          // Handle Errors here.
          var error_code = error.code;
          var error_message = error.message;
          alert('Failed to create user: ' + error_message);
      });
}


// Set up our login function
function login() {
  // Get all our input fields
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  // Validate input fields
  if (!validate_email(email) || !validate_password(password)) {
      alert('Email or Password is Outta Line!!');
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
              alert('User Logged In!!');
              window.location.href = 'index.html'; // Redirect to home page
          } else {
              // If email not verified
              alert('Please verify your email first!');
              firebase.auth().signOut(); // Optionally sign the user out
          }
      })
      .catch(function(error) {
          // Firebase will use this to alert of its errors
          var error_message = error.message;
          alert(error_message);
      });
}



document.getElementById('resetPasswordButton').addEventListener('click', function() {
  var emailAddress = document.getElementById('email').value; // Ensure this ID matches your email input field

  // Firebase Auth reference
  var auth = firebase.auth();

  auth.sendPasswordResetEmail(emailAddress).then(function() {
      // Email sent.
      alert('A password rest link will be sent if a account exists with us!');
  }).catch(function(error) {
      // An error happened.
      console.error("Error sending password reset email: ", error);
      alert('Error sending password reset email: ' + error.message);
  });
});


// Validate Functions
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/
  if (expression.test(email) == true) {
    // Email is good
    return true
  } else {
    // Email is not good
    return false
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 6
  if (password < 6) {
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  if (field == null) {
    return false
  }

  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}

