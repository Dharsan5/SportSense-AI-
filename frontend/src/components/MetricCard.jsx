import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, label, value, status, score }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-400/20';
      case 'good':
        return 'bg-blue-400/20';
      case 'fair':
        return 'bg-yellow-400/20';
      case 'poor':
        return 'bg-red-400/20';
      default:
        return 'bg-gray-400/20';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-4 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusBg(status)}`}>
            <Icon className={`w-5 h-5 ${getStatusColor(status)}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-sm font-semibold ${getStatusColor(status)} capitalize`}>
            {status}
          </div>
          <div className="text-xs text-gray-400">
            {score}/100
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${
            status === 'excellent' ? 'bg-green-400' :
            status === 'good' ? 'bg-blue-400' :
            status === 'fair' ? 'bg-yellow-400' :
            'bg-red-400'
          }`}
        />
      </div>
    </motion.div>
  );
};

export default MetricCard;
