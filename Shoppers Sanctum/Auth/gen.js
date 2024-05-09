// Import the built-in crypto module for secure random number generation
const crypto = require('crypto');
// Import the argon2 library for hashing
const argon2 = require('argon2');

// Get DOM elements
const generatePasswordButton = document.getElementById('generatePasswordButton');
const passwordInput = document.getElementById('password');  // Adjusted to match your HTML
const copyPasswordButton = document.getElementById('copyPasswordButton');  // Ensure you have this button in your HTML

// Event listener for generating password
generatePasswordButton.addEventListener('click', async () => {
  const generatedPassword = generateRandomPassword();
  passwordInput.value = generatedPassword;  // Display generated password

  // Optionally hash the password immediately, if auto-save is intended
  try {
    const hashedPassword = await hashPassword(generatedPassword);
    console.log('Hashed password ready for storage:', hashedPassword);
    // You can save the hashed password to the database here or on form submission
  } catch (error) {
    console.error('Error hashing password:', error);
  }
});

// Event listener for copying password to clipboard
copyPasswordButton.addEventListener('click', () => {
  navigator.clipboard.writeText(passwordInput.value)
    .then(() => alert('Password copied to clipboard!'))
    .catch(err => console.error('Error copying password to clipboard:', err));
});

// Function to generate a random password
function generateRandomPassword() {
  const length = 12;  // Minimum length for a strong password
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let password = '';
  // Generate random characters for the password
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Function to hash a password using Argon2
async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await argon2.hash(plainPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

// Function to verify a password using Argon2 (for reference and possible future use)
async function verifyPassword(hashedPassword, plainPassword) {
  try {
    const passwordMatch = await argon2.verify(hashedPassword, plainPassword);
    return passwordMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
}
