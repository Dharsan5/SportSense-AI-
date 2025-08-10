'use strict';

/**
 * SportSense AI Authentication System with Supabase Integration
 * Handles login, signup, and user management
 */

// Global variables
let isLoading = false;
let useSupabase = false;

// Initialize auth system
document.addEventListener('DOMContentLoaded', function() {
  console.log('SportSense AI Auth System Initializing...');
  
  // Check if Supabase is available and configured
  setTimeout(() => {
    if (window.supabaseAuth && window.supabaseAuth.isConfigured()) {
      useSupabase = true;
      console.log('Using Supabase for authentication');
    } else {
      useSupabase = false;
      console.log('Using localStorage for authentication');
    }
    
    // Check if user is already logged in
    checkExistingAuth();
    
    // Initialize form validation
    initializeValidation();
  }, 1000); // Wait for Supabase to initialize
});

// Check for existing authentication
const checkExistingAuth = async function() {
  if (useSupabase) {
    try {
      const supabase = window.supabaseAuth.supabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && (window.location.pathname.includes('login') || window.location.pathname.includes('signup'))) {
        console.log('User already logged in via Supabase:', session.user.email);
        showLoading('Welcome back, ' + (session.user.user_metadata?.full_name || session.user.email) + '!');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
    }
  } else {
    // Use localStorage fallback
    const savedUser = localStorage.getItem('sportsense_user');
    if (savedUser && (window.location.pathname.includes('login') || window.location.pathname.includes('signup'))) {
      try {
        const user = JSON.parse(savedUser);
        console.log('User already logged in via localStorage:', user.name);
        
        showLoading('Welcome back, ' + user.name + '!');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } catch (error) {
        console.error('Error parsing saved user data');
        localStorage.removeItem('sportsense_user');
      }
    }
  }
};

// Handle login form submission
const handleLogin = async function(event) {
  event.preventDefault();
  
  if (isLoading) return;
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Basic validation
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  console.log('Login attempt for:', email);
  
  // Show loading
  showLoading('Signing you in...');
  
  try {
    if (useSupabase) {
      // Supabase authentication
      const supabase = window.supabaseAuth.supabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        hideLoading();
        showError(error.message || 'Login failed. Please check your credentials.');
        console.error('Supabase login error:', error);
        return;
      }
      
      if (data.user) {
        console.log('Supabase login successful');
        updateLoadingMessage('Login successful! Welcome back!');
        
        // User profile will be handled by auth state listener
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } else {
      // localStorage fallback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const users = JSON.parse(localStorage.getItem('sportsense_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('sportsense_user', JSON.stringify(user));
        updateLoadingMessage('Login successful! Welcome back!');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        hideLoading();
        showError('Invalid email or password. Please try again.');
      }
    }
    
  } catch (error) {
    hideLoading();
    showError('An error occurred. Please try again.');
    console.error('Login error:', error);
  }
};

// Handle signup form submission
const handleSignup = async function(event) {
  event.preventDefault();
  
  if (isLoading) return;
  
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    showError('Please fill in all fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  console.log('Signup attempt for:', fullName, email);
  
  // Show loading
  showLoading('Creating your account...');
  
  try {
    if (useSupabase) {
      // Supabase authentication
      const supabase = window.supabaseAuth.supabase();
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName.split(' ')[0]
          }
        }
      });
      
      if (error) {
        hideLoading();
        if (error.message.includes('already registered')) {
          showError('An account with this email already exists. Please login instead.');
        } else {
          showError(error.message || 'Signup failed. Please try again.');
        }
        console.error('Supabase signup error:', error);
        return;
      }
      
      if (data.user) {
        console.log('Supabase signup successful');
        
        if (data.user.email_confirmed_at) {
          // Email already confirmed, proceed to home
          updateLoadingMessage('Account created successfully! Welcome to SportSense AI!');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        } else {
          // Email confirmation required
          updateLoadingMessage('Account created! Please check your email to confirm your account.');
          setTimeout(() => {
            showSuccess('Please check your email and click the confirmation link to activate your account.');
            hideLoading();
          }, 2000);
        }
      }
    } else {
      // localStorage fallback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const users = JSON.parse(localStorage.getItem('sportsense_users') || '[]');
      const emailExists = users.find(u => u.email === email);
      
      if (emailExists) {
        hideLoading();
        showError('An account with this email already exists. Please login instead.');
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        name: fullName,
        email: email,
        password: password,
        created_at: new Date().toISOString(),
        fitness_level: 'beginner',
        goal: 'general-fitness',
        age: null,
        height: null,
        weight: null,
        preferences: {
          voice_enabled: true,
          difficulty_level: 'beginner',
          workout_duration: 30
        }
      };
      
      users.push(newUser);
      localStorage.setItem('sportsense_users', JSON.stringify(users));
      localStorage.setItem('sportsense_user', JSON.stringify(newUser));
      
      updateLoadingMessage('Account created successfully! Welcome to SportSense AI!');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
    
  } catch (error) {
    hideLoading();
    showError('An error occurred. Please try again.');
    console.error('Signup error:', error);
  }
};

// Form validation
const initializeValidation = function() {
  const inputs = document.querySelectorAll('.form-input');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      clearFieldError(this);
    });
  });
};

const validateField = function(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  
  // Remove existing error styling
  field.classList.remove('error');
  
  // Validate based on field type
  switch (fieldName) {
    case 'email':
      if (value && !isValidEmail(value)) {
        field.classList.add('error');
      }
      break;
    case 'password':
      if (value && value.length < 6) {
        field.classList.add('error');
      }
      break;
    case 'confirmPassword':
      const password = document.getElementById('password');
      if (value && password && value !== password.value) {
        field.classList.add('error');
      }
      break;
  }
};

const clearFieldError = function(field) {
  field.classList.remove('error');
};

// Utility functions
const isValidEmail = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Loading functions
const showLoading = function(message = 'Loading...') {
  isLoading = true;
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message');
  
  if (loadingOverlay && loadingMessage) {
    loadingMessage.textContent = message;
    loadingOverlay.classList.add('active');
  }
  
  console.log('Loading:', message);
};

const hideLoading = function() {
  isLoading = false;
  const loadingOverlay = document.getElementById('loading-overlay');
  
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
};

const updateLoadingMessage = function(message) {
  const loadingMessage = document.getElementById('loading-message');
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
};

// Error and success messages
const showError = function(message) {
  showMessage(message, 'error');
};

const showSuccess = function(message) {
  showMessage(message, 'success');
};

const showMessage = function(message, type = 'error') {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.error-message, .success-message');
  existingMessages.forEach(msg => msg.remove());
  
  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = `${type}-message show`;
  messageDiv.textContent = message;
  
  // Insert before the first form element
  const form = document.querySelector('.login-form, .signup-form');
  if (form) {
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
  
  console.log(`${type.toUpperCase()}:`, message);
};

// Add CSS for field validation
const style = document.createElement('style');
style.textContent = `
  .form-input.error {
    border-color: #f44336 !important;
    box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
  }
`;
document.head.appendChild(style);

// Export functions for global access
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;

console.log('SportSense AI Auth System Ready');
