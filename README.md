# SportSense AI - AI-Powered Personal Training Coach

## 🏃‍♂️ Overview

SportSense AI is a revolutionary conversational sports coaching application that delivers personalized, real-time guidance through voice interaction, wearable integration, and computer vision analysis. It replicates the experience of having a personal coach anywhere, anytime, without the cost or physical presence.

## 🎯 Problem Statement

Many athletes and fitness enthusiasts lack access to personalized, high-quality coaching due to:
- High costs of personal trainers
- Time constraints and scheduling conflicts
- Location barriers in remote areas
- Generic training programs that don't adapt to real-time performance
- Lack of instant, actionable feedback leading to slower progress and higher injury risk

## 👥 Target Audience

- **Amateur and semi-professional athletes** seeking performance improvement
- **Fitness enthusiasts** wanting personalized training guidance
- **People in remote areas** without access to expert coaches
- **Sports coaches** looking to enhance training sessions with data-driven insights

## ✨ Core Features

### 🎤 Voice-First AI Coaching
- **Real-time voice feedback** during workouts using advanced speech synthesis
- **Natural conversation flow** with "Alex," your AI personal trainer
- **Hands-free interaction** allowing focus on movement quality

### 📊 Smart Readiness Assessment
- **Wearable integration** with HealthKit/Google Fit APIs
- **Sleep quality analysis** to optimize training timing
- **Heart Rate Variability (HRV)** monitoring for recovery assessment
- **Stress level tracking** with adaptive training adjustments

### 🎥 Real-Time Form Analysis
- **Computer vision** powered by TensorFlow.js
- **Pose detection** with skeletal tracking
- **Form fault identification** with corrective feedback
- **Movement quality scoring** in real-time

### 🏋️‍♀️ Adaptive Training Plans
- **Dynamic adjustments** based on performance metrics
- **Personalized difficulty scaling** according to readiness scores
- **Progressive overload** with AI-driven progression

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser with camera and microphone access
- Webcam for pose detection

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` and allow camera/microphone permissions

## 🎮 Usage

### 1. Dashboard
- View your daily readiness score based on sleep, HRV, and recovery metrics
- See personalized workout recommendations
- Start a training session with Alex

### 2. Live Training Session
- **Voice Commands**: "Start workout", "Pause", "Next exercise", "How am I doing?"
- **Real-time Feedback**: Instant form corrections and encouragement
- **Pose Analysis**: Live skeletal tracking with fault detection
- **Progress Tracking**: Rep counting and set management

### 3. Post-Session Analysis
- Detailed form analysis with specific improvement recommendations
- Performance metrics and trends
- Session notes and reflection

## 🧠 AI Features

### Form Analysis
- **Knee Valgus Detection**: Identifies inward knee collapse during squats
- **Forward Head Posture**: Corrects cervical spine alignment
- **Range of Motion Analysis**: Ensures adequate exercise depth
- **Bilateral Comparison**: Detects left-right movement imbalances

### Voice AI Capabilities
- **Intent Recognition**: Understands natural language commands
- **Contextual Responses**: Provides relevant feedback based on exercise phase
- **Encouragement System**: Motivational coaching throughout workouts

## 🏗️ Technical Architecture

### Frontend Stack
- **React** with functional components and hooks
- **Styled Components** for responsive, modern UI
- **TensorFlow.js** for on-device machine learning
- **Web Speech API** for voice interaction
- **Recharts** for data visualization

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/           # Main dashboard with readiness metrics
│   │   ├── LiveSession/         # Real-time training session interface
│   │   └── PostSession/         # Workout summary and analysis
│   ├── services/
│   │   ├── apiService.js        # Backend API integration
│   │   ├── poseDetectionService.js  # Computer vision processing
│   │   ├── voiceService.js      # Speech recognition and synthesis
│   │   └── healthDataService.js # Health metrics integration
│   └── utils/
│       └── workoutUtils.js      # Exercise analysis utilities
```

## 🔮 Current Implementation Status

✅ **Completed Features:**
- Dashboard with readiness metrics visualization
- Live session interface with pose detection
- Voice service integration with speech synthesis
- Post-session analysis and recommendations
- Mock data services for development and testing
- Responsive UI with modern design

🚧 **In Development:**
- Advanced pose fault detection algorithms
- Integration with real health APIs
- Enhanced voice command processing
- Mobile-responsive optimizations

📋 **Planned Features:**
- ElevenLabs API integration for high-quality voice
- MediaPipe integration for improved pose detection
- Backend API development
- Database integration for user progress tracking

## 📊 Current Demo Features

The current implementation includes:
- **Interactive Dashboard** showing health metrics and workout plans
- **Live Camera Feed** with simulated pose detection overlay
- **Voice Interaction** using Web Speech API
- **Real-time Feedback** system with form analysis
- **Session Summary** with performance analytics
- **Mock Data** for realistic user experience testing

## 🤝 Contributing

We welcome contributions! Areas for contribution:
- **Exercise Library**: Add new exercise detection algorithms
- **Voice Commands**: Expand natural language processing
- **UI/UX Improvements**: Enhance user experience
- **Performance Optimization**: Improve real-time processing

---

**SportSense AI - Your Personal Training Revolution Starts Here** 🏆

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
