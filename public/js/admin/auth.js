import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "../app.js";

const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const authToggleLink = document.getElementById('auth-toggle-link');
const dashboardSection = document.getElementById('dashboard-section');

let isLoginView = true;

function toggleAuthView(showLogin) {
    isLoginView = showLogin;
    document.getElementById('auth-title').textContent = isLoginView ? 'Login' : 'Create Account';
    document.getElementById('auth-submit-btn').textContent = isLoginView ? 'Login' : 'Sign Up';
    document.getElementById('auth-toggle-prompt').textContent = isLoginView ? "No account?" : "Already have an account?";
    authToggleLink.textContent = isLoginView ? 'Create one' : 'Login';
    authError.textContent = '';
}

async function handleLoginFormSubmit(e) {

    e.preventDefault();

    authError.textContent = '';

    const email = e.target['login-email'].value.trim();
    const password = e.target['login-password'].value;

    try {

        if (isLoginView) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }

    } catch (error) {

        console.log(error.code);
        console.log(error.message);
    
        switch(error.code) {
    
            case 'auth/invalid-email':
                authError.textContent = 'Please enter a valid email.';
                break;
    
            case 'auth/invalid-credential':
                authError.textContent = 'Incorrect email or password.';
                break;
    
            case 'auth/email-already-in-use':
                authError.textContent = 'This email is already registered.';
                break;
    
            case 'auth/weak-password':
                authError.textContent = 'Password must be at least 6 characters.';
                break;
    
            case 'auth/too-many-requests':
                authError.textContent = 'Too many attempts. Try again later.';
                break;
    
            default:
                authError.textContent = 'Authentication failed.';
        }
    }
}

export function initAuth(onLogin, onLogout) {
    toggleAuthView(true);
    authToggleLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView(!isLoginView); });
    loginForm.addEventListener('submit', handleLoginFormSubmit);

    onAuthStateChanged(auth, user => {
        if (user) {
            authSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            onLogin(user.uid);
        } else {
            authSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            onLogout();
        }
    });
}

export function logout() {
    signOut(auth);
}