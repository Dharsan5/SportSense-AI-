'use strict';

/**
 * Live Session functionality
 */

let sessionStartTime = Date.now();
let currentSet = 1;
let currentReps = 0;
let timerInterval;

// Format time function
const formatTime = function (seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Start session timer
const startSessionTimer = function () {
  const timerElement = document.getElementById('session-timer');
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    if (timerElement) {
      timerElement.textContent = formatTime(elapsed);
    }
  }, 1000);
};

// Update workout stats
const updateWorkoutStats = function () {
  const setElement = document.getElementById('current-set');
  const repsElement = document.getElementById('current-reps');
  const weightElement = document.getElementById('current-weight');
  
  if (setElement) setElement.textContent = `${currentSet}/4`;
  if (repsElement) repsElement.textContent = `${currentReps}/10`;
  if (weightElement) weightElement.textContent = '135lbs';
};

// Simulate rep counting
const simulateRepCounting = function () {
  setInterval(() => {
    if (currentReps < 10) {
      currentReps++;
      updateWorkoutStats();
      
      // Add feedback when rep is completed
      if (currentReps % 3 === 0) {
        addFeedbackMessage(`Rep ${currentReps} completed - Great form!`);
      }
    } else if (currentSet < 4) {
      currentSet++;
      currentReps = 0;
      updateWorkoutStats();
      addFeedbackMessage(`Set ${currentSet - 1} completed! Starting set ${currentSet}`);
    }
  }, 4000); // New rep every 4 seconds
};

// Add feedback message
const addFeedbackMessage = function (message) {
  const transcript = document.getElementById('feedback-transcript');
  if (!transcript) return;
  
  const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
  const feedbackItem = document.createElement('div');
  feedbackItem.className = 'feedback-item';
  
  feedbackItem.innerHTML = `
    <span class="timestamp">${formatTime(elapsed)}</span>
    <span class="message">${message}</span>
  `;
  
  transcript.appendChild(feedbackItem);
  transcript.scrollTop = transcript.scrollHeight;
  
  // Remove old messages if too many
  if (transcript.children.length > 10) {
    transcript.removeChild(transcript.firstChild);
  }
};

// Simulate pose detection points animation
const animatePosePoints = function () {
  const points = document.querySelectorAll('.point');
  
  points.forEach((point, index) => {
    setTimeout(() => {
      point.style.opacity = '1';
      point.style.animation = 'pulse 2s infinite';
    }, index * 100);
  });
};

// Simulate form feedback
const simulateFormFeedback = function () {
  const feedbackMessages = [
    "Keep your core engaged throughout the movement",
    "Excellent depth on that squat!",
    "Remember to breathe out on the way up",
    "Perfect knee tracking - well done!",
    "Maintain that chest position",
    "Great control on the eccentric phase",
    "Focus on driving through your heels",
    "Nice tempo - keep it consistent"
  ];
  
  setInterval(() => {
    const randomMessage = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
    addFeedbackMessage(randomMessage);
  }, 8000); // Random feedback every 8 seconds
};

// Update form indicator
const updateFormIndicator = function () {
  const indicator = document.querySelector('.indicator');
  const formText = document.querySelector('.form-indicator span');
  
  if (!indicator || !formText) return;
  
  setInterval(() => {
    const formScores = ['excellent', 'good', 'needs-work'];
    const formTexts = ['Form: Excellent', 'Form: Good', 'Form: Needs Work'];
    const randomIndex = Math.floor(Math.random() * 3);
    
    // Weight towards good form (70% good, 20% excellent, 10% needs work)
    let selectedIndex;
    const random = Math.random();
    if (random < 0.7) selectedIndex = 1; // Good
    else if (random < 0.9) selectedIndex = 0; // Excellent
    else selectedIndex = 2; // Needs work
    
    indicator.className = `indicator ${formScores[selectedIndex]}`;
    formText.textContent = formTexts[selectedIndex];
  }, 3000); // Update every 3 seconds
};

// Add camera feed simulation
const simulateCameraFeed = function () {
  const cameraPlaceholder = document.querySelector('.camera-placeholder');
  
  if (cameraPlaceholder) {
    // Add some visual effects to simulate active camera
    setInterval(() => {
      cameraPlaceholder.style.background = 
        `linear-gradient(${Math.random() * 360}deg, #1a1a1a, #2a2a2a)`;
    }, 5000);
  }
};

// Handle end session
const handleEndSession = function () {
  const endBtn = document.querySelector('.end-session-btn');
  
  if (endBtn) {
    endBtn.addEventListener('click', function (e) {
      if (!confirm('Are you sure you want to end the session?')) {
        e.preventDefault();
        return false;
      }
      
      // Clear intervals
      if (timerInterval) clearInterval(timerInterval);
      
      // Store session data for post-session page
      localStorage.setItem('sessionData', JSON.stringify({
        duration: document.getElementById('session-timer')?.textContent || '0:00',
        sets: currentSet,
        reps: currentReps,
        endTime: new Date().toISOString()
      }));
    });
  }
};

// Add keyboard shortcuts
const addKeyboardShortcuts = function () {
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'Escape':
        // Quick end session
        const endBtn = document.querySelector('.end-session-btn');
        if (endBtn) endBtn.click();
        break;
      case ' ':
        // Pause/resume (simulation)
        e.preventDefault();
        addFeedbackMessage('Session paused - press space to resume');
        break;
    }
  });
};

// Initialize live session
document.addEventListener('DOMContentLoaded', function () {
  startSessionTimer();
  updateWorkoutStats();
  animatePosePoints();
  simulateRepCounting();
  simulateFormFeedback();
  updateFormIndicator();
  simulateCameraFeed();
  handleEndSession();
  addKeyboardShortcuts();
  
  // Initial feedback message
  setTimeout(() => {
    addFeedbackMessage('Session started! Let\'s begin with some warm-up squats.');
  }, 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
  if (timerInterval) clearInterval(timerInterval);
});
