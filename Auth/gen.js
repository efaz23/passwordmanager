// Import the built-in crypto module for secure random number generation
const crypto = require('crypto');
// Import the argon2 library for hashing
const argon2 = require('argon2');

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

module.exports = { generateRandomPassword, hashPassword };
