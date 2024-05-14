

// Function to display a message on the screen
function showMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000); // Hide message after 3 seconds
}


// Firebase password storage function
const savePasswordToFirebase = (website, username, password) => {
    if (!firebase.auth().currentUser) {
        showMessage("Not logged in. Please log in to save passwords.");
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref('passwords/' + userId).push({
        website: website,
        username: username,
        password: password  // Consider encrypting this password before storage in production
    }).then(() => {
        showMessage("Password Saved");
        showPasswords();  // Update the table after saving
    }).catch(error => {
        console.error("Error saving password: ", error);
        showMessage("Failed to save password: " + error.message);
    });
}


// Function to mask passwords in UI
function maskPassword(pass) {
    return '*'.repeat(pass.length);
}

// Function to copy password to clipboard
function copyText(txt) {
    navigator.clipboard.writeText(txt).then(() => {
        showMessage("Password copied to clipboard");
    }).catch(() => {
        showMessage("Clipboard copying failed");
    });
}


// Function to generate a random password
function generateRandomPassword() {
    const length = 12;  // Minimum length for a strong password
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

// Function to delete a password
const deletePassword = (website) => {
    if (!firebase.auth().currentUser) {
        showMessage("Not logged in. Please log in to delete passwords.");
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    const passwordsRef = firebase.database().ref('passwords/' + userId);
    passwordsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().website === website) {
                passwordsRef.child(childSnapshot.key).remove().then(() => {
                    showMessage(`Successfully deleted ${website}'s password`);
                    showPasswords();  // Update the table after deleting
                }).catch(error => {
                    showMessage("Failed to delete password: " + error.message);
                });
            }
        });
    });
}

// Function to display passwords fetched from Firebase
const showPasswords = () => {
    if (!firebase.auth().currentUser) {
        console.log("No user logged in");
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref('passwords/' + userId).on('value', (snapshot) => {
        const passwordsData = snapshot.val();
        let tb = document.querySelector("table");
        if (!passwordsData) {
            tb.innerHTML = "No Data To Show";
            return;
        }
        let rows = Object.values(passwordsData).map(element => `
            <tr>
                <td>${element.website}</td>
                <td>${element.username}</td>
                <td>
                    <div class="password-container">
                        <span>${maskPassword(element.password)}</span>
                        <img src="copy.svg" class="copy-icon" onclick="copyText('${element.password}')" alt="Copy">
                    </div>
                </td>
                <td><button class="btnsm" onclick="deletePassword('${element.website}')">Delete</button></td>
            </tr>
        `).join('');
        tb.innerHTML = `<tr>
            <th>Website</th>
            <th>Username</th>
            <th>Password</th>
            <th>Delete</th>
        </tr> ${rows}`;
    });
};


// Event listener for adding new passwords
document.querySelector(".btn").addEventListener("click", (e) => {
    e.preventDefault();
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (website.trim() === "" || username.trim() === "" || password.trim() === "") {
        showMessage("Please fill all the fields before submitting.");
        return;
    }

    savePasswordToFirebase(website, username, password);
})

document.getElementById('generatePasswordButton').addEventListener('click', (e) => {
    e.preventDefault();  // Prevent form submission
    const generatedPassword = generateRandomPassword();
    document.getElementById('password').value = generatedPassword;  // Autofill password field
})

// Handle authentication state changes
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("User is signed in");
        showPasswords();  // Refresh passwords on auth state change
    } else {
        console.log("User is signed out");
    }
})

document.getElementById('logOut').addEventListener('click', function() {
    auth.signOut().then(function() {
        localStorage.clear(); // or sessionStorage.clear();
        window.location.href = 'login.html';
    }).catch(function(error) {
        console.error(error);
    });
})