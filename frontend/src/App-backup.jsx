import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sessionData, setSessionData] = useState(null);

  const handleStartSession = () => {
    setCurrentView('session');
  };

  const handleEndSession = (data) => {
    setSessionData(data);
    setCurrentView('summary');
  };

  const handleReturnHome = () => {
    setCurrentView('dashboard');
    setSessionData(null);
  };

  const handleStartNewSession = () => {
    setCurrentView('session');
    setSessionData(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'session':
        return (
          <div style={{
            height: '100vh',
            background: '#000',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem'
          }}>
            Live Session Coming Soon...
          </div>
        );
      case 'summary':
        return (
          <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem'
          }}>
            Session Summary Coming Soon...
          </div>
        );
      default:
        return (
          <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>SportSense AI</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px' }}>Your AI-Powered Personal Training Coach</p>
            <button 
              onClick={handleStartSession}
              style={{
                padding: '20px 40px',
                fontSize: '1.2rem',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Start Training Session
            </button>
          </div>
        );
    }
  };

  return (
    <Router>
      <div className="App">
        {renderCurrentView()}
      </div>
    </Router>
  );
}

export default App;
