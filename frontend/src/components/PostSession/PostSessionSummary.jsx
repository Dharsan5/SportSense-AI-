import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Target, TrendingUp, MessageSquare, Star, AlertTriangle, CheckCircle, Home, Play } from 'lucide-react';
import { toolFunctions } from '../../services/apiService';
import voiceService from '../../services/voiceService';

const SummaryContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const ContentArea = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  color: ${props => props.color || '#4CAF50'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: ${props => props.color || '#fff'};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const FormAnalysisSection = styled.div`
  margin-bottom: 30px;
`;

const FaultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FaultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid ${props => 
    props.severity === 'severe' ? '#F44336' : 
    props.severity === 'moderate' ? '#FF9800' : 
    '#4CAF50'
  };
`;

const FaultIcon = styled.div`
  color: ${props => 
    props.severity === 'severe' ? '#F44336' : 
    props.severity === 'moderate' ? '#FF9800' : 
    '#4CAF50'
  };
`;

const FaultDetails = styled.div`
  flex: 1;
`;

const FaultTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  text-transform: capitalize;
`;

const FaultDescription = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 8px;
`;

const FaultCorrection = styled.div`
  font-size: 0.85rem;
  color: #4CAF50;
  font-style: italic;
`;

const RecommendationsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const RecommendationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PerformanceChart = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const NotesSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
`;

const NotesInput = styled.textarea`
  width: 100%;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 15px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 15px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &.primary {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const PostSessionSummary = ({ sessionData, onReturnHome, onStartNewSession }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSessionSummary();
    provideVoiceSummary();
  }, []);

  const generateSessionSummary = async () => {
    try {
      // Generate mock session data if not provided
      const mockSessionData = sessionData || {
        duration: 1845, // 30 minutes 45 seconds
        exercisesCompleted: 4,
        totalReps: 48,
        avgFormScore: 78,
        caloriesBurned: 245,
        heartRateAvg: 142,
        peakHeartRate: 165
      };

      // Get pose analysis results
      const poseAnalysis = await toolFunctions.analyzeMovementForm([]);
      
      // Create performance chart data
      const chartData = [
        { exercise: 'Squats', formScore: 82, reps: 12 },
        { exercise: 'Push-ups', formScore: 75, reps: 8 },
        { exercise: 'Plank', formScore: 88, duration: 45 },
        { exercise: 'Lunges', formScore: 71, reps: 10 }
      ];

      setPerformanceData({
        session: mockSessionData,
        poseAnalysis: poseAnalysis.data,
        chartData
      });
      
    } catch (error) {
      console.error('Error generating session summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const provideVoiceSummary = async () => {
    await voiceService.speakAsAlex(
      "Excellent work today! You completed a full workout with solid form. I've identified a few areas for improvement that we can work on in your next session. Take a moment to review your performance summary."
    );
  };

  const handleSaveNotes = async () => {
    if (notes.trim()) {
      const noteData = {
        sessionId: Date.now().toString(),
        content: notes,
        timestamp: new Date().toISOString(),
        type: 'post_session_reflection'
      };
      
      const result = await toolFunctions.logPerformanceNote(noteData);
      if (result.success) {
        await voiceService.speakAsAlex("Your notes have been saved. Great job reflecting on your workout!");
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SummaryContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Analyzing your workout performance...</div>
        </div>
      </SummaryContainer>
    );
  }

  return (
    <SummaryContainer>
      <Header>
        <Title>
          <Trophy size={32} />
          Workout Complete!
        </Title>
        <Subtitle>Here's how you performed today</Subtitle>
      </Header>

      <ContentArea>
        {/* Performance Overview */}
        <SummaryCard>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={24} />
            Performance Overview
          </h2>
          
          <StatsGrid>
            <StatCard>
              <StatIcon color="#4CAF50">
                <TrendingUp size={24} />
              </StatIcon>
              <StatValue>{formatTime(performanceData.session.duration)}</StatValue>
              <StatLabel>Total Duration</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon color="#2196F3">
                <Target size={24} />
              </StatIcon>
              <StatValue>{performanceData.session.totalReps}</StatValue>
              <StatLabel>Total Reps</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon color="#FF9800">
                <Star size={24} />
              </StatIcon>
              <StatValue color={
                performanceData.session.avgFormScore >= 80 ? '#4CAF50' :
                performanceData.session.avgFormScore >= 60 ? '#FF9800' : '#F44336'
              }>
                {performanceData.session.avgFormScore}%
              </StatValue>
              <StatLabel>Avg Form Score</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon color="#E91E63">
                <Trophy size={24} />
              </StatIcon>
              <StatValue>{performanceData.session.caloriesBurned}</StatValue>
              <StatLabel>Calories Burned</StatLabel>
            </StatCard>
          </StatsGrid>

          <PerformanceChart>
            <h3 style={{ marginBottom: '15px' }}>Exercise Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="exercise" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="formScore" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </PerformanceChart>
        </SummaryCard>

        {/* Form Analysis */}
        <SummaryCard>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} />
            Form Analysis
          </h2>
          
          <FormAnalysisSection>
            <h3 style={{ marginBottom: '15px' }}>Detected Issues</h3>
            <FaultsList>
              {performanceData.poseAnalysis.detectedFaults.map((fault, index) => (
                <FaultItem key={index} severity={fault.severity}>
                  <FaultIcon severity={fault.severity}>
                    {fault.severity === 'severe' ? <AlertTriangle size={20} /> : 
                     fault.severity === 'moderate' ? <Star size={20} /> : 
                     <CheckCircle size={20} />}
                  </FaultIcon>
                  <FaultDetails>
                    <FaultTitle>{fault.type.replace('_', ' ')}</FaultTitle>
                    <FaultDescription>{fault.description}</FaultDescription>
                    <FaultCorrection>💡 {fault.correction}</FaultCorrection>
                  </FaultDetails>
                </FaultItem>
              ))}
            </FaultsList>
          </FormAnalysisSection>

          <RecommendationsSection>
            <h3 style={{ marginBottom: '15px' }}>Recommendations for Next Session</h3>
            {performanceData.poseAnalysis.recommendations.map((rec, index) => (
              <RecommendationItem key={index}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: rec.priority === 'high' ? '#F44336' : 
                                   rec.priority === 'medium' ? '#FF9800' : '#4CAF50' 
                }} />
                <div>
                  <strong>{rec.category.toUpperCase()}:</strong> {rec.action}
                </div>
              </RecommendationItem>
            ))}
          </RecommendationsSection>
        </SummaryCard>
      </ContentArea>

      {/* Notes Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px auto' }}>
        <SummaryCard>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} />
            Session Notes
          </h2>
          <NotesInput
            placeholder="How did you feel during the workout? Any insights or goals for next time?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <ActionButton className="secondary" onClick={handleSaveNotes}>
            Save Notes
          </ActionButton>
        </SummaryCard>
      </div>

      {/* Action Buttons */}
      <ActionButtons>
        <ActionButton className="secondary" onClick={onReturnHome}>
          <Home size={20} />
          Return to Dashboard
        </ActionButton>
        <ActionButton className="primary" onClick={onStartNewSession}>
          <Play size={20} />
          Start New Session
        </ActionButton>
      </ActionButtons>
    </SummaryContainer>
  );
};

export default PostSessionSummary;
