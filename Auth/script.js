// Firebase password storage function
const savePasswordToFirebase = (website, username, password) => {
    if (!firebase.auth().currentUser) {
        alert("Not logged in. Please log in to save passwords.");
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref('passwords/' + userId).push({
        website: website,
        username: username,
        password: password  // Consider encrypting this password before storage in production
    }).then(() => {
        alert("Password Saved");
    }).catch(error => {
        console.error("Error saving password: ", error);
        alert("Failed to save password: " + error.message);
    });
};

// Function to mask passwords in UI
function maskPassword(pass) {
    return '*'.repeat(pass.length);
}

// Function to copy password to clipboard
function copyText(txt) {
    navigator.clipboard.writeText(txt).then(() => {
        document.getElementById("alert").style.display = "inline";
        setTimeout(() => {
            document.getElementById("alert").style.display = "none";
        }, 2000);
    }, () => {
        alert("Clipboard copying failed");
    });
}

// Function to delete a password
const deletePassword = (website) => {
    if (!firebase.auth().currentUser) {
        alert("Not logged in. Please log in to delete passwords.");
        return;
    }
    const userId = firebase.auth().currentUser.uid;
    const passwordsRef = firebase.database().ref('passwords/' + userId);
    passwordsRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().website === website) {
                passwordsRef.child(childSnapshot.key).remove().then(() => {
                    alert(`Successfully deleted ${website}'s password`);
                }).catch(error => {
                    alert("Failed to delete password: " + error.message);
                });
            }
        });
    });
};

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
        alert("Please fill all the fields before submitting.");
        return;
    }

    savePasswordToFirebase(website, username, password);
});

// Handle authentication state changes
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("User is signed in");
        showPasswords();  // Refresh passwords on auth state change
    } else {
        console.log("User is signed out");
    }
});

document.getElementById('logOut').addEventListener('click', function() {
    auth.signOut().then(function() {
        localStorage.clear(); // or sessionStorage.clear();
        window.location.href = 'login.html';
    }).catch(function(error) {
        console.error(error);
    });
});