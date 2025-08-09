import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Camera, CameraOff, Mic, MicOff, Pause, Play, Square, Activity } from 'lucide-react';
import poseDetectionService from '../../services/poseDetectionService';
import voiceService from '../../services/voiceService';
import { toolFunctions } from '../../services/apiService';

const SessionContainer = styled.div`
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
`;

const VideoContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror effect for better user experience */
`;

const PoseCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: scaleX(-1); /* Mirror effect to match video */
`;

const OverlayUI = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  z-index: 10;
`;

const SessionStats = styled.div`
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;
  min-width: 200px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  opacity: 0.8;
`;

const StatValue = styled.span`
  font-weight: bold;
  color: ${props => props.color || '#fff'};
`;

const FormFeedback = styled.div`
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;
  max-width: 300px;
`;

const FeedbackItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(${props => props.severity === 'severe' ? '244, 67, 54' : 
                              props.severity === 'moderate' ? '255, 152, 0' : 
                              '76, 175, 80'}, 0.2);
  border-radius: 8px;
  border-left: 4px solid ${props => props.severity === 'severe' ? '#F44336' : 
                                   props.severity === 'moderate' ? '#FF9800' : 
                                   '#4CAF50'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BottomControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 10;
`;

const ControlButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 255, 255, 0.3)'};
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const WorkoutProgress = styled.div`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;
  min-width: 250px;
`;

const ExerciseInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ExerciseName = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.3rem;
`;

const SetInfo = styled.div`
  font-size: 1.1rem;
  opacity: 0.8;
`;

const RepCounter = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const RepCount = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const RepLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const VoiceIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 15px 20px;
  border: ${props => props.isActive ? '2px solid #4CAF50' : '2px solid rgba(255,255,255,0.3)'};
  transition: all 0.3s ease;
`;

const LiveSession = ({ onEndSession }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    currentSet: 1,
    totalSets: 3,
    currentRep: 0,
    targetReps: 12
  });
  const [formFeedback, setFormFeedback] = useState([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: 'Bodyweight Squats',
    currentSet: 1,
    totalSets: 3,
    targetReps: 12
  });
  const [voiceState, setVoiceState] = useState({ isListening: false, isSpeaking: false });
  const [poseQuality, setPoseQuality] = useState(0);

  useEffect(() => {
    initializeSession();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Update session duration every second
    if (!sessionPaused) {
      const interval = setInterval(() => {
        setSessionStats(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionPaused]);

  const initializeSession = async () => {
    try {
      // Initialize pose detection
      await poseDetectionService.initialize();
      
      // Initialize voice service
      await voiceService.initialize();
      setVoiceState({ isListening: true, isSpeaking: false });
      
      // Start camera
      await startCamera();
      
      // Start voice interaction
      voiceService.startListening(handleVoiceCommand);
      
      // Welcome message
      await voiceService.speakAsAlex(
        "Welcome to your training session! I'll be monitoring your form and providing real-time feedback. Let's start with bodyweight squats. Begin when you're ready!"
      );
      
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        videoRef.current.onloadedmetadata = () => {
          // Setup pose detection canvas
          if (canvasRef.current) {
            poseDetectionService.setupCanvas(videoRef.current, canvasRef.current);
            poseDetectionService.startDetection(handlePoseDetected);
          }
        };
      }
    } catch (error) {
      console.error('Camera access failed:', error);
    }
  };

  const handlePoseDetected = async (landmarks) => {
    // Calculate pose quality
    const quality = poseDetectionService.getPoseQuality(landmarks);
    setPoseQuality(quality);
    
    // Analyze for form faults
    const faults = poseDetectionService.analyzePoseFaults(landmarks);
    setFormFeedback(faults);
    
    // Send pose data for AI analysis
    if (landmarks && Object.keys(landmarks).length > 0) {
      const analysisResult = await toolFunctions.analyzeMovementForm(Object.values(landmarks));
      
      if (analysisResult.success && analysisResult.data.detectedFaults.length > 0) {
        // Update feedback with AI analysis
        setFormFeedback(analysisResult.data.detectedFaults);
        
        // Provide voice feedback for significant faults
        const severeFaults = analysisResult.data.detectedFaults.filter(fault => fault.severity === 'severe');
        if (severeFaults.length > 0 && !voiceState.isSpeaking) {
          await voiceService.provideWorkoutFeedback('formCorrection');
        }
      }
    }
    
    // Rep counting logic (simplified)
    detectRepetition(landmarks);
  };

  const detectRepetition = (landmarks) => {
    // Simple rep detection based on knee angle for squats
    if (landmarks.leftKnee && landmarks.leftHip && landmarks.leftAnkle) {
      const hipToKnee = {
        x: landmarks.leftKnee.x - landmarks.leftHip.x,
        y: landmarks.leftKnee.y - landmarks.leftHip.y
      };
      const kneeToAnkle = {
        x: landmarks.leftAnkle.x - landmarks.leftKnee.x,
        y: landmarks.leftAnkle.y - landmarks.leftKnee.y
      };
      
      // Calculate angle (simplified)
      const angle = Math.atan2(kneeToAnkle.y, kneeToAnkle.x) - Math.atan2(hipToKnee.y, hipToKnee.x);
      const degrees = Math.abs(angle * 180 / Math.PI);
      
      // Rep completed when knee angle reaches certain threshold (simplified logic)
      if (degrees < 90 && sessionStats.currentRep < sessionStats.targetReps) {
        setSessionStats(prev => ({ ...prev, currentRep: prev.currentRep + 1 }));
        
        // Provide encouragement
        if (!voiceState.isSpeaking) {
          voiceService.provideWorkoutFeedback('encouragement');
        }
      }
    }
  };

  const handleVoiceCommand = async (command) => {
    const intent = voiceService.processVoiceCommand(command);
    
    switch (intent.intent) {
      case 'pause_workout':
        setSessionPaused(true);
        await voiceService.speakAsAlex("Workout paused. Take your time and resume when ready.");
        break;
        
      case 'next_exercise':
        await handleNextExercise();
        break;
        
      case 'form_help':
        await voiceService.provideWorkoutFeedback('formCorrection');
        break;
        
      case 'progress_check':
        await voiceService.speakAsAlex(
          `You've completed ${sessionStats.currentRep} out of ${sessionStats.targetReps} reps in this set. You're doing great!`
        );
        break;
        
      default:
        console.log('Voice command not recognized:', command);
    }
  };

  const handleNextExercise = async () => {
    if (sessionStats.currentRep >= sessionStats.targetReps) {
      if (sessionStats.currentSet < sessionStats.totalSets) {
        // Next set
        setSessionStats(prev => ({
          ...prev,
          currentSet: prev.currentSet + 1,
          currentRep: 0
        }));
        await voiceService.provideWorkoutFeedback('setComplete', { reps: sessionStats.currentRep });
        await voiceService.provideWorkoutFeedback('restTime');
      } else {
        // Workout complete
        await voiceService.provideWorkoutFeedback('workoutComplete');
        onEndSession();
      }
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
      poseDetectionService.stopDetection();
    } else {
      startCamera();
    }
  };

  const toggleMic = () => {
    if (micActive) {
      voiceService.stopListening();
      setMicActive(false);
    } else {
      voiceService.startListening(handleVoiceCommand);
      setMicActive(true);
    }
  };

  const togglePause = async () => {
    if (sessionPaused) {
      setSessionPaused(false);
      await voiceService.speakAsAlex("Resuming workout. Let's continue!");
    } else {
      setSessionPaused(true);
      await voiceService.speakAsAlex("Workout paused. Take your time.");
    }
  };

  const endSession = async () => {
    await voiceService.speakAsAlex("Great job! Session complete. Let's review your performance.");
    onEndSession();
  };

  const cleanup = () => {
    // Stop camera
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop services
    poseDetectionService.stopDetection();
    voiceService.stopListening();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SessionContainer>
      <VideoContainer>
        <VideoElement ref={videoRef} autoPlay playsInline muted />
        <PoseCanvas ref={canvasRef} />
        
        <OverlayUI>
          <SessionStats>
            <StatItem>
              <StatLabel>Duration:</StatLabel>
              <StatValue>{formatTime(sessionStats.duration)}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Pose Quality:</StatLabel>
              <StatValue color={poseQuality > 80 ? '#4CAF50' : poseQuality > 60 ? '#FF9800' : '#F44336'}>
                {Math.round(poseQuality)}%
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Set:</StatLabel>
              <StatValue>{sessionStats.currentSet}/{sessionStats.totalSets}</StatValue>
            </StatItem>
          </SessionStats>
          
          {formFeedback.length > 0 && (
            <FormFeedback>
              <h4 style={{ margin: '0 0 15px 0' }}>Form Analysis</h4>
              {formFeedback.slice(0, 3).map((fault, index) => (
                <FeedbackItem key={index} severity={fault.severity}>
                  <Activity size={16} />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {fault.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      {fault.description || fault.message}
                    </div>
                  </div>
                </FeedbackItem>
              ))}
            </FormFeedback>
          )}
        </OverlayUI>
        
        <VoiceIndicator isActive={voiceState.isListening}>
          {voiceState.isListening ? <Mic size={20} /> : <MicOff size={20} />}
          <span>Alex Coach</span>
        </VoiceIndicator>
        
        <WorkoutProgress>
          <ExerciseInfo>
            <ExerciseName>{currentExercise.name}</ExerciseName>
            <SetInfo>Set {currentExercise.currentSet} of {currentExercise.totalSets}</SetInfo>
          </ExerciseInfo>
          
          <RepCounter>
            <RepCount>{sessionStats.currentRep}</RepCount>
            <RepLabel>of {sessionStats.targetReps} reps</RepLabel>
          </RepCounter>
        </WorkoutProgress>
      </VideoContainer>
      
      <BottomControls>
        <ControlButton onClick={toggleCamera} active={cameraActive}>
          {cameraActive ? <Camera size={24} /> : <CameraOff size={24} />}
        </ControlButton>
        
        <ControlButton onClick={toggleMic} active={micActive}>
          {micActive ? <Mic size={24} /> : <MicOff size={24} />}
        </ControlButton>
        
        <ControlButton onClick={togglePause}>
          {sessionPaused ? <Play size={24} /> : <Pause size={24} />}
        </ControlButton>
        
        <ControlButton onClick={endSession}>
          <Square size={24} />
        </ControlButton>
      </BottomControls>
    </SessionContainer>
  );
};

export default LiveSession;
