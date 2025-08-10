'use strict';

/**
 * Dashboard functionality
 */

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
