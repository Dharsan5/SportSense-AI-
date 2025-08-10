'use strict';

/**
 * Home page authentication check
 */

// Check authentication when home page loads
document.addEventListener('DOMContentLoaded', function() {
  checkHomePageAuth();
  updateNavigationForAuthenticatedUser();
});

// Check if user is authenticated to access home page
const checkHomePageAuth = function() {
  const savedUser = localStorage.getItem('sportsense_user');
  
  if (!savedUser) {
    // Redirect to welcome page if not authenticated
    console.log('🔓 User not authenticated, redirecting to welcome page...');
    window.location.href = 'welcome.html';
    return;
  }
  
  try {
    const user = JSON.parse(savedUser);
    console.log('✅ User authenticated, welcome to home page:', user.name);
    
    // Update UI with user information
    updateHomePageWithUserInfo(user);
  } catch (error) {
    console.error('❌ Error parsing user data, redirecting to welcome page');
    localStorage.removeItem('sportsense_user');
    window.location.href = 'welcome.html';
  }
};

// Update home page with authenticated user information
const updateHomePageWithUserInfo = function(user) {
  // Update hero title with personalized greeting
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
  }
  
  // Update hero subtitle
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.innerHTML = `<strong class="strong">Hello</strong> ${user.name.split(' ')[0]}`;
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
};

// Update navigation for authenticated users
const updateNavigationForAuthenticatedUser = function() {
  const savedUser = localStorage.getItem('sportsense_user');
  
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      
      // Update navigation to show authenticated user options
      const navbarList = document.querySelector('.navbar-list');
      if (navbarList) {
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
const logout = function() {
  const confirmation = confirm('Are you sure you want to logout?');
  
  if (confirmation) {
    console.log('🔓 User logging out from home page...');
    
    // Clear user data
    localStorage.removeItem('sportsense_user');
    
    // Redirect to welcome page
    window.location.href = 'welcome.html';
  }
};

// Export logout function for global access
window.logout = logout;

console.log('✅ Home Page Authentication Ready');
