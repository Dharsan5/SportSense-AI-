'use strict';

/**
 * Dashboard functionality with session management
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuthenticationStatus();
  initializeDashboard();
});

// Check if user is logged in
const checkAuthenticationStatus = function() {
  const savedUser = localStorage.getItem('sportsense_user');
  
  if (!savedUser) {
    // Show authentication prompt instead of immediate redirect
    console.log('🔓 User not authenticated, showing auth prompt...');
    showAuthenticationPrompt();
    return false;
  }
  
  try {
    const user = JSON.parse(savedUser);
    console.log('✅ User authenticated:', user.name);
    
    // Update UI with user information
    updateUserInfo(user);
    return true;
  } catch (error) {
    console.error('❌ Error parsing user data, showing auth prompt');
    localStorage.removeItem('sportsense_user');
    showAuthenticationPrompt();
    return false;
  }
};

// Show authentication prompt overlay
const showAuthenticationPrompt = function() {
  // Create overlay if it doesn't exist
  let overlay = document.getElementById('auth-prompt-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-prompt-overlay';
    overlay.className = 'auth-prompt-overlay';
    overlay.innerHTML = `
      <div class="auth-prompt-content">
        <div class="auth-prompt-header">
          <ion-icon name="barbell-sharp" class="auth-prompt-icon"></ion-icon>
          <h2>Welcome to SportSense AI</h2>
        </div>
        <p>Sign up to unlock your personalized AI fitness dashboard and start your journey to better health!</p>
        <div class="auth-prompt-buttons">
          <a href="signup.html" class="btn btn-primary">Sign Up</a>
          <a href="login.html" class="btn btn-secondary">Login</a>
        </div>
        <a href="welcome.html" class="auth-prompt-close">&times;</a>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Add styles for the overlay
    const style = document.createElement('style');
    style.textContent = `
      .auth-prompt-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }
      
      .auth-prompt-content {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 1px solid rgba(255, 154, 1, 0.2);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        max-width: 500px;
        width: 90%;
        position: relative;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .auth-prompt-header {
        margin-bottom: 20px;
      }
      
      .auth-prompt-icon {
        font-size: 3rem;
        color: #ff9a01;
        margin-bottom: 15px;
      }
      
      .auth-prompt-content h2 {
        color: #fff;
        font-size: 2rem;
        margin-bottom: 15px;
        font-family: var(--ff-catamaran);
      }
      
      .auth-prompt-content p {
        color: #ccc;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 30px;
      }
      
      .auth-prompt-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .auth-prompt-buttons .btn {
        min-width: 120px;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .auth-prompt-close {
        position: absolute;
        top: 15px;
        right: 20px;
        color: #ccc;
        font-size: 2rem;
        text-decoration: none;
        transition: color 0.3s ease;
      }
      
      .auth-prompt-close:hover {
        color: #ff9a01;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @media (max-width: 768px) {
        .auth-prompt-content {
          padding: 30px 20px;
        }
        .auth-prompt-buttons {
          flex-direction: column;
          align-items: center;
        }
        .auth-prompt-buttons .btn {
          width: 100%;
          max-width: 200px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  overlay.style.display = 'flex';
};

// Update dashboard with user information
const updateUserInfo = function(user) {
  // Update welcome message if element exists
  const welcomeElement = document.querySelector('.hero-title');
  if (welcomeElement) {
    welcomeElement.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
  }
  
  // Update any other user-specific elements
  const userNameElements = document.querySelectorAll('[data-user-name]');
  userNameElements.forEach(element => {
    element.textContent = user.name;
  });
};

// Initialize dashboard functionality
const initializeDashboard = function() {
  setCurrentDate();
  animateReadinessScore();
  initializeCharts();
};

// Set current date
const setCurrentDate = function () {
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
  }
};

// Animate readiness score on load
const animateReadinessScore = function () {
  const circle = document.querySelector('.readiness-card circle:last-child');
  if (circle) {
    const score = 85; // Current score
    const circumference = 2 * Math.PI * 90; // radius = 90
    const strokeDasharray = (score / 100) * circumference;
    
    // Start from 0 and animate to target
    circle.style.strokeDasharray = `0 ${circumference}`;
    
    setTimeout(() => {
      circle.style.transition = 'stroke-dasharray 2s ease-in-out';
      circle.style.strokeDasharray = `${strokeDasharray} ${circumference}`;
    }, 500);
  }
};

// Animate metric cards on scroll
const animateMetricCards = function () {
  const cards = document.querySelectorAll('.metric-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, {
    threshold: 0.1
  });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
};

// Update readiness score based on metrics (simulation)
const updateReadinessScore = function () {
  // This would normally connect to real data
  const sleepQuality = 85; // Good sleep
  const hrvScore = 90;     // Optimal HRV
  const restingHR = 85;    // Normal resting HR
  
  const averageScore = Math.round((sleepQuality + hrvScore + restingHR) / 3);
  
  const scoreElement = document.querySelector('.readiness-score .score');
  const labelElement = document.querySelector('.readiness-score .label');
  
  if (scoreElement && labelElement) {
    scoreElement.textContent = averageScore;
    
    if (averageScore >= 90) {
      labelElement.textContent = 'Excellent';
    } else if (averageScore >= 80) {
      labelElement.textContent = 'Ready';
    } else if (averageScore >= 70) {
      labelElement.textContent = 'Good';
    } else {
      labelElement.textContent = 'Rest';
    }
  }
};

// Add hover effects to start session button
const addButtonEffects = function () {
  const startBtn = document.querySelector('.start-session-btn');
  
  if (startBtn) {
    startBtn.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    startBtn.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
  setCurrentDate();
  animateReadinessScore();
  animateMetricCards();
  updateReadinessScore();
  addButtonEffects();
});

// Add some dynamic data updates (simulation)
setInterval(() => {
  // Simulate real-time updates (would connect to actual APIs)
  const timeElement = document.querySelector('.dashboard-date');
  if (timeElement) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    timeElement.textContent = now.toLocaleDateString('en-US', options);
  }
}, 60000); // Update every minute

// Logout functionality
const logout = function() {
  const confirmation = confirm('Are you sure you want to logout?');
  
  if (confirmation) {
    console.log('🔓 User logging out...');
    
    // Clear user data
    localStorage.removeItem('sportsense_user');
    
    // Redirect to welcome page
    window.location.href = 'welcome.html';
  }
};

// Export logout function for global access
window.logout = logout;

console.log('✅ Dashboard with Authentication Ready');
