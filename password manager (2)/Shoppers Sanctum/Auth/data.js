/*
// Save //data for a user
function saveData(website, name, password) {
  const user = firebase.auth().currentUser;
  if (user) {
    // User is signed in.
    db.collection('manager').doc(user.uid).set({
      website: website,
      name: name,
      password: password,
    })
    .then(() => {
      console.log('User data saved successfully!');
    })
    .catch((error) => {
      console.error('Error saving user data: ', error);
    });
  } else {
    // No user is signed in.
    console.log('No user is signed in.');
  }
}

// Retrieve data for a user
function getData() {
  const user = firebase.auth().currentUser;
  if (user) {
    // User is signed in.
    db.collection('manager').doc(user.uid).get()
    .then((doc) => {
      if (doc.exists) {
        console.log('User data: ', doc.data());
      } else {
        // Doc.data() will be undefined in this case
        console.log('No such document!');
      }
    })
    .catch((error) => {
      console.error('Error getting user data: ', error);
    });
  } else {
    // No user is signed in.
    console.log('No user is signed in.');
  }
}

*/


/*
// Handle form submission
const form = document.getElementById("manager");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const website = document.getElementById("website").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Encrypt the password
  const encryptedPassword = encrypt(password);

  // Get the current user
  const user = firebase.auth().currentUser;

  // Update the user's document or entity
  if (user) {
    const userRef = db.collection("manager").doc();
    userRef.update({
      [website]: {
        username: username,
        password: encryptedPassword
      },
      username: username,
      password: encryptedPassword
    }).then(() => {
      // Display a success message
      alert("Password saved successfully!");
    }).catch((error) => {
      // Display an error message
      alert("Error saving password: " + error.message);
    });
    
  } else {
    // No user is signed in
    alert("Please sign in to save passwords.");
  }
});

*/
