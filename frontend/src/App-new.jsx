import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import LiveSession from './pages/LiveSession';
import PostSession from './pages/PostSession';
import Navbar from './components/Navbar';
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

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'session':
        return (
          <motion.div
            key="session"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            <LiveSession onEndSession={handleEndSession} />
          </motion.div>
        );
      case 'summary':
        return (
          <motion.div
            key="summary"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            <PostSession 
              sessionData={sessionData} 
              onReturnToDashboard={() => setCurrentView('dashboard')} 
            />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            <Dashboard onStartSession={handleStartSession} />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {renderCurrentView()}
          </AnimatePresence>
        </div>
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

export default App;
