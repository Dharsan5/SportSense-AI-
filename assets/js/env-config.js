/**
 * Environment Configuration for Production
 * This file helps manage environment variables in production deployments
 */

// For Vercel deployment, environment variables are injected at build time
// This configuration helps access them in vanilla JavaScript

window.ENV = {
  // Supabase Configuration
  VITE_SUPABASE_URL: '%VITE_SUPABASE_URL%',
  VITE_SUPABASE_ANON_KEY: '%VITE_SUPABASE_ANON_KEY%',
  
  // ElevenLabs Configuration
  VITE_ELEVENLABS_API_KEY: '%VITE_ELEVENLABS_API_KEY%'
};

// Helper function to get environment variable with fallback
window.getEnvVar = function(key, fallback = null) {
  // Check if running in development with actual env values
  if (window.ENV[key] && !window.ENV[key].startsWith('%')) {
    return window.ENV[key];
  }
  
  // Fallback value for local development
  return fallback;
};

console.log('Environment configuration loaded for SportSense AI');
