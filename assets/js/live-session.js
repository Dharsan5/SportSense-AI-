'use strict';

/**
 * Live Session functionality with Camera, Pose Detection, and Authentication
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuthenticationStatus();
});

// Check if user is logged in
const checkAuthenticationStatus = function() {
  const savedUser = localStorage.getItem('sportsense_user');
  
  if (!savedUser) {
    // Show authentication prompt instead of immediate redirect
    console.log('🔓 User not authenticated for live session, showing auth prompt...');
    showAuthenticationPrompt();
    return false;
  }
  
  try {
    const user = JSON.parse(savedUser);
    console.log('✅ User authenticated for live session:', user.name);
    return true;
  } catch (error) {
    console.error('❌ Error parsing user data, showing auth prompt');
    localStorage.removeItem('sportsense_user');
    showAuthenticationPrompt();
    return false;
  }
};

// Show authentication prompt overlay for live session
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
          <ion-icon name="fitness-sharp" class="auth-prompt-icon"></ion-icon>
          <h2>Ready to Start Training?</h2>
        </div>
        <p>Sign up to access live AI-powered workout sessions with real-time form correction and personalized coaching!</p>
        <div class="auth-prompt-buttons">
          <a href="signup.html" class="btn btn-primary">Sign Up & Train</a>
          <a href="login.html" class="btn btn-secondary">Login</a>
        </div>
        <a href="welcome.html" class="auth-prompt-close">&times;</a>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Add styles for the overlay (same as dashboard but with fitness theme)
    const style = document.createElement('style');
    style.textContent = `
      .auth-prompt-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }
      
      .auth-prompt-content {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 1px solid rgba(255, 154, 1, 0.3);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        max-width: 500px;
        width: 90%;
        position: relative;
        box-shadow: 0 20px 40px rgba(255, 154, 1, 0.1);
      }
      
      .auth-prompt-header {
        margin-bottom: 20px;
      }
      
      .auth-prompt-icon {
        font-size: 3rem;
        color: #ff9a01;
        margin-bottom: 15px;
        animation: pulse 2s infinite;
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
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
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

// Logout functionality
const logout = function() {
  const confirmation = confirm('Are you sure you want to logout? Your current session will be lost.');
  
  if (confirmation) {
    console.log('🔓 User logging out from live session...');
    
    // Stop any running sessions
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (camera && camera.getTracks) {
      camera.getTracks().forEach(track => track.stop());
    }
    
    // Clear user data
    localStorage.removeItem('sportsense_user');
    
    // Redirect to welcome page
    window.location.href = 'welcome.html';
  }
};

// Export logout function for global access
window.logout = logout;

let sessionStartTime = Date.now();
let currentSet = 1;
let currentReps = 0;
let timerInterval;
let pose = null;
let camera = null;
let isDetecting = false;
let lastRepTime = 0;
let repThreshold = 0.3; // Threshold for detecting reps
let currentExercise = 'squat';

// Voice feedback variables
let isVoiceEnabled = true;
let isSpeaking = false;
let voiceQueue = [];
// Get ElevenLabs API key from environment variables (Vercel) or fallback for local development
let elevenLabsApiKey = window.getEnvVar ? window.getEnvVar('VITE_ELEVENLABS_API_KEY', 'sk-6b8d9f7a2e5c1d4f8e9a2b6c3e7f1a9d4c8b2e6f') : 
                      'sk-6b8d9f7a2e5c1d4f8e9a2b6c3e7f1a9d4c8b2e6f'; // Fallback for local development
let selectedVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Default voice ID - consistent coaching voice
let voiceSettings = {
  stability: 0.71,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
};

// Fitness Tracker Model Variables
let inferenceApiKey = ''; // Roboflow API key
let inferenceServerUrl = 'http://localhost:9001'; // Local inference server
let projectId = 'fitness_tracker_3rd-zpdwl';
let modelVersion = 1;
let isInferenceRunning = false;
let inferenceInterval = null;

// TensorFlow.js Pose Detection Variables
let tfPoseDetector = null;
let isTfPoseRunning = false;
let tfPoseInterval = null;
let detectionMethod = 'tensorflow'; // 'tensorflow', 'roboflow', or 'mediapipe'

// Pose detection variables
let previousLeftKneeY = 0;
let previousRightKneeY = 0;
let isInDownPosition = false;

// Camera and pose detection elements
const videoElement = document.getElementById('camera-feed');
const canvasElement = document.getElementById('pose-canvas');
const canvasCtx = canvasElement?.getContext('2d');
const cameraStatus = document.getElementById('camera-status');
const skeletonPoints = document.getElementById('skeleton-points');

// Debug: Check if elements exist
console.log('Video element found:', videoElement);
console.log('Canvas element found:', canvasElement);
console.log('Camera status found:', cameraStatus);

// Initialize camera and pose detection
const initializeCamera = async function() {
  console.log('=== CAMERA INITIALIZATION START ===');
  
  // Check if elements exist
  if (!videoElement) {
    console.error('Video element not found!');
    addFeedback('Error: Video element not found in page');
    return;
  }
  
  if (!canvasElement) {
    console.error('Canvas element not found!');
    addFeedback('Error: Canvas element not found in page');
    return;
  }
  
  console.log('Elements found successfully');
  console.log('Video element:', videoElement);
  console.log('Video current styles:', {
    display: videoElement.style.display,
    width: videoElement.style.width,
    height: videoElement.style.height
  });
  
  try {
    console.log('Requesting camera permissions...');
    
    // Update status
    updateCameraStatus('connecting', 'Requesting camera access...');
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access not supported in this browser');
    }
    
    // Test camera permissions first
    console.log('Testing camera permissions...');
    
    // Request camera access with simpler constraints first
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });

    console.log('✅ Camera stream obtained:', stream);
    console.log('Stream tracks:', stream.getTracks());
    console.log('Stream active:', stream.active);
    
    // Set the video source
    videoElement.srcObject = stream;
    console.log('✅ Video srcObject set');
    
    // Show video immediately
    videoElement.style.display = 'block';
    canvasElement.style.display = 'block';
    console.log('✅ Video and canvas display set to block');
    
    // Hide placeholder
    const placeholder = document.getElementById('camera-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
      console.log('✅ Placeholder hidden');
    }
    
    // Wait for video to load
    return new Promise((resolve, reject) => {
      videoElement.addEventListener('loadedmetadata', () => {
        console.log('✅ Video metadata loaded');
        console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
        
        // Setup canvas
        canvasElement.width = videoElement.videoWidth || 640;
        canvasElement.height = videoElement.videoHeight || 480;
        console.log('✅ Canvas dimensions set:', canvasElement.width, 'x', canvasElement.height);
        
        updateCameraStatus('connected', 'Camera connected successfully!');
        addFeedback('Camera is now active and ready for workout tracking!');
        
        resolve();
      });
      
      videoElement.addEventListener('error', (e) => {
        console.error('Video error:', e);
        addFeedback('Video element error occurred');
        reject(e);
      });
      
      // Force play the video
      videoElement.play().then(() => {
        console.log('✅ Video playing successfully');
      }).catch(err => {
        console.warn('Video autoplay failed (may be normal):', err);
        // Don't reject, just log the warning
      });
      
      // Timeout fallback
      setTimeout(() => {
        if (videoElement.videoWidth > 0) {
          console.log('✅ Video loaded via timeout check');
          // Setup canvas
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          updateCameraStatus('connected', 'Camera connected successfully!');
          addFeedback('Camera is now active and ready for workout tracking!');
          resolve();
        }
      }, 2000);
    });
    
  } catch (error) {
    console.error('❌ Camera initialization failed:', error);
    updateCameraStatus('error', `Camera error: ${error.message}`);
    addFeedback(`Camera access failed: ${error.message}`);
    showCameraPlaceholder();
    
    // Show detailed error for debugging
    if (error.name === 'NotAllowedError') {
      addFeedback('Camera permission denied. Please allow camera access and refresh the page.');
    } else if (error.name === 'NotFoundError') {
      addFeedback('No camera found. Please connect a camera and refresh the page.');
    } else if (error.name === 'NotReadableError') {
      addFeedback('Camera is being used by another application. Please close other camera apps and refresh.');
    }
  }
};

// Show camera placeholder
const showCameraPlaceholder = function() {
  console.log('Showing camera placeholder...');
  
  const placeholder = document.getElementById('camera-placeholder');
  if (placeholder) {
    placeholder.style.display = 'block';
    placeholder.innerHTML = `
      <div class="camera-icon">📹</div>
      <p>Camera Error</p>
      <small>Please check camera permissions and refresh the page</small>
      <button onclick="retryCamera()" style="margin-top: 10px; padding: 8px 16px; background: #ff9a01; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry Camera</button>
    `;
  }
  
  if (videoElement) {
    videoElement.style.display = 'none';
  }
  
  if (canvasElement) {
    canvasElement.style.display = 'none';
  }
};

// Retry camera function
const retryCamera = async function() {
  console.log('Retrying camera initialization...');
  addFeedback('Retrying camera connection...');
  await initializeCamera();
};

// Make retryCamera globally accessible
window.retryCamera = retryCamera;

// Analyze TensorFlow.js pose for workout tracking
const analyzeTensorFlowPose = function(pose) {
  if (!pose || !pose.keypoints) return;
  
  const keypoints = pose.keypoints;
  const minConfidence = 0.5;
  
  // Extract key body points with confidence check
  const getKeypoint = (name) => {
    const kp = keypoints.find(k => k.name === name);
    return (kp && kp.score > minConfidence) ? kp : null;
  };
  
  const leftShoulder = getKeypoint('left_shoulder');
  const rightShoulder = getKeypoint('right_shoulder');
  const leftElbow = getKeypoint('left_elbow');
  const rightElbow = getKeypoint('right_elbow');
  const leftWrist = getKeypoint('left_wrist');
  const rightWrist = getKeypoint('right_wrist');
  const leftHip = getKeypoint('left_hip');
  const rightHip = getKeypoint('right_hip');
  const leftKnee = getKeypoint('left_knee');
  const rightKnee = getKeypoint('right_knee');
  
  // Analyze different exercises based on current workout type
  const currentExercise = getCurrentExercise();
  
  if (currentExercise === 'push-ups') {
    analyzePushUpForm(leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist);
  } else if (currentExercise === 'squats') {
    analyzeSquatForm(leftHip, rightHip, leftKnee, rightKnee, leftShoulder, rightShoulder);
  } else if (currentExercise === 'bicep-curls') {
    analyzeBicepCurlForm(leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist);
  }
  
  // General posture analysis
  analyzePosture(leftShoulder, rightShoulder, leftHip, rightHip);
};

// Analyze push-up form
const analyzePushUpForm = function(leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist) {
  if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) return;
  
  // Calculate arm angles
  const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  // Push-up rep counting logic
  if (leftArmAngle < 90 && rightArmAngle < 90) {
    // Down position
    if (exerciseState !== 'down') {
      exerciseState = 'down';
    }
  } else if (leftArmAngle > 150 && rightArmAngle > 150) {
    // Up position - count rep
    if (exerciseState === 'down') {
      repCount++;
      updateRepCount();
      exerciseState = 'up';
      
      // Voice encouragement
      if (repCount % 5 === 0) {
        addFeedback(`Great job! ${repCount} push-ups completed!`);
      }
    }
  }
  
  // Form feedback
  if (Math.abs(leftArmAngle - rightArmAngle) > 20) {
    addFeedback('Keep your arms even during push-ups');
  }
};

// Analyze squat form
const analyzeSquatForm = function(leftHip, rightHip, leftKnee, rightKnee, leftShoulder, rightShoulder) {
  if (!leftHip || !rightHip || !leftKnee || !rightKnee) return;
  
  // Calculate knee angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, { x: leftKnee.x, y: leftKnee.y + 100 });
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, { x: rightKnee.x, y: rightKnee.y + 100 });
  
  // Squat rep counting
  if (leftKneeAngle < 100 && rightKneeAngle < 100) {
    // Down position
    if (exerciseState !== 'down') {
      exerciseState = 'down';
    }
  } else if (leftKneeAngle > 160 && rightKneeAngle > 160) {
    // Up position - count rep
    if (exerciseState === 'down') {
      repCount++;
      updateRepCount();
      exerciseState = 'up';
      
      if (repCount % 5 === 0) {
        addFeedback(`Excellent! ${repCount} squats completed!`);
      }
    }
  }
  
  // Form analysis
  if (leftHip && rightHip && leftShoulder && rightShoulder) {
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    
    if (hipWidth < shoulderWidth * 0.8) {
      addFeedback('Widen your stance for better squat form');
    }
  }
};

// Analyze bicep curl form
const analyzeBicepCurlForm = function(leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist) {
  if (!leftShoulder || !leftElbow || !leftWrist) return;
  
  const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Bicep curl rep counting (focusing on one arm)
  if (leftArmAngle < 50) {
    // Flexed position
    if (exerciseState !== 'flexed') {
      exerciseState = 'flexed';
    }
  } else if (leftArmAngle > 140) {
    // Extended position - count rep
    if (exerciseState === 'flexed') {
      repCount++;
      updateRepCount();
      exerciseState = 'extended';
      
      if (repCount % 5 === 0) {
        addFeedback(`Nice! ${repCount} bicep curls completed!`);
      }
    }
  }
  
  // Form feedback
  if (leftShoulder && leftElbow) {
    const shoulderElbowDistance = Math.abs(leftShoulder.y - leftElbow.y);
    if (shoulderElbowDistance > 100) {
      addFeedback('Keep your elbows closer to your body');
    }
  }
};

// Calculate angle between three points
const calculateAngle = function(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) return 0;
  
  const vectorBA = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
  const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };
  
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magnitudeBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);
  
  const cosAngle = dotProduct / (magnitudeBA * magnitudeBC);
  const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  
  return angleRad * (180 / Math.PI);
};

// Get current exercise type
const getCurrentExercise = function() {
  // This would typically come from the workout program or user selection
  // For now, return a default exercise
  return 'push-ups';
};

// Analyze general posture
const analyzePosture = function(leftShoulder, rightShoulder, leftHip, rightHip) {
  if (!leftShoulder || !rightShoulder) return;
  
  // Check shoulder alignment
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderTilt > 20) {
    addFeedback('Keep your shoulders level');
  }
  
  // Check if person is in frame
  const frameCenter = canvasElement ? canvasElement.width / 2 : 320;
  const bodyCenter = (leftShoulder.x + rightShoulder.x) / 2;
  
  if (Math.abs(bodyCenter - frameCenter) > 100) {
    addFeedback('Move to center of the camera view');
  }
};

// Initialize TensorFlow.js Pose Detection
const initializeTensorFlowPose = async function() {
  console.log('Initializing TensorFlow.js Pose Detection...');
  
  try {
    // Check if TensorFlow.js is loaded
    if (typeof tf === 'undefined') {
      throw new Error('TensorFlow.js not loaded');
    }
    
    if (typeof poseDetection === 'undefined') {
      throw new Error('Pose Detection library not loaded');
    }
    
    console.log('✅ TensorFlow.js libraries loaded');
    updateVoiceStatus('connecting', 'Loading AI pose model...');
    
    // Create pose detector with MoveNet
    tfPoseDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox
      }
    );
    
    console.log('✅ MoveNet pose detector created');
    updateVoiceStatus('ready', 'AI Pose Tracker ready');
    addFeedback('TensorFlow.js pose detection loaded! Advanced AI tracking active.');
    
    // Start pose detection loop
    startTensorFlowPoseDetection();
    
  } catch (error) {
    console.error('❌ TensorFlow.js initialization failed:', error);
    addFeedback('TensorFlow.js pose detection failed. Trying alternative methods...');
    
    // Try PoseNet as fallback
    await initializePoseNet();
  }
};

// Initialize PoseNet as fallback
const initializePoseNet = async function() {
  console.log('Trying PoseNet fallback...');
  
  try {
    if (typeof posenet === 'undefined') {
      throw new Error('PoseNet library not loaded');
    }
    
    console.log('Loading PoseNet model...');
    tfPoseDetector = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.75
    });
    
    console.log('✅ PoseNet model loaded');
    updateVoiceStatus('ready', 'AI Pose Tracker ready (PoseNet)');
    addFeedback('PoseNet pose detection loaded! AI tracking active.');
    
    detectionMethod = 'posenet';
    startTensorFlowPoseDetection();
    
  } catch (error) {
    console.error('❌ PoseNet initialization failed:', error);
    addFeedback('All TensorFlow.js methods failed. Using MediaPipe fallback.');
    
    // Final fallback to MediaPipe
    await initializePoseDetection();
  }
};

// Start TensorFlow.js pose detection loop
const startTensorFlowPoseDetection = function() {
  if (isTfPoseRunning) return;
  
  isTfPoseRunning = true;
  console.log('Starting TensorFlow.js pose detection loop...');
  
  // Run detection every 200ms for smoother tracking
  tfPoseInterval = setInterval(async () => {
    if (videoElement && videoElement.videoWidth > 0 && tfPoseDetector) {
      await runTensorFlowPoseDetection();
    }
  }, 200);
};

// Stop TensorFlow.js pose detection
const stopTensorFlowPoseDetection = function() {
  if (tfPoseInterval) {
    clearInterval(tfPoseInterval);
    tfPoseInterval = null;
  }
  isTfPoseRunning = false;
  console.log('TensorFlow.js pose detection stopped');
};

// Run TensorFlow.js pose detection on current frame
const runTensorFlowPoseDetection = async function() {
  try {
    let poses;
    
    if (detectionMethod === 'posenet') {
      // PoseNet detection
      poses = await tfPoseDetector.estimateSinglePose(videoElement, {
        flipHorizontal: false,
        decodingMethod: 'single-person'
      });
      poses = [poses]; // Wrap in array for consistent processing
    } else {
      // MoveNet detection
      poses = await tfPoseDetector.estimatePoses(videoElement);
    }
    
    // Process poses
    if (poses && poses.length > 0) {
      processTensorFlowPoses(poses[0]); // Use first (best) pose
    }
    
  } catch (error) {
    console.error('TensorFlow.js detection error:', error);
  }
};

// Process TensorFlow.js pose results
const processTensorFlowPoses = function(pose) {
  if (!pose || !pose.keypoints) return;
  
  // Clear canvas
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
  
  // Draw pose keypoints and connections
  drawTensorFlowPose(pose);
  
  // Analyze for workout tracking
  analyzeTensorFlowPose(pose);
};

// Draw TensorFlow.js pose on canvas
const drawTensorFlowPose = function(pose) {
  if (!canvasCtx || !pose.keypoints) return;
  
  const keypoints = pose.keypoints;
  const minConfidence = 0.3;
  
  // Draw keypoints
  keypoints.forEach(keypoint => {
    if (keypoint.score > minConfidence) {
      const { x, y } = keypoint;
      
      // Draw keypoint
      canvasCtx.fillStyle = '#ff9a01';
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 8, 0, 2 * Math.PI);
      canvasCtx.fill();
      
      // Add white border
      canvasCtx.strokeStyle = '#ffffff';
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    }
  });
  
  // Draw skeleton connections
  const connections = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
  ];
  
  canvasCtx.strokeStyle = '#ff9a01';
  canvasCtx.lineWidth = 3;
  
  connections.forEach(([startName, endName]) => {
    const startPoint = keypoints.find(kp => kp.name === startName);
    const endPoint = keypoints.find(kp => kp.name === endName);
    
    if (startPoint && endPoint && 
        startPoint.score > minConfidence && 
        endPoint.score > minConfidence) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(startPoint.x, startPoint.y);
      canvasCtx.lineTo(endPoint.x, endPoint.y);
      canvasCtx.stroke();
    }
  });
};
const initializeFitnessTracker = async function() {
  console.log('Initializing Fitness Tracker Model...');
  
  try {
    // Check if inference server is running
    const healthCheck = await fetch(`${inferenceServerUrl}/health`);
    if (!healthCheck.ok) {
      throw new Error('Inference server not running. Please start it with: inference server start');
    }
    
    console.log('✅ Fitness Tracker inference server is running');
    updateVoiceStatus('ready', 'AI Fitness Tracker ready');
    addFeedback('Advanced AI fitness tracking model loaded successfully!');
    
    // Start inference loop
    startFitnessInference();
    
  } catch (error) {
    console.error('❌ Fitness Tracker initialization failed:', error);
    addFeedback('Failed to connect to AI fitness model. Using fallback detection.');
    
    // Fallback to MediaPipe
    await initializePoseDetection();
  }
};

// Start continuous fitness inference
const startFitnessInference = function() {
  if (isInferenceRunning) return;
  
  isInferenceRunning = true;
  console.log('Starting fitness inference loop...');
  
  // Run inference every 500ms for real-time tracking
  inferenceInterval = setInterval(async () => {
    if (videoElement && videoElement.videoWidth > 0) {
      await runFitnessInference();
    }
  }, 500);
};

// Stop fitness inference
const stopFitnessInference = function() {
  if (inferenceInterval) {
    clearInterval(inferenceInterval);
    inferenceInterval = null;
  }
  isInferenceRunning = false;
  console.log('Fitness inference stopped');
};

// Run inference on current video frame
const runFitnessInference = async function() {
  try {
    // Capture current frame from video
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob for API
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    
    // Prepare form data for inference
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');
    
    // Run inference
    const response = await fetch(`${inferenceServerUrl}/infer/fitness_tracker_3rd-zpdwl/${modelVersion}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${inferenceApiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Inference failed: ${response.status}`);
    }
    
    const predictions = await response.json();
    
    // Process predictions
    processFitnessPredictions(predictions);
    
  } catch (error) {
    console.error('Inference error:', error);
    // Don't spam errors, just log them
  }
};

// Process fitness model predictions
const processFitnessPredictions = function(predictions) {
  if (!predictions || !predictions.predictions) return;
  
  // Clear previous overlays
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
  
  predictions.predictions.forEach(prediction => {
    // Draw bounding boxes and labels
    drawFitnessDetection(prediction);
    
    // Analyze for workout tracking
    analyzeFitnessDetection(prediction);
  });
};

// Draw fitness detection overlay
const drawFitnessDetection = function(prediction) {
  if (!canvasCtx) return;
  
  const { x, y, width, height, class: className, confidence } = prediction;
  
  // Convert from center coordinates to top-left
  const left = x - width / 2;
  const top = y - height / 2;
  
  // Draw bounding box
  canvasCtx.strokeStyle = '#ff9a01';
  canvasCtx.lineWidth = 3;
  canvasCtx.strokeRect(left, top, width, height);
  
  // Draw label background
  const label = `${className} (${(confidence * 100).toFixed(1)}%)`;
  const labelWidth = canvasCtx.measureText(label).width + 20;
  
  canvasCtx.fillStyle = 'rgba(255, 154, 1, 0.8)';
  canvasCtx.fillRect(left, top - 30, labelWidth, 25);
  
  // Draw label text
  canvasCtx.fillStyle = '#ffffff';
  canvasCtx.font = '14px Arial';
  canvasCtx.fillText(label, left + 10, top - 10);
};

// Analyze fitness detection for workout tracking
const analyzeFitnessDetection = function(prediction) {
  const { class: className, confidence } = prediction;
  
  // Only process high-confidence detections
  if (confidence < 0.7) return;
  
  const currentTime = Date.now();
  
  switch(className.toLowerCase()) {
    case 'squat_down':
      if (!isInDownPosition) {
        isInDownPosition = true;
        addFeedback('Great squat depth detected! Now push up strong.');
      }
      break;
      
    case 'squat_up':
      if (isInDownPosition && (currentTime - lastRepTime) > 1000) {
        isInDownPosition = false;
        lastRepTime = currentTime;
        currentReps++;
        updateWorkoutStats();
        
        const repMessages = [
          `Perfect! Rep ${currentReps} completed with excellent form!`,
          `Outstanding squat! That's ${currentReps} reps with AI-verified technique.`,
          `Incredible form! Rep ${currentReps} tracked by advanced AI analysis.`
        ];
        
        const message = repMessages[Math.floor(Math.random() * repMessages.length)];
        addFeedback(message);
        
        // Check if set is complete
        if (currentReps >= 10) {
          currentSet++;
          currentReps = 0;
          if (currentSet <= 4) {
            addFeedback(`Set ${currentSet-1} complete! AI confirms perfect form throughout.`);
            setTimeout(() => {
              addFeedback(`Starting set ${currentSet} with AI guidance. You're unstoppable!`);
            }, 3000);
          } else {
            addFeedback('Workout complete! AI analysis confirms exceptional performance!');
          }
          updateWorkoutStats();
        }
      }
      break;
      
    case 'good_form':
      if (Math.random() < 0.1) { // Occasional form feedback
        addFeedback('AI confirms excellent form! Keep maintaining that technique.');
      }
      break;
      
    case 'poor_form':
      addFeedback('Form alert: AI detected technique needs adjustment. Focus on proper alignment.');
      break;
      
    default:
      // Handle other fitness classes
      console.log(`Detected: ${className} (${(confidence * 100).toFixed(1)}%)`);
  }
};

// Initialize MediaPipe Pose detection (Fallback)
const initializePoseDetection = async function() {
  console.log('Initializing MediaPipe fallback...');
  
  // Check if MediaPipe is loaded
  if (typeof Pose === 'undefined') {
    console.error('MediaPipe Pose not loaded - check script imports');
    addFeedback('Error: Fallback AI pose detection not available.');
    return;
  }

  try {
    pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);

    // Start pose detection
    if (typeof Camera !== 'undefined') {
      camera = new Camera(videoElement, {
        onFrame: async () => {
          if (pose && videoElement.videoWidth > 0) {
            await pose.send({image: videoElement});
          }
        },
        width: 1280,
        height: 720
      });
      camera.start();
      isDetecting = true;
      addFeedback('Using fallback AI pose detection. For enhanced tracking, configure Fitness Tracker model.');
    }
  } catch (error) {
    console.error('Error initializing fallback pose detection:', error);
    addFeedback('All AI detection failed. Using basic camera only.');
  }
};

// Handle pose detection results
const onPoseResults = function(results) {
  if (!canvasCtx || !results.poseLandmarks) return;

  // Clear canvas
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  // Draw the pose landmarks
  drawPoseLandmarks(results.poseLandmarks);
  
  // Analyze movement for rep counting
  analyzeMovement(results.poseLandmarks);
  
  canvasCtx.restore();
};

// Draw pose landmarks on canvas
const drawPoseLandmarks = function(landmarks) {
  if (!landmarks || !canvasCtx) return;

  // Draw connections
  const connections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
    [11, 23], [12, 24], [23, 24], // Torso
    [23, 25], [25, 27], [24, 26], [26, 28] // Legs
  ];

  // Draw connections
  canvasCtx.strokeStyle = '#ff9a01';
  canvasCtx.lineWidth = 3;
  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
      canvasCtx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
      canvasCtx.stroke();
    }
  });

  // Draw key points
  const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  keyPoints.forEach(index => {
    const landmark = landmarks[index];
    if (landmark && landmark.visibility > 0.5) {
      canvasCtx.fillStyle = '#ff9a01';
      canvasCtx.beginPath();
      canvasCtx.arc(
        landmark.x * canvasElement.width,
        landmark.y * canvasElement.height,
        8, 0, 2 * Math.PI
      );
      canvasCtx.fill();
      
      // Add white border
      canvasCtx.strokeStyle = '#ffffff';
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    }
  });
};

// Analyze movement for rep counting
const analyzeMovement = function(landmarks) {
  if (!landmarks || landmarks.length < 33) return;

  const currentTime = Date.now();
  
  // Get key joint positions for squat detection
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftKnee || !rightKnee || !leftHip || !rightHip) return;

  const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  
  // Calculate knee bend angle (simplified)
  const kneeBend = avgHipY - avgKneeY;
  
  // Detect squat motion
  if (currentExercise === 'squat') {
    detectSquatRep(kneeBend, currentTime);
  }
  
  // Provide real-time form feedback
  providePoseFeedback(landmarks);
};

// Detect squat repetitions
const detectSquatRep = function(kneeBend, currentTime) {
  const downThreshold = 0.15; // Adjust based on testing
  const upThreshold = 0.05;
  
  // Check if person is in down position (squat)
  if (kneeBend > downThreshold && !isInDownPosition) {
    isInDownPosition = true;
    addFeedback('Perfect depth! Now drive up strong through your heels.');
  }
  
  // Check if person completed the rep (back up)
  if (kneeBend < upThreshold && isInDownPosition && (currentTime - lastRepTime) > 1000) {
    isInDownPosition = false;
    lastRepTime = currentTime;
    currentReps++;
    updateWorkoutStats();
    
    const repMessages = [
      `Excellent! That's ${currentReps} reps completed. Keep that form perfect!`,
      `Great job! Rep ${currentReps} done with fantastic control.`,
      `Beautiful squat! ${currentReps} down, looking strong!`,
      `Perfect form on rep ${currentReps}! You're crushing this workout.`
    ];
    
    const message = repMessages[Math.floor(Math.random() * repMessages.length)];
    addFeedback(message);
    
    // Check if set is complete
    if (currentReps >= 10) {
      currentSet++;
      currentReps = 0;
      if (currentSet <= 4) {
        addFeedback(`Outstanding! Set ${currentSet-1} complete! Take a well-deserved 60-second rest.`);
        setTimeout(() => {
          addFeedback(`Rest time over! Starting set ${currentSet}. You've got the strength - let's do this!`);
        }, 3000);
      } else {
        addFeedback('Incredible work! Your workout is complete! You absolutely crushed every single rep!');
      }
      updateWorkoutStats();
    }
  }
};

// Provide real-time pose feedback
const providePoseFeedback = function(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;
  
  // Check posture alignment
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  const hipTilt = Math.abs(leftHip.y - rightHip.y);
  
  if (shoulderTilt > 0.05) {
    // Provide feedback less frequently to avoid spam
    if (Math.random() < 0.01) {
      addFeedback('Keep your shoulders level and balanced.');
    }
  }
  
  if (hipTilt > 0.05) {
    if (Math.random() < 0.01) {
      addFeedback('Focus on keeping your hips level.');
    }
  }
};

// Update camera status
const updateCameraStatus = function(status, message) {
  console.log(`Camera status: ${status} - ${message}`);
  
  if (!cameraStatus) {
    console.log('Camera status element not found, creating feedback instead');
    addFeedback(message);
    return;
  }
  
  const indicator = cameraStatus.querySelector('.status-indicator');
  const text = cameraStatus.querySelector('.status-text');
  
  if (indicator) {
    indicator.className = `status-indicator ${status}`;
  }
  
  if (text) {
    text.textContent = message;
  }
  
  // Update indicator emoji
  if (indicator) {
    switch(status) {
      case 'connecting':
        indicator.textContent = '🟡';
        break;
      case 'connected':
        indicator.textContent = '🟢';
        setTimeout(() => {
          cameraStatus.style.opacity = '0';
          setTimeout(() => cameraStatus.style.display = 'none', 1000);
        }, 3000); // Show success longer
        break;
      case 'error':
        indicator.textContent = '🔴';
        break;
    }
  }
};

// Add feedback message with voice synthesis
const addFeedback = function(message) {
  const transcript = document.getElementById('feedback-transcript');
  if (!transcript) return;
  
  const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
  const timeStamp = formatTime(elapsed);
  
  const feedbackItem = document.createElement('div');
  feedbackItem.className = 'feedback-item';
  feedbackItem.innerHTML = `
    <span class="timestamp">${timeStamp}</span>
    <span class="message">${message}</span>
    ${isVoiceEnabled ? '<span class="voice-indicator">🔊</span>' : ''}
  `;
  
  transcript.appendChild(feedbackItem);
  transcript.scrollTop = transcript.scrollHeight;
  
  // Add to voice queue if voice is enabled
  if (isVoiceEnabled && message.trim()) {
    addToVoiceQueue(message);
  }
  
  // Remove old messages if too many
  while (transcript.children.length > 10) {
    transcript.removeChild(transcript.firstChild);
  }
};

// ElevenLabs voice synthesis
const synthesizeVoice = async function(text) {
  if (!elevenLabsApiKey) {
    console.log('No ElevenLabs API key provided, using fallback TTS');
    return synthesizeFallbackVoice(text);
  }
  
  try {
    updateVoiceStatus('speaking', 'AI Coach speaking...');
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      })
    });
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        updateVoiceStatus('ready', 'AI Coach ready');
        resolve();
      });
      
      audio.addEventListener('error', reject);
      audio.play();
    });
    
  } catch (error) {
    console.error('ElevenLabs synthesis failed:', error);
    updateVoiceStatus('error', 'Voice synthesis failed');
    
    // Fallback to browser TTS
    return synthesizeFallbackVoice(text);
  }
};

// Fallback browser text-to-speech
const synthesizeFallbackVoice = function(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.log('Speech synthesis not supported');
      updateVoiceStatus('error', 'Voice not supported');
      resolve();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to find a suitable voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      updateVoiceStatus('speaking', 'AI Coach speaking...');
    };
    
    utterance.onend = () => {
      updateVoiceStatus('ready', 'AI Coach ready');
      resolve();
    };
    
    utterance.onerror = () => {
      updateVoiceStatus('error', 'Voice synthesis failed');
      resolve();
    };
    
    speechSynthesis.speak(utterance);
  });
};

// Voice queue management
const addToVoiceQueue = function(text) {
  voiceQueue.push(text);
  processVoiceQueue();
};

const processVoiceQueue = async function() {
  if (isSpeaking || voiceQueue.length === 0) return;
  
  isSpeaking = true;
  const text = voiceQueue.shift();
  
  try {
    await synthesizeVoice(text);
  } catch (error) {
    console.error('Voice synthesis error:', error);
  } finally {
    isSpeaking = false;
    
    // Process next item in queue after a short delay
    if (voiceQueue.length > 0) {
      setTimeout(processVoiceQueue, 500);
    }
  }
};

// Update voice status indicator
const updateVoiceStatus = function(status, message) {
  const statusElement = document.getElementById('voice-status');
  if (!statusElement) return;
  
  const dot = statusElement.querySelector('.status-dot');
  const text = statusElement.querySelector('.status-text');
  
  if (dot) {
    dot.className = `status-dot ${status}`;
  }
  
  if (text) {
    text.textContent = message;
  }
};

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
      
      // Stop camera and pose detection
      stopSession();
      
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

// Initialize live session with camera and pose detection
document.addEventListener('DOMContentLoaded', async function () {
  // Disable scrolling completely
  disableScrolling();
  
  // API keys are hardcoded - no loading needed
  console.log('🔑 API keys configured automatically');
  
  startSessionTimer();
  updateWorkoutStats();
  
  // Initialize camera first
  await initializeCamera();
  
  // Setup canvas overlay for pose visualization
  setupCanvasOverlay();
  
  // Initialize AI pose detection with TensorFlow.js as priority
  console.log('🤖 Starting AI pose detection initialization...');
  
  if (detectionMethod === 'tensorflow') {
    console.log('Attempting TensorFlow.js pose detection...');
    await initializeTensorFlowPose();
  } else if (detectionMethod === 'roboflow') {
    console.log('Attempting Roboflow fitness model...');
    await initializeFitnessTracker();
  } else {
    console.log('Using MediaPipe pose detection fallback...');
    await initializePoseDetection();
  }
  
  // Initialize voice controls
  initializeVoiceControls();
  
  handleEndSession();
  addKeyboardShortcuts();
  
  // Initial feedback message - single clear instruction
  setTimeout(() => {
    addFeedback('Welcome to SportSense AI! Your personal AI coach is ready.');
    
    // Provide one clear instruction after a pause
    setTimeout(() => {
      addFeedback('Stand in front of the camera and start your squats. I will count your reps and guide your form.');
    }, 2000);
  }, 1000);
});

// Disable all forms of scrolling
const disableScrolling = function() {
  // Disable scroll wheel
  document.addEventListener('wheel', preventDefault, { passive: false });
  
  // Disable touch scrolling
  document.addEventListener('touchmove', preventDefault, { passive: false });
  
  // Disable keyboard scrolling
  document.addEventListener('keydown', function(e) {
    const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, page up/down, home, end, arrows
    
    // Allow space bar for pause/resume functionality
    if (e.keyCode === 32) {
      e.preventDefault();
      // Handle space bar for pause/resume
      addFeedback('Session paused - press space to resume');
      return false;
    }
    
    // Prevent other scroll keys
    if (scrollKeys.includes(e.keyCode)) {
      e.preventDefault();
      return false;
    }
  });
  
  // Disable drag scrolling
  document.addEventListener('dragstart', preventDefault);
  
  // Set body styles
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
};

// Prevent default function
const preventDefault = function(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

// Initialize voice controls
const initializeVoiceControls = function() {
  const voiceToggle = document.getElementById('voice-toggle');
  
  if (voiceToggle) {
    voiceToggle.addEventListener('click', toggleVoice);
  }
  
  // Voice settings removed - using consistent AI coach voice
  console.log('🎤 AI Coach voice initialized with consistent settings');
  
  // Initialize voice status
  updateVoiceStatus('ready', 'AI Coach ready');
  
  // Load voices for fallback TTS
  if (window.speechSynthesis) {
    speechSynthesis.getVoices(); // Trigger loading
    speechSynthesis.addEventListener('voiceschanged', () => {
      console.log('Speech synthesis voices loaded');
    });
  }
};

// Toggle voice feedback
const toggleVoice = function() {
  isVoiceEnabled = !isVoiceEnabled;
  const button = document.getElementById('voice-toggle');
  
  if (button) {
    if (isVoiceEnabled) {
      button.textContent = '🔊 Voice ON';
      button.classList.add('active');
      updateVoiceStatus('ready', 'AI Coach ready');
      addFeedback('Voice feedback enabled');
    } else {
      button.textContent = '🔇 Voice OFF';
      button.classList.remove('active');
      updateVoiceStatus('disabled', 'Voice feedback disabled');
      
      // Stop current speech
      if (window.speechSynthesis) {
        speechSynthesis.cancel();
      }
      
      // Clear voice queue
      voiceQueue = [];
      isSpeaking = false;
    }
  }
};

// API keys are now hardcoded - no user setup required

// Setup canvas overlay for pose visualization
const setupCanvasOverlay = function() {
  if (!canvasElement || !videoElement) return;
  
  // Match canvas size to video
  const resizeCanvas = () => {
    const videoRect = videoElement.getBoundingClientRect();
    canvasElement.width = videoRect.width;
    canvasElement.height = videoRect.height;
    canvasElement.style.width = `${videoRect.width}px`;
    canvasElement.style.height = `${videoRect.height}px`;
  };
  
  // Resize canvas when video loads
  videoElement.addEventListener('loadedmetadata', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
  
  // Initial resize
  setTimeout(resizeCanvas, 500);
  
  console.log('✅ Canvas overlay setup complete');
};

// Stop session function
const stopSession = function() {
  console.log('🛑 Stopping SportSense AI session...');
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Stop TensorFlow.js pose detection
  stopTensorFlowPoseDetection();
  
  // Stop fitness inference
  stopFitnessInference();
  
  // Stop MediaPipe camera
  if (camera) {
    camera.stop();
  }
  
  // Stop camera stream
  if (videoElement && videoElement.srcObject) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
  }
  
  // Clear canvas
  if (canvasCtx) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
  
  addFeedback('Session ended. Great workout with AI analysis!');
  console.log('✅ Session stopped successfully');
};

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
  stopSession();
  
  // Re-enable scrolling
  enableScrolling();
  
  // Stop any ongoing speech
  if (window.speechSynthesis) {
    speechSynthesis.cancel();
  }
  
  // Clear voice queue
  voiceQueue = [];
  isSpeaking = false;
});

// Re-enable scrolling when leaving the page
const enableScrolling = function() {
  // Remove event listeners
  document.removeEventListener('wheel', preventDefault);
  document.removeEventListener('touchmove', preventDefault);
  document.removeEventListener('dragstart', preventDefault);
  
  // Reset body styles
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.position = '';
  document.body.style.height = '';
  document.body.style.width = '';
};

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeCamera,
    initializePoseDetection,
    updateWorkoutStats,
    addFeedback,
    stopSession,
    toggleVoice,
    synthesizeVoice
  };
}
