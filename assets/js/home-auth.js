'use strict';

/**
 * Home page authentication check with Supabase integration
 */

let useSupabase = false;

// Check authentication when home page loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Supabase to initialize
  setTimeout(() => {
    if (window.supabaseAuth && window.supabaseAuth.isConfigured()) {
      useSupabase = true;
      console.log('✅ Using Supabase for home page auth');
    } else {
      useSupabase = false;
      console.log('📱 Using localStorage for home page auth');
    }
    
    checkHomePageAuth();
    updateNavigationForAuthenticatedUser();
    setupNavigationHandlers();
  }, 1000);
});

/**
 * Setup proper navigation handlers to prevent unwanted redirects
 */
function setupNavigationHandlers() {
  // Ensure Profile navigation link goes to section, not profile.html
  const profileNavLink = document.querySelector('.navbar-list a[data-nav-link]');
  if (profileNavLink && profileNavLink.textContent.trim().toLowerCase() === 'profile') {
    profileNavLink.href = '#profile';
    
    // Remove any existing click handlers that might redirect
    profileNavLink.onclick = null;
    
    // Add proper click handler for smooth scrolling
    profileNavLink.addEventListener('click', function(e) {
      e.preventDefault();
      const profileSection = document.getElementById('profile');
      if (profileSection) {
        profileSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        console.log('📍 Navigating to profile section on same page');
      }
    });
    
    console.log('✅ Profile navigation properly configured for same-page navigation');
  }
}

// Check if user is authenticated to access home page
const checkHomePageAuth = async function() {
  if (useSupabase) {
    try {
      const supabase = window.supabaseAuth.supabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('🔓 User not authenticated via Supabase, redirecting to welcome page...');
        window.location.href = 'welcome.html';
        return;
      }
      
      console.log('✅ User authenticated via Supabase, welcome to home page:', session.user.email);
      
      // Get user profile from localStorage (set by auth state listener)
      const userProfile = JSON.parse(localStorage.getItem('sportsense_user') || '{}');
      updateHomePageWithUserInfo(userProfile, session.user);
      
    } catch (error) {
      console.error('❌ Error checking Supabase session, redirecting to welcome page');
      window.location.href = 'welcome.html';
    }
  } else {
    // Use localStorage fallback
    const savedUser = localStorage.getItem('sportsense_user');
    
    if (!savedUser) {
      console.log('🔓 User not authenticated, redirecting to welcome page...');
      window.location.href = 'welcome.html';
      return;
    }
    
    try {
      const user = JSON.parse(savedUser);
      console.log('✅ User authenticated, welcome to home page:', user.name);
      updateHomePageWithUserInfo(user);
    } catch (error) {
      console.error('❌ Error parsing user data, redirecting to welcome page');
      localStorage.removeItem('sportsense_user');
      window.location.href = 'welcome.html';
    }
  }
};

// Update home page with authenticated user information
const updateHomePageWithUserInfo = function(userProfile, supabaseUser = null) {
  let userName = '';
  
  if (supabaseUser) {
    // Using Supabase user data
    userName = userProfile.name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
  } else {
    // Using localStorage user data
    userName = userProfile.name || 'User';
  }
  
  const firstName = userName.split(' ')[0];
  
  // Update hero title with personalized greeting
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.textContent = `Welcome back, ${firstName}!`;
  }
  
  // Update hero subtitle
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.innerHTML = `<strong class="strong">Hello</strong> ${firstName}`;
  }
  
  // Update section text to be more personalized
  const sectionText = document.querySelector('.hero-content .section-text');
  if (sectionText) {
    sectionText.textContent = 'Ready to continue your AI-powered fitness journey? Access your personalized dashboard, start live workout sessions, and track your progress with cutting-edge technology.';
  }
  
  // Update CTA button to go to dashboard
  const ctaButton = document.querySelector('.hero-content .btn-primary');
  if (ctaButton) {
    ctaButton.textContent = 'Go to Dashboard';
    ctaButton.href = 'dashboard.html';
  }
  
  // Update profile overview section
  updateProfileOverview(userProfile, supabaseUser);
  
  // Ensure profile section is visible and properly set up
  ensureProfileSectionSetup();
};

// Update profile overview section with user data
const updateProfileOverview = async function(userProfile, supabaseUser = null) {
  let userName = '';
  let userEmail = '';
  
  if (supabaseUser) {
    userName = userProfile.name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
    userEmail = supabaseUser.email;
  } else {
    userName = userProfile.name || 'User';
    userEmail = userProfile.email || 'user@example.com';
  }
  
  // Try to get profile data from database first
  let profileData = {};
  
  try {
    if (supabaseUser && window.supabaseAuth && window.supabaseAuth.getUserProfile) {
      console.log('Loading profile data from database for home page...');
      const dbProfile = await window.supabaseAuth.getUserProfile(supabaseUser.id);
      if (dbProfile) {
        profileData = dbProfile;
        console.log('Profile data loaded from database:', dbProfile);
      }
    }
  } catch (error) {
    console.error('Error loading profile from database:', error);
  }
  
  // Fallback to localStorage if database fails
  if (!profileData.personalInfo) {
    profileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    console.log('Using localStorage profile data as fallback');
  }
  
  // Update user info
  const userNameElement = document.querySelector('[data-user-name]');
  const userEmailElement = document.querySelector('[data-user-email]');
  const userInitialsElement = document.querySelector('[data-user-initials]');
  
  if (userNameElement) userNameElement.textContent = userName;
  if (userEmailElement) userEmailElement.textContent = userEmail;
  if (userInitialsElement) {
    const initials = userName.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase();
    userInitialsElement.textContent = initials;
  }
  
  // Update personal stats
  if (profileData.personalInfo) {
    const ageElement = document.querySelector('[data-user-age]');
    const heightElement = document.querySelector('[data-user-height]');
    const weightElement = document.querySelector('[data-user-weight]');
    
    if (ageElement) ageElement.textContent = profileData.personalInfo.age || '--';
    if (heightElement) heightElement.textContent = profileData.personalInfo.height ? `${profileData.personalInfo.height} cm` : '-- cm';
    if (weightElement) weightElement.textContent = profileData.personalInfo.weight ? `${profileData.personalInfo.weight} kg` : '-- kg';
  }
  
  // Update fitness goals
  if (profileData.fitnessGoals) {
    const fitnessLevelElement = document.querySelector('[data-fitness-level]');
    const fitnessGoalElement = document.querySelector('[data-fitness-goal]');
    const workoutFrequencyElement = document.querySelector('[data-workout-frequency]');
    const workoutDurationElement = document.querySelector('[data-workout-duration]');
    
    if (fitnessLevelElement) {
      const levelMap = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
        'expert': 'Expert'
      };
      fitnessLevelElement.textContent = levelMap[profileData.fitnessGoals.fitnessLevel] || 'Beginner';
    }
    
    if (fitnessGoalElement) {
      const goalMap = {
        'weight-loss': 'Weight Loss',
        'muscle-gain': 'Muscle Gain',
        'endurance': 'Build Endurance',
        'strength': 'Build Strength',
        'general-fitness': 'General Fitness',
        'flexibility': 'Improve Flexibility'
      };
      fitnessGoalElement.textContent = goalMap[profileData.fitnessGoals.goal] || 'General Fitness';
    }
    
    if (workoutFrequencyElement) {
      workoutFrequencyElement.textContent = `${profileData.fitnessGoals.workoutFrequency || '3-4'} times/week`;
    }
    
    if (workoutDurationElement) {
      workoutDurationElement.textContent = `${profileData.fitnessGoals.workoutDuration || '30'} minutes`;
    }
  }
  
  // Update activity data (simulated for now)
  updateActivityData();
};

// Update activity data with simulated values
const updateActivityData = function() {
  // Get activity data from localStorage or generate simulated data
  const activityData = JSON.parse(localStorage.getItem('userActivity') || '{}');
  
  const totalSessions = activityData.totalSessions || Math.floor(Math.random() * 50) + 10;
  const totalTime = activityData.totalTime || Math.floor(Math.random() * 1200) + 300;
  const streak = activityData.streak || Math.floor(Math.random() * 15) + 1;
  const weeklyProgress = activityData.weeklyProgress || Math.floor(Math.random() * 100) + 1;
  
  // Update DOM elements
  const totalSessionsElement = document.querySelector('[data-total-sessions]');
  const totalTimeElement = document.querySelector('[data-total-time]');
  const streakElement = document.querySelector('[data-streak]');
  const progressElement = document.querySelector('[data-progress-width]');
  
  if (totalSessionsElement) totalSessionsElement.textContent = totalSessions;
  if (totalTimeElement) totalTimeElement.textContent = totalTime;
  if (streakElement) streakElement.textContent = streak;
  if (progressElement) {
    progressElement.style.width = `${weeklyProgress}%`;
  }
  
  // Save simulated data back to localStorage
  const newActivityData = {
    totalSessions,
    totalTime,
    streak,
    weeklyProgress,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem('userActivity', JSON.stringify(newActivityData));
  
  console.log('Activity data updated:', newActivityData);
};

/**
 * Ensure profile section is properly set up for navigation
 */
function ensureProfileSectionSetup() {
  const profileSection = document.getElementById('profile');
  if (profileSection) {
    // Make sure the section is visible
    profileSection.style.display = 'block';
    console.log('✅ Profile section confirmed as visible');
    
    // Add smooth scroll behavior for profile navigation
    const profileNavLink = document.querySelector('a[href="#profile"]');
    if (profileNavLink) {
      profileNavLink.addEventListener('click', function(e) {
        e.preventDefault();
        profileSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        console.log('📍 Scrolling to profile section');
      });
    }
  } else {
    console.warn('⚠️ Profile section not found');
  }
}

/**
 * Open profile page with specific section focus
 */
function openProfilePage(section = 'personal') {
  // Store the section to focus on in localStorage
  localStorage.setItem('profileSection', section);
  
  // Navigate to profile page
  window.location.href = 'profile.html';
}

// Make function available globally
window.openProfilePage = openProfilePage;

// Update navigation for authenticated users
const updateNavigationForAuthenticatedUser = function() {
  const savedUser = localStorage.getItem('sportsense_user');
  
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      
      // Update navigation to show authenticated user options
      const navbarList = document.querySelector('.navbar-list');
      if (navbarList) {
        // Ensure Profile link stays as anchor link (don't change it to profile.html)
        const profileLink = navbarList.querySelector('a[href="profile.html"], a[data-nav-link]');
        const profileLinkElement = navbarList.querySelector('a[data-nav-link]');
        
        // Find the profile link specifically
        const navLinks = navbarList.querySelectorAll('a[data-nav-link]');
        navLinks.forEach(link => {
          if (link.textContent.trim().toLowerCase() === 'profile') {
            // Make sure it's an anchor link to the profile section
            link.href = '#profile';
            console.log('✅ Profile navigation link ensured as anchor');
          }
        });
        
        // Add logout link if not present
        const logoutLink = navbarList.querySelector('.logout-link');
        if (!logoutLink) {
          const logoutLi = document.createElement('li');
          logoutLi.innerHTML = '<a href="#" class="navbar-link logout-link" onclick="logout()">Logout</a>';
          navbarList.appendChild(logoutLi);
        }
        
        // Remove login link since user is authenticated
        const loginLink = navbarList.querySelector('a[href="login.html"]');
        if (loginLink) {
          loginLink.parentElement.style.display = 'none';
        }
      }
      
      // Update header CTA button
      const headerCta = document.querySelector('.header .btn-secondary');
      if (headerCta) {
        headerCta.textContent = `Hi, ${user.name.split(' ')[0]}`;
        headerCta.href = 'dashboard.html';
        headerCta.style.pointerEvents = 'auto';
      }
      
    } catch (error) {
      console.error('Error updating navigation for authenticated user');
    }
  }
};

// Logout functionality for home page
const logout = async function() {
  const confirmation = confirm('Are you sure you want to logout?');
  
  if (confirmation) {
    console.log('🔓 User logging out from home page...');
    
    if (useSupabase) {
      try {
        const supabase = window.supabaseAuth.supabase();
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('❌ Error signing out from Supabase:', error);
        } else {
          console.log('✅ Successfully signed out from Supabase');
        }
      } catch (error) {
        console.error('❌ Error during Supabase logout:', error);
      }
    }
    
    // Clear local storage (will be cleared by auth state listener too)
    localStorage.removeItem('sportsense_user');
    localStorage.removeItem('sportsense_session');
    
    // Redirect to welcome page
    window.location.href = 'welcome.html';
  }
};

// Export logout function for global access
window.logout = logout;

console.log('✅ Home Page Authentication Ready');
