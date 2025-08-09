import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Camera, Square, Volume2 } from 'lucide-react';

const LiveSession = ({ onEndSession }) => {
  const [isRecording, setIsRecording] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Perfect form! Keep it up!');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    const sessionData = {
      duration: sessionTime,
      sets: currentSet,
      totalReps: reps,
      formScore: 87,
      improvements: ['Keep your back straight', 'Slightly slower tempo on the eccentric']
    };
    onEndSession(sessionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 transform rotate-45 scale-150"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
            <div className="text-lg font-bold">{formatTime(sessionTime)}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'} transition-all duration-300`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Camera View */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 mx-4 mb-4 relative"
        >
          <div className="glass-card h-full rounded-3xl overflow-hidden relative">
            {/* Camera Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 text-lg mb-2">Camera Feed</p>
                <p className="text-sm text-gray-500">Position yourself in frame</p>
              </div>

              {/* Pose Detection Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Skeleton lines overlay would go here */}
                <svg className="w-full h-full opacity-30">
                  <defs>
                    <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00bcd4" />
                      <stop offset="100%" stopColor="#2196f3" />
                    </linearGradient>
                  </defs>
                  {/* Example pose points */}
                  <circle cx="50%" cy="20%" r="4" fill="url(#skeletonGradient)" />
                  <circle cx="45%" cy="35%" r="3" fill="url(#skeletonGradient)" />
                  <circle cx="55%" cy="35%" r="3" fill="url(#skeletonGradient)" />
                  <circle cx="40%" cy="50%" r="3" fill="url(#skeletonGradient)" />
                  <circle cx="60%" cy="50%" r="3" fill="url(#skeletonGradient)" />
                </svg>
              </div>
            </div>

            {/* Live Feedback Overlay */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 glass-card p-3 max-w-xs"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Alex says:</span>
              </div>
              <p className="text-sm text-white">{feedback}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Workout Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 mb-4"
        >
          <div className="glass-card p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">{currentSet}</p>
                <p className="text-sm text-gray-400">Sets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{reps}</p>
                <p className="text-sm text-gray-400">Reps</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">87%</p>
                <p className="text-sm text-gray-400">Form</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* End Session Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-4 pb-24"
        >
          <button
            onClick={handleEndSession}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
          >
            <Square className="w-5 h-5" />
            <span className="text-lg">End Session</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveSession;
