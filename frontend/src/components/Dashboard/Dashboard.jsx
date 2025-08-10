import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { Activity, Heart, Moon, Zap, Droplets, Play, Mic, MicOff } from 'lucide-react';
import { toolFunctions } from '../../services/apiService';
import voiceService from '../../services/voiceService';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
  color: white;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(45deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ReadinessPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const WorkoutPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ReadinessScore = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const ScoreValue = styled.div`
  font-size: 4rem;
  font-weight: bold;
  color: ${props => props.score >= 80 ? '#4CAF50' : props.score >= 60 ? '#FF9800' : '#F44336'};
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const ScoreLabel = styled.div`
  font-size: 1.2rem;
  opacity: 0.8;
  margin-top: 10px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetricIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  color: ${props => props.color || '#fff'};
`;

const MetricValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const TrendChart = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const StartSessionButton = styled.button`
  width: 100%;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  border: none;
  border-radius: 15px;
  padding: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const VoiceIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 20px;
  border: ${props => props.isActive ? '2px solid #4CAF50' : '2px solid transparent'};
  transition: all 0.3s ease;
`;

const WorkoutPreview = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ExerciseItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid #4CAF50;
`;

const ExerciseDetails = styled.div`
  flex: 1;
`;

const ExerciseName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ExerciseSpecs = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const Dashboard = ({ onStartSession }) => {
  const [readinessData, setReadinessData] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceState, setVoiceState] = useState({ isListening: false, isInitialized: false });

  useEffect(() => {
    initializeDashboard();
    initializeVoice();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Fetch readiness data
      const readinessResponse = await toolFunctions.getReadinessData();
      if (readinessResponse.success) {
        setReadinessData(readinessResponse.data);
      }

      // Fetch training plan
      const planResponse = await toolFunctions.getTrainingPlan('demo-user');
      if (planResponse.success) {
        setTrainingPlan(planResponse.data);
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeVoice = async () => {
    const initialized = await voiceService.initialize();
    setVoiceState(prev => ({ ...prev, isInitialized: initialized }));

    if (initialized) {
      // Start listening for voice commands
      voiceService.startListening(handleVoiceCommand);
      setVoiceState(prev => ({ ...prev, isListening: true }));
    }
  };

  const handleVoiceCommand = async (command) => {
    console.log('Voice command received:', command);
    
    const intent = voiceService.processVoiceCommand(command);
    
    switch (intent.intent) {
      case 'start_workout':
        await voiceService.speakAsAlex("Great! Let's start your workout session. Initializing camera and pose detection.");
        onStartSession();
        break;
        
      case 'readiness_check':
        if (readinessData) {
          await voiceService.provideWorkoutFeedback('readinessCheck', { score: readinessData.readinessScore });
        }
        break;
        
      default:
        await voiceService.speakAsAlex("I'm here to help with your workout. Say 'start workout' when you're ready to begin your training session.");
    }
  };

  const handleStartSession = async () => {
    if (voiceState.isInitialized) {
      await voiceService.speakAsAlex("Excellent! Let's begin your personalized training session. I'll be monitoring your form and providing real-time feedback.");
    }
    onStartSession();
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading your personalized dashboard...</div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>SportSense AI</Title>
        <Subtitle>Your AI-Powered Personal Training Coach</Subtitle>
      </Header>

      <MainContent>
        {/* Readiness Panel */}
        <ReadinessPanel>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Today's Readiness</h2>
          
          {readinessData && (
            <>
              <ReadinessScore>
                <ScoreValue score={readinessData.readinessScore}>
                  {readinessData.readinessScore}
                </ScoreValue>
                <ScoreLabel>Readiness Score</ScoreLabel>
              </ReadinessScore>

              <MetricsGrid>
                <MetricCard>
                  <MetricIcon color="#e74c3c">
                    <Heart size={24} />
                  </MetricIcon>
                  <MetricValue>{readinessData.metrics.heartRateVariability.value}</MetricValue>
                  <MetricLabel>HRV (ms)</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIcon color="#9b59b6">
                    <Moon size={24} />
                  </MetricIcon>
                  <MetricValue>{readinessData.metrics.sleepQuality.value}</MetricValue>
                  <MetricLabel>Sleep Quality</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIcon color="#f39c12">
                    <Zap size={24} />
                  </MetricIcon>
                  <MetricValue>{readinessData.metrics.stressLevel.value}</MetricValue>
                  <MetricLabel>Stress Level</MetricLabel>
                </MetricCard>

                <MetricCard>
                  <MetricIcon color="#3498db">
                    <Droplets size={24} />
                  </MetricIcon>
                  <MetricValue>{readinessData.metrics.hydrationLevel.value}</MetricValue>
                  <MetricLabel>Hydration</MetricLabel>
                </MetricCard>
              </MetricsGrid>

              <TrendChart>
                <h3 style={{ marginBottom: '15px' }}>7-Day Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={readinessData.trends.last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#4CAF50" 
                      strokeWidth={3}
                      dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TrendChart>
            </>
          )}
        </ReadinessPanel>

        {/* Workout Panel */}
        <WorkoutPanel>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Today's Training</h2>
          
          <VoiceIndicator isActive={voiceState.isListening}>
            {voiceState.isListening ? <Mic size={20} /> : <MicOff size={20} />}
            <span>
              {voiceState.isListening ? 'Alex is listening...' : 'Voice coach offline'}
            </span>
          </VoiceIndicator>

          <StartSessionButton onClick={handleStartSession}>
            <Play size={24} />
            Start Session with Alex
          </StartSessionButton>

          {trainingPlan && (
            <WorkoutPreview>
              <h3 style={{ marginBottom: '15px' }}>Today's Workout Plan</h3>
              <p style={{ marginBottom: '20px', opacity: 0.8 }}>
                {trainingPlan.type} • {trainingPlan.duration} minutes • {trainingPlan.difficulty}
              </p>
              
              <ExerciseList>
                {trainingPlan.exercises.map((exercise, index) => (
                  <ExerciseItem key={index}>
                    <ExerciseDetails>
                      <ExerciseName>{exercise.name}</ExerciseName>
                      <ExerciseSpecs>
                        {exercise.sets} sets × {exercise.reps || exercise.duration} 
                        {exercise.reps ? ' reps' : 's'} • {exercise.restTime}s rest
                      </ExerciseSpecs>
                    </ExerciseDetails>
                  </ExerciseItem>
                ))}
              </ExerciseList>

              {trainingPlan.adaptations && trainingPlan.adaptations.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <h4 style={{ marginBottom: '10px' }}>AI Adaptations:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {trainingPlan.adaptations.map((adaptation, index) => (
                      <li key={index} style={{ marginBottom: '5px', opacity: 0.8 }}>
                        {adaptation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </WorkoutPreview>
          )}
        </WorkoutPanel>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
