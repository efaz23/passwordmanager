// Function to display a message on the screen
function showMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000); // Hide message after 3 seconds
}

// Function to encrypt the password
function encryptPassword(plainPassword) {
    const passphrase = 'your-secure-passphrase'; // Use a secure passphrase
    return CryptoJS.AES.encrypt(plainPassword, passphrase).toString();
}

// Function to decrypt the password
function decryptPassword(cipherText) {
    const passphrase = 'your-secure-passphrase'; // Use the same secure passphrase
    const bytes = CryptoJS.AES.decrypt(cipherText, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Firebase password storage function
const savePasswordToFirebase = (website, username, password) => {
    if (!firebase.auth().currentUser) {
        showMessage("Not logged in. Please log in to save passwords.");
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    const encryptedPassword = encryptPassword(password);  // Encrypt password
    firebase.database().ref('passwords/' + userId).push({
        website: website,
        username: username,
        password: encryptedPassword  // Store encrypted password
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

document.getElementById('generatePasswordButton').addEventListener('click', (e) => {
    e.preventDefault();  // Prevent form submission
    const generatedPassword = generateRandomPassword();
    document.getElementById('password').value = generatedPassword;  // Autofill password field
});


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
            tb.innerHTML = `<tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Delete</th>
            </tr>
            <tr>
                <td colspan="4">No Data To Show</td>
            </tr>`;
            return;
        }
        let rows = Object.values(passwordsData).map(element => {
            const decryptedPassword = decryptPassword(element.password);  // Decrypt password
            return `
                <tr>
                    <td>${element.website}</td>
                    <td>${element.username}</td>
                    <td>
                        <div class="password-container">
                            <span>${maskPassword(decryptedPassword)}</span>
                            <img src="copy.svg" class="copy-icon" onclick="copyText('${decryptedPassword}')" alt="Copy">
                        </div>
                    </td>
                    <td><button class="btnsm" onclick="deletePassword('${element.website}')">Delete</button></td>
                </tr>
            `;
        }).join('');
        tb.innerHTML = `<tr>
            <th>Website</th>
            <th>Username</th>
            <th>Password</th>
            <th>Delete</th>
        </tr> ${rows}`;
    });
};

// Call showPasswords when the user is authenticated
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("User is signed in");
        showPasswords();  // Refresh passwords on auth state change
    } else {
        console.log("User is signed out");
    }
});


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