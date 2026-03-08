// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAr6-rTa8yQCxr41JjWysFLHeFxH0C2IMI",
    authDomain: "guraneza-714f7.firebaseapp.com",
    databaseURL: "https://guraneza-714f7-default-rtdb.firebaseio.com",
    projectId: "guraneza-714f7",
    storageBucket: "guraneza-714f7.firebasestorage.app",
    messagingSenderId: "457107620336",
    appId: "1:457107620336:web:1583db305b03528fcf5d35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Authentication UI Controller
class AuthUI {
    constructor() {
        this.auth = auth;
        this.initializeElements();
        this.attachEventListeners();
        this.setupAuthStateObserver();
    }

    initializeElements() {
        // Forms
        this.loginForm = document.getElementById('loginFormElement');
        this.registerForm = document.getElementById('registerFormElement');
        
        // Form containers
        this.loginFormContainer = document.getElementById('loginForm');
        this.registerFormContainer = document.getElementById('registerForm');
        
        // Toggle buttons
        this.loginToggle = document.getElementById('loginToggle');
        this.registerToggle = document.getElementById('registerToggle');
        
        // Buttons
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.forgotPasswordLink = document.getElementById('forgotPasswordLink');
        
        // Input fields
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.regUsername = document.getElementById('regUsername');
        this.regEmail = document.getElementById('regEmail');
        this.regPassword = document.getElementById('regPassword');
        this.regConfirmPassword = document.getElementById('regConfirmPassword');
        this.termsCheckbox = document.getElementById('terms');
        
        // UI Elements
        this.notificationToast = document.getElementById('notificationToast');
        this.notifTitle = document.getElementById('notifTitle');
        this.notifDesc = document.getElementById('notifDesc');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    attachEventListeners() {
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Forgot password
        this.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    }

    setupAuthStateObserver() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                console.log('User is signed in:', user.email);
                // Redirect to home page if already logged in
                // Uncomment the line below if you want auto-redirect
                // window.location.href = 'home.html';
            } else {
                console.log('User is signed out');
                this.enableForms();
            }
        });
    }

    // UI Helper Methods
    showNotification(title, message, isSuccess = false) {
        this.notifTitle.innerText = title;
        this.notifDesc.innerText = message;
        
        if (isSuccess) {
            this.notificationToast.classList.add('success');
            this.notificationToast.querySelector('i').className = 'fas fa-check-circle';
        } else {
            this.notificationToast.classList.remove('success');
            this.notificationToast.querySelector('i').className = 'fas fa-exclamation-circle';
        }
        
        this.notificationToast.classList.add('show');
        
        setTimeout(() => {
            this.notificationToast.classList.remove('show');
        }, 3000);
    }

    showLoading() {
        this.loadingOverlay.classList.add('active');
        this.disableForms();
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('active');
        this.enableForms();
    }

    disableForms() {
        // Disable all inputs and buttons
        const inputs = document.querySelectorAll('input, button, .toggle-btn, .auth-footer a, #forgotPasswordLink');
        inputs.forEach(input => {
            input.disabled = true;
            if (input.classList.contains('auth-footer') || input.classList.contains('forgot-password')) {
                // Skip for containers
            } else {
                input.style.opacity = '0.6';
                input.style.pointerEvents = 'none';
            }
        });
        
        // Special handling for links
        document.querySelectorAll('.auth-footer a, #forgotPasswordLink').forEach(link => {
            link.classList.add('disabled');
        });
    }

    enableForms() {
        // Enable all inputs and buttons
        const inputs = document.querySelectorAll('input, button, .toggle-btn');
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '';
            input.style.pointerEvents = '';
        });
        
        // Re-enable links
        document.querySelectorAll('.auth-footer a, #forgotPasswordLink').forEach(link => {
            link.classList.remove('disabled');
            link.style.opacity = '';
            link.style.pointerEvents = '';
        });
    }

    togglePassword(inputId, icon) {
        const input = document.getElementById(inputId);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    showForm(formType) {
        if (formType === 'login') {
            this.loginFormContainer.classList.add('active');
            this.registerFormContainer.classList.remove('active');
            this.loginToggle.classList.add('active');
            this.registerToggle.classList.remove('active');
        } else {
            this.registerFormContainer.classList.add('active');
            this.loginFormContainer.classList.remove('active');
            this.registerToggle.classList.add('active');
            this.loginToggle.classList.remove('active');
        }
    }

    // Validation Methods
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    // Authentication Methods
    async handleLogin(event) {
        event.preventDefault();
        
        const email = this.loginEmail.value.trim();
        const password = this.loginPassword.value;

        // Validate inputs
        if (!email || !password) {
            this.showNotification('Error', 'Please enter both email and password', false);
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Error', 'Please enter a valid email address', false);
            return;
        }

        this.showLoading();

        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            
            this.showNotification('Welcome back!', `Hello ${user.displayName || 'User'}! Redirecting...`, true);
            
            // Clear form
            this.loginForm.reset();
            
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.hideLoading();
            
            let errorMessage = 'Invalid email or password';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
            }
            
            this.showNotification('Login Failed', errorMessage, false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        // Get form values
        const username = this.regUsername.value.trim();
        const email = this.regEmail.value.trim();
        const password = this.regPassword.value;
        const confirmPassword = this.regConfirmPassword.value;
        const termsChecked = this.termsCheckbox.checked;

        // Validate username
        if (!username) {
            this.showNotification('Error', 'Please enter a username', false);
            return;
        }

        // Validate email
        if (!this.validateEmail(email)) {
            this.showNotification('Error', 'Please enter a valid email address', false);
            return;
        }

        // Validate password
        if (!this.validatePassword(password)) {
            this.showNotification('Error', 'Password must be at least 6 characters', false);
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            this.showNotification('Error', 'Passwords do not match', false);
            return;
        }

        // Validate terms
        if (!termsChecked) {
            this.showNotification('Error', 'Please accept the terms and conditions', false);
            return;
        }

        this.showLoading();

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            // Update profile with username
            await updateProfile(user, {
                displayName: username
            });

            this.showNotification('Success!', 'Account created successfully!', true);

            // Clear form
            this.registerForm.reset();
            
            // Switch to login form after successful registration
            setTimeout(() => {
                this.showForm('login');
                this.hideLoading();
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            this.hideLoading();
            
            let errorMessage = 'Failed to create account';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak';
                    break;
            }
            
            this.showNotification('Registration Failed', errorMessage, false);
        }
    }

    async handleForgotPassword() {
        const email = this.loginEmail.value.trim();
        
        if (!email) {
            this.showNotification('Error', 'Please enter your email address', false);
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Error', 'Please enter a valid email address', false);
            return;
        }

        this.showLoading();

        try {
            await sendPasswordResetEmail(this.auth, email);
            this.hideLoading();
            this.showNotification('Password Reset', 'Check your email for reset instructions', true);
        } catch (error) {
            console.error('Password reset error:', error);
            this.hideLoading();
            
            let errorMessage = 'Failed to send reset email';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
            }
            
            this.showNotification('Error', errorMessage, false);
        }
    }

    async handleLogout() {
        try {
            await signOut(this.auth);
            this.showNotification('Signed Out', 'You have been logged out', true);
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error', 'Failed to log out', false);
        }
    }
}

// Initialize the AuthUI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
});

// Export for use in other modules if needed
export { auth, AuthUI };