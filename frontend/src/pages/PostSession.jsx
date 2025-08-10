import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, RotateCcw, Home } from 'lucide-react';

const PostSession = ({ sessionData, onReturnToDashboard }) => {
  const mockSessionData = sessionData || {
    duration: 1845, // 30:45
    sets: 4,
    totalReps: 48,
    formScore: 87,
    improvements: [
      'Keep your back straight during squats',
      'Slightly slower tempo on the eccentric phase',
      'Maintain consistent breathing pattern'
    ]
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sessionBreakdown = [
    { set: 1, reps: 12, weight: '135 lbs', form: 92 },
    { set: 2, reps: 12, weight: '135 lbs', form: 89 },
    { set: 3, reps: 12, weight: '135 lbs', form: 85 },
    { set: 4, reps: 12, weight: '135 lbs', form: 82 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-4"
        >
          <div className="glass-card p-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Session Complete!
            </h1>
            <p className="text-gray-400">Great work today, keep it up!</p>
          </div>
        </motion.div>

        {/* Form Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Form Consistency Score
            </h3>
            <div className="relative">
              <div className="text-5xl font-bold text-green-400 mb-2">
                {mockSessionData.formScore}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mockSessionData.formScore}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-400">
                Excellent form throughout your session
              </p>
            </div>
          </div>
        </motion.div>

        {/* Session Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatDuration(mockSessionData.duration)}
            </div>
            <p className="text-sm text-gray-400">Duration</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {mockSessionData.totalReps}
            </div>
            <p className="text-sm text-gray-400">Total Reps</p>
          </div>
        </motion.div>

        {/* Session Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Session Breakdown
          </h3>
          <div className="space-y-3">
            {sessionBreakdown.map((set, index) => (
              <motion.div
                key={set.set}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-400">
                      {set.set}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {set.reps} reps × {set.weight}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    set.form >= 90 ? 'text-green-400' :
                    set.form >= 80 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {set.form}%
                  </div>
                  <div className="text-xs text-gray-400">Form</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Improvement Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Key Improvements
          </h3>
          <div className="space-y-3">
            {mockSessionData.improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">{improvement}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="grid grid-cols-2 gap-4 pt-4"
        >
          <button
            onClick={onReturnToDashboard}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105">
            <RotateCcw className="w-5 h-5" />
            <span>New Session</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PostSession;
