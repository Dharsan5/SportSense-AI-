'use strict';

/**
 * Post Session functionality
 */

// Session data structure
const sessionData = {
  duration: '23:45',
  totalSets: 4,
  totalReps: 40,
  avgWeight: 135,
  formScore: 87,
  improvements: [
    'Maintain consistent depth throughout all reps',
    'Focus on controlled descent speed',
    'Keep knees tracking over toes'
  ],
  timeline: [
    { set: 1, reps: 10, weight: 135, formScore: 92, notes: 'Excellent form, good depth' },
    { set: 2, reps: 10, weight: 135, formScore: 89, notes: 'Slight forward lean on rep 8-9' },
    { set: 3, reps: 10, weight: 135, formScore: 85, notes: 'Depth inconsistent, fatigue showing' },
    { set: 4, reps: 10, weight: 135, formScore: 82, notes: 'Form breakdown, consider reducing weight' }
  ]
};

// Set session date
const setSessionDate = function () {
  const dateElement = document.getElementById('session-date');
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

// Animate form score circle
const animateFormScore = function () {
  const circle = document.querySelector('.form-score-card circle:last-child');
  if (circle) {
    const score = sessionData.formScore;
    const circumference = 2 * Math.PI * 65; // radius = 65
    const strokeDasharray = (score / 100) * circumference;
    
    // Start from 0 and animate to target
    circle.style.strokeDasharray = `0 ${circumference}`;
    
    setTimeout(() => {
      circle.style.transition = 'stroke-dasharray 2s ease-in-out';
      circle.style.strokeDasharray = `${strokeDasharray} ${circumference}`;
    }, 500);
  }
};

// Animate timeline items
const animateTimeline = function () {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 200);
      }
    });
  }, {
    threshold: 0.1
  });

  timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s ease';
    observer.observe(item);
  });
};

// Animate session stats
const animateSessionStats = function () {
  const statItems = document.querySelectorAll('.stat-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          
          // Animate the number counting effect
          const valueElement = entry.target.querySelector('.stat-value');
          if (valueElement) {
            animateCounter(valueElement);
          }
        }, index * 100);
      }
    });
  }, {
    threshold: 0.1
  });

  statItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px) scale(0.9)';
    item.style.transition = 'all 0.5s ease';
    observer.observe(item);
  });
};

// Animate counter numbers
const animateCounter = function (element) {
  const text = element.textContent;
  const number = parseInt(text);
  
  if (isNaN(number)) return;
  
  let current = 0;
  const increment = number / 30; // 30 steps
  const timer = setInterval(() => {
    current += increment;
    if (current >= number) {
      element.textContent = text; // Restore original text
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + text.replace(/\d+/, '');
    }
  }, 50);
};

// Load session data from localStorage if available
const loadSessionData = function () {
  const storedData = localStorage.getItem('sessionData');
  if (storedData) {
    try {
      const data = JSON.parse(storedData);
      // Update the page with actual session data
      console.log('Loaded session data:', data);
      // You can update the DOM elements here with real data
    } catch (e) {
      console.log('Error parsing stored session data:', e);
    }
  }
};

// Share session functionality
const shareSession = function () {
  const shareData = {
    title: 'My SportSense AI Workout Session',
    text: `Just completed a workout session! Form score: ${sessionData.formScore}% 💪`,
    url: window.location.origin
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    navigator.share(shareData).catch(err => {
      console.log('Error sharing:', err);
      fallbackShare();
    });
  } else {
    fallbackShare();
  }
};

// Fallback share function
const fallbackShare = function () {
  const shareText = `Just completed a SportSense AI workout session! Form score: ${sessionData.formScore}% 💪\n\nCheck out SportSense AI: ${window.location.origin}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      showNotification('Session details copied to clipboard!');
    }).catch(() => {
      promptShare(shareText);
    });
  } else {
    promptShare(shareText);
  }
};

// Prompt user to copy share text
const promptShare = function (text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showNotification('Session details copied to clipboard!');
  } catch (err) {
    showNotification('Unable to copy. Please share manually.');
  }
  
  document.body.removeChild(textarea);
};

// Show notification
const showNotification = function (message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 1000;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

// Add CSS for notifications
const addNotificationStyles = function () {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

// Add hover effects to buttons
const addButtonEffects = function () {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    btn.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
};

// Initialize post session page
document.addEventListener('DOMContentLoaded', function () {
  setSessionDate();
  loadSessionData();
  animateFormScore();
  animateTimeline();
  animateSessionStats();
  addButtonEffects();
  addNotificationStyles();
  
  // Add event listener for share button
  const shareBtn = document.querySelector('.btn-secondary');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareSession);
  }
});

// Make shareSession available globally for inline onclick
window.shareSession = shareSession;
