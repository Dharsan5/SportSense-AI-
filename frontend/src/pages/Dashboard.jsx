import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Moon, Activity, Zap } from 'lucide-react';
import CircularProgress from '../components/CircularProgress';
import MetricCard from '../components/MetricCard';

const Dashboard = ({ onStartSession }) => {
  const readinessScore = 87;
  const metrics = [
    {
      icon: Moon,
      label: 'Sleep',
      value: '8h 24m',
      status: 'good',
      score: 92
    },
    {
      icon: Heart,
      label: 'HRV',
      value: '45ms',
      status: 'excellent',
      score: 89
    },
    {
      icon: Activity,
      label: 'Resting HR',
      value: '52 bpm',
      status: 'good',
      score: 85
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
      padding: '16px',
      paddingBottom: '120px' // Extra space for navbar
    }}>
      <div style={{
        maxWidth: '448px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            paddingTop: '32px',
            paddingBottom: '16px'
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            Good morning, Athlete
          </h1>
          <p className="text-gray-400">Ready for today's training?</p>
        </motion.div>

        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="glass-card p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Daily Readiness
            </h3>
            <CircularProgress 
              progress={readinessScore} 
              size={140}
              strokeWidth={8}
            />
            <p className="text-sm text-gray-400 mt-4">
              You're ready to train hard today!
            </p>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 gap-4"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </motion.div>

        {/* Start Session Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pt-6"
        >
          <button
            onClick={onStartSession}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
          >
            <Play className="w-6 h-6" />
            <span className="text-xl">Start Session with Alex</span>
            <Zap className="w-6 h-6 text-yellow-400" />
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="grid grid-cols-2 gap-4 pt-4"
        >
          <button className="glass-card p-4 text-center hover:bg-white/10 transition-all duration-300">
            <Activity className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-gray-300">Quick Workout</p>
          </button>
          <button className="glass-card p-4 text-center hover:bg-white/10 transition-all duration-300">
            <Heart className="w-6 h-6 mx-auto mb-2 text-red-400" />
            <p className="text-sm text-gray-300">Health Check</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
