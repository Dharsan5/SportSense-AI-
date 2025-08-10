'use strict';

/**
 * Profile Page JavaScript
 * Handles user profile management, form validation, and data persistence
 */

// DOM elements
const personalInfoForm = document.getElementById('personal-info-form');
const fitnessGoalsForm = document.getElementById('fitness-goals-form');
const preferencesForm = document.getElementById('preferences-form');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');

// Profile data structure
let userProfile = {
  personalInfo: {
    fullName: '',
    email: '',
    age: '',
    height: '',
    weight: ''
  },
  fitnessGoals: {
    fitnessLevel: 'beginner',
    goal: 'general-fitness',
    workoutFrequency: '3-4',
    workoutDuration: '30'
  },
  preferences: {
    voiceEnabled: true,
    emailNotifications: true,
    progressReminders: true,
    difficultyLevel: 'moderate'
  }
};

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Profile page initialized');
  
  // Check authentication
  checkProfileAuth();
  
  // Load user profile data
  loadUserProfile();
  
  // Setup form validation
  setupFormValidation();
  
  // Setup real-time updates
  setupFormListeners();
  
  // Handle section focusing from home page
  handleSectionFocus();
});

/**
 * Check if user is authenticated
 */
async function checkProfileAuth() {
  console.log('Checking profile authentication');
  
  try {
    // Check Supabase session first
    if (window.supabaseClient) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      
      if (session && session.user) {
        console.log('User authenticated via Supabase');
        updateUserGreeting(session.user);
        return;
      }
    }
    
    // Fallback to localStorage - check both possible keys
    let userData = localStorage.getItem('sportsense_user') || localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('User authenticated via localStorage');
      updateUserGreeting(user);
      return;
    }
    
    // No authentication found
    console.log('No authentication found, redirecting to login');
    window.location.href = 'login.html';
    
  } catch (error) {
    console.error('Authentication check failed:', error);
    window.location.href = 'login.html';
  }
}

/**
 * Update user greeting in the UI
 */
function updateUserGreeting(user) {
  const userGreeting = document.querySelector('[data-user-greeting]');
  const userName = document.querySelector('[data-user-name]');
  
  if (user && user.email) {
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    const greeting = getDynamicGreeting();
    
    if (userGreeting) {
      userGreeting.textContent = `${greeting}, ${name}`;
    }
    
    if (userName) {
      userName.textContent = name;
    }
  }
}

/**
 * Get dynamic greeting based on time
 */
function getDynamicGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

/**
 * Load user profile data from storage
 */
async function loadUserProfile() {
  console.log('Loading user profile data');
  
  try {
    // Try to load from Supabase first
    if (window.supabaseClient) {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      
      if (user) {
        // Load profile from Supabase user metadata or profiles table
        await loadSupabaseProfile(user);
        // Load user activity data
        loadUserActivity();
        return;
      }
    }
    
    // Fallback to localStorage
    loadLocalStorageProfile();
    loadUserActivity();
    
  } catch (error) {
    console.error('Error loading profile:', error);
    loadLocalStorageProfile();
    loadUserActivity();
  }
}

/**
 * Load profile data from Supabase
 */
async function loadSupabaseProfile(user) {
  try {
    // Set email (read-only)
    document.getElementById('email').value = user.email;
    
    console.log('Loading profile from database for user:', user.id);
    
    // Try to load from database using the new getUserProfile function
    if (window.supabaseAuth && window.supabaseAuth.getUserProfile) {
      const profileData = await window.supabaseAuth.getUserProfile(user.id);
      
      if (profileData) {
        console.log('Profile data loaded from database:', profileData);
        
        // Populate form fields with database data
        populateFormFields(profileData);
        
        // Update the global userProfile object
        userProfile = profileData;
        
        // Update profile summary
        updateProfileSummary(profileData);
        
        console.log('Profile loaded from database successfully');
        return;
      }
    }
    
    // Fallback: Try to get from user metadata if database fails
    if (user.user_metadata) {
      const metadata = user.user_metadata;
      
      // Personal info
      if (metadata.full_name || metadata.fullName) {
        document.getElementById('fullName').value = metadata.full_name || metadata.fullName;
      }
      if (metadata.age) document.getElementById('age').value = metadata.age;
      if (metadata.height) document.getElementById('height').value = metadata.height;
      if (metadata.weight) document.getElementById('weight').value = metadata.weight;
      
      // Fitness goals
      if (metadata.fitnessLevel) document.getElementById('fitnessLevel').value = metadata.fitnessLevel;
      if (metadata.goal) document.getElementById('goal').value = metadata.goal;
      if (metadata.workoutFrequency) document.getElementById('workoutFrequency').value = metadata.workoutFrequency;
      if (metadata.workoutDuration) document.getElementById('workoutDuration').value = metadata.workoutDuration;
      
      // Preferences
      if (metadata.voiceEnabled !== undefined) document.getElementById('voiceEnabled').checked = metadata.voiceEnabled;
      if (metadata.emailNotifications !== undefined) document.getElementById('emailNotifications').checked = metadata.emailNotifications;
      if (metadata.progressReminders !== undefined) document.getElementById('progressReminders').checked = metadata.progressReminders;
      if (metadata.difficultyLevel) document.getElementById('difficultyLevel').value = metadata.difficultyLevel;
      
      console.log('Profile loaded from Supabase metadata (fallback)');
    }
    
  } catch (error) {
    console.error('Error loading Supabase profile:', error);
    loadLocalStorageProfile();
  }
}

/**
 * Load profile data from localStorage
 */
function loadLocalStorageProfile() {
  try {
    // Check both possible localStorage keys for user data
    let userData = localStorage.getItem('sportsense_user') || localStorage.getItem('userData');
    const profileData = localStorage.getItem('userProfile');
    
    if (userData) {
      const user = JSON.parse(userData);
      document.getElementById('email').value = user.email || '';
      document.getElementById('fullName').value = user.fullName || user.email?.split('@')[0] || '';
    }
    
    if (profileData) {
      const profile = JSON.parse(profileData);
      populateFormFields(profile);
    }
    
    console.log('Profile loaded from localStorage');
    
  } catch (error) {
    console.error('Error loading localStorage profile:', error);
  }
}

/**
 * Populate form fields with profile data
 */
function populateFormFields(profile) {
  // Personal info
  if (profile.personalInfo) {
    const personal = profile.personalInfo;
    if (personal.fullName) document.getElementById('fullName').value = personal.fullName;
    if (personal.age) document.getElementById('age').value = personal.age;
    if (personal.height) document.getElementById('height').value = personal.height;
    if (personal.weight) document.getElementById('weight').value = personal.weight;
  }
  
  // Fitness goals
  if (profile.fitnessGoals) {
    const fitness = profile.fitnessGoals;
    if (fitness.fitnessLevel) document.getElementById('fitnessLevel').value = fitness.fitnessLevel;
    if (fitness.goal) document.getElementById('goal').value = fitness.goal;
    if (fitness.workoutFrequency) document.getElementById('workoutFrequency').value = fitness.workoutFrequency;
    if (fitness.workoutDuration) document.getElementById('workoutDuration').value = fitness.workoutDuration;
  }
  
  // Preferences
  if (profile.preferences) {
    const prefs = profile.preferences;
    if (prefs.voiceEnabled !== undefined) document.getElementById('voiceEnabled').checked = prefs.voiceEnabled;
    if (prefs.emailNotifications !== undefined) document.getElementById('emailNotifications').checked = prefs.emailNotifications;
    if (prefs.progressReminders !== undefined) document.getElementById('progressReminders').checked = prefs.progressReminders;
    if (prefs.difficultyLevel) document.getElementById('difficultyLevel').value = prefs.difficultyLevel;
  }
  
  // Update summary section
  updateProfileSummary(profile);
}

/**
 * Update the profile summary section
 */
function updateProfileSummary(profile) {
  try {
    // Get user data for name and email - check both possible keys
    let userData = localStorage.getItem('sportsense_user') || localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : {};
    
    // Update user name and initials
    const userName = profile.personalInfo?.fullName || user.fullName || user.email?.split('@')[0] || 'User';
    const summaryNameElement = document.querySelector('[data-summary-name]');
    const summaryInitialsElement = document.querySelector('[data-summary-initials]');
    
    if (summaryNameElement) summaryNameElement.textContent = userName;
    if (summaryInitialsElement) {
      const initials = userName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase();
      summaryInitialsElement.textContent = initials;
    }
    
    // Update personal stats
    const summaryAge = document.querySelector('[data-summary-age]');
    const summaryHeight = document.querySelector('[data-summary-height]');
    const summaryWeight = document.querySelector('[data-summary-weight]');
    
    if (summaryAge) summaryAge.textContent = profile.personalInfo?.age || '--';
    if (summaryHeight) summaryHeight.textContent = profile.personalInfo?.height || '--';
    if (summaryWeight) summaryWeight.textContent = profile.personalInfo?.weight || '--';
    
    // Update fitness goals
    const summaryGoal = document.querySelector('[data-summary-goal]');
    const summaryLevel = document.querySelector('[data-summary-level]');
    const summaryFrequency = document.querySelector('[data-summary-frequency]');
    
    if (summaryGoal) {
      const goalMap = {
        'weight-loss': 'Weight Loss',
        'muscle-gain': 'Muscle Gain',
        'endurance': 'Build Endurance',
        'strength': 'Build Strength',
        'general-fitness': 'General Fitness',
        'flexibility': 'Improve Flexibility'
      };
      summaryGoal.textContent = goalMap[profile.fitnessGoals?.goal] || 'General Fitness';
    }
    
    if (summaryLevel) {
      const levelMap = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
        'expert': 'Expert'
      };
      summaryLevel.textContent = levelMap[profile.fitnessGoals?.fitnessLevel] || 'Beginner';
    }
    
    if (summaryFrequency) {
      summaryFrequency.textContent = `${profile.fitnessGoals?.workoutFrequency || '3-4'}x/week`;
    }
    
    // Update activity stats
    const activityData = JSON.parse(localStorage.getItem('userActivity') || '{}');
    const summarySessions = document.querySelector('[data-summary-sessions]');
    const summaryTime = document.querySelector('[data-summary-time]');
    
    if (summarySessions) summarySessions.textContent = activityData.totalSessions || 0;
    if (summaryTime) summaryTime.textContent = activityData.totalTime || 0;
    
  } catch (error) {
    console.error('Error updating profile summary:', error);
  }
}

/**
 * Handle section focusing from home page
 */
function handleSectionFocus() {
  const focusSection = localStorage.getItem('profileSection');
  
  if (focusSection) {
    // Remove the stored section
    localStorage.removeItem('profileSection');
    
    // Scroll to and highlight the specific section
    setTimeout(() => {
      let targetCard = null;
      
      switch(focusSection) {
        case 'personal':
          targetCard = document.querySelector('.profile-card:first-child');
          // Auto-focus on age field for immediate editing
          const ageField = document.getElementById('age');
          if (ageField) {
            ageField.focus();
            ageField.select();
          }
          break;
        case 'goals':
          targetCard = document.querySelector('.profile-card:nth-child(2)');
          break;
        case 'activity':
          targetCard = document.getElementById('activity-summary');
          break;
      }
      
      if (targetCard) {
        // Scroll to the card
        targetCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add highlight effect
        targetCard.classList.add('highlight-card');
        
        // Remove highlight after animation
        setTimeout(() => {
          targetCard.classList.remove('highlight-card');
        }, 3000);
      }
    }, 500);
  }
}

/**
 * Make personal info fields more accessible for editing
 */
function enableQuickEdit() {
  const editableFields = ['age', 'height', 'weight'];
  
  editableFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      // Add quick edit styling
      field.classList.add('quick-edit-field');
      
      // Add click-to-select functionality
      field.addEventListener('click', function() {
        this.select();
      });
      
      // Add validation feedback
      field.addEventListener('input', function() {
        validateFieldInput(this);
      });
    }
  });
}

/**
 * Validate individual field input
 */
function validateFieldInput(field) {
  const value = parseInt(field.value);
  let isValid = true;
  let message = '';
  
  switch(field.id) {
    case 'age':
      isValid = value >= 13 && value <= 100;
      message = isValid ? '' : 'Age must be between 13 and 100';
      break;
    case 'height':
      isValid = value >= 100 && value <= 250;
      message = isValid ? '' : 'Height must be between 100 and 250 cm';
      break;
    case 'weight':
      isValid = value >= 30 && value <= 300;
      message = isValid ? '' : 'Weight must be between 30 and 300 kg';
      break;
  }
  
  // Update field styling
  field.classList.toggle('field-valid', isValid && value);
  field.classList.toggle('field-invalid', !isValid && value);
  
  // Show/hide validation message
  let messageElement = field.parentNode.querySelector('.validation-message');
  if (!messageElement && message) {
    messageElement = document.createElement('div');
    messageElement.className = 'validation-message';
    field.parentNode.appendChild(messageElement);
  }
  
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = message ? 'block' : 'none';
  }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  // Enable quick edit functionality
  enableQuickEdit();
  // Age validation
  const ageInput = document.getElementById('age');
  ageInput.addEventListener('input', function() {
    const age = parseInt(this.value);
    if (age < 13 || age > 100) {
      this.setCustomValidity('Age must be between 13 and 100');
    } else {
      this.setCustomValidity('');
    }
  });
  
  // Height validation
  const heightInput = document.getElementById('height');
  heightInput.addEventListener('input', function() {
    const height = parseInt(this.value);
    if (height < 100 || height > 250) {
      this.setCustomValidity('Height must be between 100 and 250 cm');
    } else {
      this.setCustomValidity('');
    }
  });
  
  // Weight validation
  const weightInput = document.getElementById('weight');
  weightInput.addEventListener('input', function() {
    const weight = parseInt(this.value);
    if (weight < 30 || weight > 300) {
      this.setCustomValidity('Weight must be between 30 and 300 kg');
    } else {
      this.setCustomValidity('');
    }
  });
}

/**
 * Setup form listeners for real-time updates
 */
function setupFormListeners() {
  // Personal info form
  if (personalInfoForm) {
    personalInfoForm.addEventListener('change', updateProfileData);
  }
  
  // Fitness goals form
  if (fitnessGoalsForm) {
    fitnessGoalsForm.addEventListener('change', updateProfileData);
  }
  
  // Preferences form
  if (preferencesForm) {
    preferencesForm.addEventListener('change', updateProfileData);
  }
}

/**
 * Update profile data in memory and save to database
 */
function updateProfileData() {
  // Personal info
  userProfile.personalInfo = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    age: document.getElementById('age').value,
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value
  };
  
  // Fitness goals
  userProfile.fitnessGoals = {
    fitnessLevel: document.getElementById('fitnessLevel').value,
    goal: document.getElementById('goal').value,
    workoutFrequency: document.getElementById('workoutFrequency').value,
    workoutDuration: document.getElementById('workoutDuration').value
  };
  
  // Preferences
  userProfile.preferences = {
    voiceEnabled: document.getElementById('voiceEnabled').checked,
    emailNotifications: document.getElementById('emailNotifications').checked,
    progressReminders: document.getElementById('progressReminders').checked,
    difficultyLevel: document.getElementById('difficultyLevel').value
  };
  
  // Update summary in real-time
  updateProfileSummary(userProfile);
  
  // Auto-save to database (debounced)
  autoSaveProfile();
}

// Auto-save timer
let autoSaveTimer = null;

/**
 * Auto-save profile data to database with debouncing
 */
function autoSaveProfile() {
  // Clear existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  // Set new timer to save after 2 seconds of inactivity
  autoSaveTimer = setTimeout(async () => {
    try {
      console.log('Auto-saving profile data...');
      
      // Save to localStorage immediately
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Save to database if user is authenticated
      const user = await getCurrentUser();
      if (user && window.supabaseAuth && window.supabaseAuth.updateUserProfile) {
        const result = await window.supabaseAuth.updateUserProfile(user.id, userProfile);
        if (result.success) {
          console.log('Profile auto-saved to database');
          showSuccessMessage('Profile updated', 1500); // Brief success message
        } else {
          console.warn('Auto-save failed, saved locally only');
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      // Still save to localStorage as fallback
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, 2000); // 2 second delay
}

/**
 * Get current authenticated user
 */
async function getCurrentUser() {
  try {
    if (window.supabaseClient) {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      return user;
    } else if (window.supabaseAuth && window.supabaseAuth.supabase()) {
      const { data: { user } } = await window.supabaseAuth.supabase().auth.getUser();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Save profile data
 */
async function saveProfile() {
  console.log('Saving profile');
  
  // Validate forms
  if (!validateForms()) {
    return;
  }
  
  // Show loading overlay
  showLoading('Saving your profile...');
  
  try {
    // Update profile data
    updateProfileData();
    
    // Save to Supabase if available
    if (window.supabaseClient) {
      await saveToSupabase();
    }
    
    // Always save to localStorage as backup
    saveToLocalStorage();
    
    // Show success message
    showSuccessMessage('Profile saved successfully!');
    
  } catch (error) {
    console.error('Error saving profile:', error);
    showErrorMessage('Failed to save profile. Please try again.');
  } finally {
    hideLoading();
  }
}

/**
 * Validate all forms
 */
function validateForms() {
  const forms = [personalInfoForm, fitnessGoalsForm, preferencesForm];
  let isValid = true;
  
  forms.forEach(form => {
    if (form && !form.checkValidity()) {
      isValid = false;
      form.reportValidity();
    }
  });
  
  return isValid;
}

/**
 * Save profile to Supabase
 */
async function saveToSupabase() {
  try {
    // Get current user session
    let user = null;
    
    if (window.supabaseClient) {
      const { data: { user: supabaseUser } } = await window.supabaseClient.auth.getUser();
      user = supabaseUser;
    } else if (window.supabaseAuth && window.supabaseAuth.supabase()) {
      const { data: { user: supabaseUser } } = await window.supabaseAuth.supabase().auth.getUser();
      user = supabaseUser;
    }
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('Saving profile to database for user:', user.id);
    
    // Use the new updateUserProfile function from supabase-config.js
    if (window.supabaseAuth && window.supabaseAuth.updateUserProfile) {
      const result = await window.supabaseAuth.updateUserProfile(user.id, userProfile);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile in database');
      }
      
      console.log('Profile successfully saved to database');
    } else {
      // Fallback to metadata update if new functions not available
      const metadata = {
        fullName: userProfile.personalInfo?.fullName,
        age: userProfile.personalInfo?.age,
        height: userProfile.personalInfo?.height,
        weight: userProfile.personalInfo?.weight,
        fitnessLevel: userProfile.fitnessGoals?.fitnessLevel,
        goal: userProfile.fitnessGoals?.goal
      };
      
      const supabase = window.supabaseClient || window.supabaseAuth.supabase();
      const { error } = await supabase.auth.updateUser({
        data: metadata
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Profile saved to Supabase user metadata (fallback)');
    }
    
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
}

/**
 * Save profile to localStorage
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Also update userData with name
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      user.fullName = userProfile.personalInfo.fullName;
      localStorage.setItem('userData', JSON.stringify(user));
    }
    
    console.log('Profile saved to localStorage');
    
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Reset profile to last saved state
 */
function resetProfile() {
  console.log('Resetting profile');
  
  if (confirm('Are you sure you want to reset all changes?')) {
    loadUserProfile();
    showSuccessMessage('Profile reset to last saved state');
  }
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
  if (loadingOverlay && loadingMessage) {
    loadingMessage.textContent = message;
    loadingOverlay.classList.add('active');
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

/**
 * Show success message
 */
function showSuccessMessage(message, duration = 3000) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #22c55e;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 10001;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    z-index: 10001;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 4000);
}

/**
 * Logout function
 */
async function logout() {
  console.log('Logging out user');
  
  try {
    // Clear Supabase session
    if (window.supabaseClient) {
      await window.supabaseClient.auth.signOut();
    }
    
    // Clear localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    
    console.log('User logged out successfully');
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even if logout fails
    window.location.href = 'index.html';
  }
}

// Make functions available globally
window.saveProfile = saveProfile;
window.resetProfile = resetProfile;
window.logout = logout;

/**
 * Load and display user activity data
 */
function loadUserActivity() {
  try {
    // Load activity data from localStorage or generate demo data
    let activityData = JSON.parse(localStorage.getItem('userActivity') || '{}');
    
    // Generate demo data if none exists
    if (!activityData.totalSessions) {
      activityData = generateDemoActivityData();
      localStorage.setItem('userActivity', JSON.stringify(activityData));
    }
    
    // Display activity summary in profile page
    displayActivitySummary(activityData);
    
    console.log('User activity data loaded:', activityData);
    
  } catch (error) {
    console.error('Error loading user activity:', error);
    // Generate demo data as fallback
    const demoData = generateDemoActivityData();
    displayActivitySummary(demoData);
  }
}

/**
 * Generate demo activity data for new users
 */
function generateDemoActivityData() {
  const now = new Date();
  const daysAgo7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const daysAgo30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    totalSessions: Math.floor(Math.random() * 25) + 5,
    totalTime: Math.floor(Math.random() * 600) + 200, // minutes
    weeklyGoal: 150, // minutes per week
    weeklyProgress: Math.floor(Math.random() * 120) + 30,
    streak: Math.floor(Math.random() * 10) + 1,
    lastWorkout: daysAgo7.toISOString(),
    joinDate: daysAgo30.toISOString(),
    favoritedExercises: ['Push-ups', 'Squats', 'Planks'],
    achievements: [
      { name: 'First Workout', date: daysAgo30.toISOString(), icon: '🎯' },
      { name: 'Week Warrior', date: daysAgo7.toISOString(), icon: '🔥' },
      { name: 'Perfect Form', date: daysAgo7.toISOString(), icon: '⭐' }
    ],
    weeklyStats: {
      monday: Math.floor(Math.random() * 60),
      tuesday: Math.floor(Math.random() * 60),
      wednesday: Math.floor(Math.random() * 60),
      thursday: Math.floor(Math.random() * 60),
      friday: Math.floor(Math.random() * 60),
      saturday: Math.floor(Math.random() * 60),
      sunday: Math.floor(Math.random() * 60)
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Display activity summary in the profile page
 */
function displayActivitySummary(activityData) {
  // Create activity summary section if it doesn't exist
  let activitySection = document.getElementById('activity-summary');
  
  if (!activitySection) {
    // Create the activity summary section
    const profileContainer = document.querySelector('.profile-container');
    if (profileContainer) {
      activitySection = createActivitySummarySection(activityData);
      profileContainer.appendChild(activitySection);
    }
  } else {
    // Update existing section
    updateActivitySummarySection(activitySection, activityData);
  }
}

/**
 * Create activity summary section HTML
 */
function createActivitySummarySection(activityData) {
  const section = document.createElement('div');
  section.id = 'activity-summary';
  section.className = 'profile-card activity-summary-card';
  
  const lastWorkoutDate = new Date(activityData.lastWorkout).toLocaleDateString();
  const joinDate = new Date(activityData.joinDate).toLocaleDateString();
  const progressPercentage = Math.min((activityData.weeklyProgress / activityData.weeklyGoal) * 100, 100);
  
  section.innerHTML = `
    <div class="card-header">
      <ion-icon name="analytics" class="card-icon"></ion-icon>
      <h3 class="h3 card-title">Activity Overview</h3>
    </div>
    
    <div class="activity-stats-grid">
      <div class="stat-card">
        <div class="stat-number">${activityData.totalSessions}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">${activityData.totalTime}</div>
        <div class="stat-label">Minutes Trained</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">${activityData.streak}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-number">${Math.round(progressPercentage)}%</div>
        <div class="stat-label">Weekly Goal</div>
      </div>
    </div>
    
    <div class="progress-section">
      <h4>This Week's Progress</h4>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <p class="progress-text">${activityData.weeklyProgress} / ${activityData.weeklyGoal} minutes</p>
    </div>
    
    <div class="quick-stats">
      <div class="quick-stat">
        <span class="quick-stat-label">Last Workout:</span>
        <span class="quick-stat-value">${lastWorkoutDate}</span>
      </div>
      <div class="quick-stat">
        <span class="quick-stat-label">Member Since:</span>
        <span class="quick-stat-value">${joinDate}</span>
      </div>
    </div>
    
    <div class="achievements-section">
      <h4>Recent Achievements</h4>
      <div class="achievements-list">
        ${activityData.achievements.map(achievement => `
          <div class="achievement-item">
            <span class="achievement-icon">${achievement.icon}</span>
            <div class="achievement-info">
              <span class="achievement-name">${achievement.name}</span>
              <span class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  return section;
}

/**
 * Update existing activity summary section
 */
function updateActivitySummarySection(section, activityData) {
  // Update stat numbers
  const statNumbers = section.querySelectorAll('.stat-number');
  if (statNumbers.length >= 4) {
    statNumbers[0].textContent = activityData.totalSessions;
    statNumbers[1].textContent = activityData.totalTime;
    statNumbers[2].textContent = activityData.streak;
    statNumbers[3].textContent = Math.round((activityData.weeklyProgress / activityData.weeklyGoal) * 100) + '%';
  }
  
  // Update progress bar
  const progressFill = section.querySelector('.progress-fill');
  const progressText = section.querySelector('.progress-text');
  if (progressFill && progressText) {
    const progressPercentage = Math.min((activityData.weeklyProgress / activityData.weeklyGoal) * 100, 100);
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `${activityData.weeklyProgress} / ${activityData.weeklyGoal} minutes`;
  }
  
  // Update dates
  const quickStatValues = section.querySelectorAll('.quick-stat-value');
  if (quickStatValues.length >= 2) {
    quickStatValues[0].textContent = new Date(activityData.lastWorkout).toLocaleDateString();
    quickStatValues[1].textContent = new Date(activityData.joinDate).toLocaleDateString();
  }
}

/**
 * Add real-time update listeners to form fields
 */
function initializeSummaryUpdate() {
  // Personal info fields
  const personalFields = ['fullName', 'email', 'age', 'height', 'weight'];
  personalFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', () => {
        updateProfileData();
      });
    }
  });
  
  // Fitness goal fields
  const fitnessFields = ['fitnessLevel', 'goal', 'workoutFrequency', 'workoutDuration'];
  fitnessFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => {
        updateProfileData();
      });
    }
  });
  
  // Preference fields
  const preferenceFields = ['voiceEnabled', 'emailNotifications', 'progressReminders', 'difficultyLevel'];
  preferenceFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => {
        updateProfileData();
      });
    }
  });
}

// Initialize real-time updates when page loads
document.addEventListener('DOMContentLoaded', initializeSummaryUpdate);
