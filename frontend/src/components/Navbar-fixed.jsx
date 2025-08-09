import React from 'react';
import { motion } from 'framer-motion';
import { Home, Video, History, Settings, BarChart3 } from 'lucide-react';

const Navbar = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'session', icon: Video, label: 'Live' },
    { id: 'summary', icon: BarChart3, label: 'Summary' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{
        margin: '0 16px 16px 16px',
        borderRadius: '16px',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 0'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: isActive ? '#60a5fa' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                minWidth: '60px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = '#9ca3af';
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={24} style={{ marginBottom: '4px' }} />
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif'
              }}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    width: '32px',
                    height: '2px',
                    backgroundColor: '#60a5fa',
                    borderRadius: '999px'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default Navbar;
