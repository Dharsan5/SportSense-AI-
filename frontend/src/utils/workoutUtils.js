// Utility functions for SportSense AI

/**
 * Calculate angle between three points (useful for pose analysis)
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Vertex point {x, y}
 * @param {Object} point3 - Third point {x, y}
 * @returns {number} Angle in degrees
 */
export const calculateAngle = (point1, point2, point3) => {
  const vector1 = {
    x: point1.x - point2.x,
    y: point1.y - point2.y
  };
  
  const vector2 = {
    x: point3.x - point2.x,
    y: point3.y - point2.y
  };
  
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
  
  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
  
  return angleRadians * (180 / Math.PI);
};

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Distance in pixels
 */
export const calculateDistance = (point1, point2) => {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
};

/**
 * Determine if a person is in proper squat position
 * @param {Object} landmarks - Pose landmarks
 * @returns {Object} Analysis result
 */
export const analyzeSquatForm = (landmarks) => {
  if (!landmarks.leftHip || !landmarks.leftKnee || !landmarks.leftAnkle ||
      !landmarks.rightHip || !landmarks.rightKnee || !landmarks.rightAnkle) {
    return { valid: false, reason: 'Insufficient landmarks detected' };
  }

  // Calculate knee angles
  const leftKneeAngle = calculateAngle(landmarks.leftHip, landmarks.leftKnee, landmarks.leftAnkle);
  const rightKneeAngle = calculateAngle(landmarks.rightHip, landmarks.rightKnee, landmarks.rightAnkle);
  
  // Check for knee valgus (knees caving in)
  const hipWidth = Math.abs(landmarks.rightHip.x - landmarks.leftHip.x);
  const kneeWidth = Math.abs(landmarks.rightKnee.x - landmarks.leftKnee.x);
  const kneeValgus = kneeWidth < hipWidth * 0.7;
  
  // Check squat depth
  const leftSquatDepth = landmarks.leftKnee.y > landmarks.leftHip.y;
  const rightSquatDepth = landmarks.rightKnee.y > landmarks.rightHip.y;
  const adequateDepth = leftSquatDepth && rightSquatDepth;
  
  // Check for forward knee drift
  const leftKneeOverToe = landmarks.leftKnee.x > landmarks.leftAnkle.x + 20;
  const rightKneeOverToe = landmarks.rightKnee.x < landmarks.rightAnkle.x - 20;
  
  return {
    valid: true,
    leftKneeAngle,
    rightKneeAngle,
    avgKneeAngle: (leftKneeAngle + rightKneeAngle) / 2,
    kneeValgus,
    adequateDepth,
    leftKneeOverToe,
    rightKneeOverToe,
    formScore: calculateSquatScore({
      kneeValgus,
      adequateDepth,
      leftKneeOverToe,
      rightKneeOverToe,
      avgKneeAngle: (leftKneeAngle + rightKneeAngle) / 2
    })
  };
};

/**
 * Calculate squat form score
 * @param {Object} analysis - Squat analysis data
 * @returns {number} Score from 0-100
 */
const calculateSquatScore = (analysis) => {
  let score = 100;
  
  // Deduct for form issues
  if (analysis.kneeValgus) score -= 20;
  if (!analysis.adequateDepth) score -= 15;
  if (analysis.leftKneeOverToe || analysis.rightKneeOverToe) score -= 10;
  
  // Bonus for good knee angle (should be around 90 degrees at bottom)
  const idealAngle = 90;
  const angleDifference = Math.abs(analysis.avgKneeAngle - idealAngle);
  if (angleDifference > 30) score -= 15;
  else if (angleDifference > 15) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Detect workout repetitions based on movement patterns
 * @param {Array} movementHistory - Array of pose landmarks over time
 * @param {string} exerciseType - Type of exercise being performed
 * @returns {Object} Repetition detection result
 */
export const detectRepetitions = (movementHistory, exerciseType = 'squat') => {
  if (movementHistory.length < 10) {
    return { reps: 0, confidence: 0 };
  }
  
  switch (exerciseType) {
    case 'squat':
      return detectSquatReps(movementHistory);
    case 'pushup':
      return detectPushupReps(movementHistory);
    default:
      return { reps: 0, confidence: 0 };
  }
};

/**
 * Detect squat repetitions
 * @param {Array} movementHistory - Array of pose landmarks over time
 * @returns {Object} Repetition detection result
 */
const detectSquatReps = (movementHistory) => {
  const hipPositions = movementHistory.map(frame => {
    if (frame.leftHip && frame.rightHip) {
      return (frame.leftHip.y + frame.rightHip.y) / 2;
    }
    return null;
  }).filter(pos => pos !== null);
  
  if (hipPositions.length < 5) {
    return { reps: 0, confidence: 0 };
  }
  
  // Simple peak detection for squat reps
  let reps = 0;
  let lastPeak = 0;
  const threshold = 20; // Minimum movement threshold
  
  for (let i = 1; i < hipPositions.length - 1; i++) {
    const isLocalMax = hipPositions[i] > hipPositions[i - 1] && 
                      hipPositions[i] > hipPositions[i + 1];
    
    if (isLocalMax && (i - lastPeak) > 10 && 
        Math.abs(hipPositions[i] - hipPositions[lastPeak]) > threshold) {
      reps++;
      lastPeak = i;
    }
  }
  
  return {
    reps: Math.floor(reps / 2), // Each rep consists of down and up motion
    confidence: hipPositions.length > 20 ? 0.8 : 0.5
  };
};

/**
 * Detect pushup repetitions
 * @param {Array} movementHistory - Array of pose landmarks over time
 * @returns {Object} Repetition detection result
 */
const detectPushupReps = (movementHistory) => {
  const shoulderPositions = movementHistory.map(frame => {
    if (frame.leftShoulder && frame.rightShoulder) {
      return (frame.leftShoulder.y + frame.rightShoulder.y) / 2;
    }
    return null;
  }).filter(pos => pos !== null);
  
  if (shoulderPositions.length < 5) {
    return { reps: 0, confidence: 0 };
  }
  
  // Similar peak detection logic for pushups
  let reps = 0;
  let lastPeak = 0;
  const threshold = 15;
  
  for (let i = 1; i < shoulderPositions.length - 1; i++) {
    const isLocalMax = shoulderPositions[i] > shoulderPositions[i - 1] && 
                      shoulderPositions[i] > shoulderPositions[i + 1];
    
    if (isLocalMax && (i - lastPeak) > 8 && 
        Math.abs(shoulderPositions[i] - shoulderPositions[lastPeak]) > threshold) {
      reps++;
      lastPeak = i;
    }
  }
  
  return {
    reps: Math.floor(reps / 2),
    confidence: shoulderPositions.length > 15 ? 0.8 : 0.5
  };
};

/**
 * Format time duration into human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate calories burned based on activity
 * @param {Object} params - Calculation parameters
 * @returns {number} Estimated calories burned
 */
export const calculateCaloriesBurned = ({ 
  duration, // in minutes
  weight = 70, // in kg
  exerciseType = 'general_workout',
  intensity = 'moderate' 
}) => {
  // MET values for different exercises
  const metValues = {
    squat: { light: 3.5, moderate: 5.0, high: 7.0 },
    pushup: { light: 3.8, moderate: 5.5, high: 8.0 },
    plank: { light: 3.0, moderate: 4.5, high: 6.0 },
    general_workout: { light: 3.5, moderate: 5.0, high: 7.0 }
  };
  
  const met = metValues[exerciseType]?.[intensity] || metValues.general_workout[intensity];
  
  // Calories = MET × weight (kg) × duration (hours)
  return Math.round(met * weight * (duration / 60));
};

/**
 * Generate workout recommendations based on performance
 * @param {Object} performanceData - User performance data
 * @returns {Array} Array of recommendation objects
 */
export const generateWorkoutRecommendations = (performanceData) => {
  const recommendations = [];
  
  if (performanceData.avgFormScore < 70) {
    recommendations.push({
      type: 'form_improvement',
      priority: 'high',
      message: 'Focus on form quality over quantity in your next session'
    });
  }
  
  if (performanceData.completionRate < 80) {
    recommendations.push({
      type: 'endurance',
      priority: 'medium',
      message: 'Consider reducing intensity to improve workout completion'
    });
  }
  
  if (performanceData.avgHeartRate < 120) {
    recommendations.push({
      type: 'intensity',
      priority: 'medium',
      message: 'Try increasing workout intensity for better cardiovascular benefits'
    });
  }
  
  return recommendations;
};

/**
 * Validate pose landmarks quality
 * @param {Object} landmarks - Pose landmarks
 * @returns {Object} Validation result
 */
export const validatePoseQuality = (landmarks) => {
  const requiredLandmarks = [
    'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip',
    'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
  ];
  
  const presentLandmarks = requiredLandmarks.filter(
    landmark => landmarks[landmark] && landmarks[landmark].confidence > 0.5
  );
  
  const quality = (presentLandmarks.length / requiredLandmarks.length) * 100;
  
  return {
    quality: Math.round(quality),
    missingLandmarks: requiredLandmarks.filter(
      landmark => !presentLandmarks.includes(landmark)
    ),
    isValid: quality >= 70
  };
};

export default {
  calculateAngle,
  calculateDistance,
  analyzeSquatForm,
  detectRepetitions,
  formatDuration,
  calculateCaloriesBurned,
  generateWorkoutRecommendations,
  validatePoseQuality
};
