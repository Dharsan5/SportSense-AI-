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
        return <Dashboard onStartSession={handleStartSession} />;
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
