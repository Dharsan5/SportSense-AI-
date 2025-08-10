'use strict';

/**
 * Supabase Configuration and Setup
 * SportSense AI Backend Integration
 */

// Supabase configuration - FRONTEND ONLY
const SUPABASE_CONFIG = {
  url: 'https://fbjmqrxlwgqojqardgqo.supabase.co', // Your Supabase project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiam1xcnhsd2dxb2pxYXJkZ3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTUyNjQsImV4cCI6MjA3MDM5MTI2NH0.uE0MtSSN5v1KmER0xSY-nRNPrj1u5RfFYW3pfIdzzBI' // Your Supabase anon key (safe for frontend)
 
};

// Initialize Supabase client
let supabase = null;

// Initialize Supabase
const initializeSupabase = async function() {
  try {
    // Load Supabase library if not already loaded
    if (typeof window.supabase === 'undefined') {
      console.log('Loading Supabase library...');
      
      // Dynamically load Supabase JS library
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js';
      script.onload = function() {
        console.log('Supabase library loaded');
        createSupabaseClient();
      };
      script.onerror = function() {
        console.error('Failed to load Supabase library');
        fallbackToLocalStorage();
      };
      document.head.appendChild(script);
    } else {
      createSupabaseClient();
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    fallbackToLocalStorage();
  }
};

// Create Supabase client
const createSupabaseClient = function() {
  try {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      console.log('Supabase client initialized');
      
      // Set up auth state listener
      setupAuthStateListener();
    } else {
      console.warn('Supabase credentials not configured, falling back to localStorage');
      fallbackToLocalStorage();
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    fallbackToLocalStorage();
  }
};

// Setup authentication state listener
const setupAuthStateListener = function() {
  if (!supabase) return;
  
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', session.user.email);
      handleUserSignedIn(session.user);
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      handleUserSignedOut();
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed');
    }
  });
};

// Handle user signed in
const handleUserSignedIn = async function(user) {
  try {
    // Get or create user profile
    const userProfile = await getOrCreateUserProfile(user);
    
    // Store user data locally for quick access
    localStorage.setItem('sportsense_user', JSON.stringify(userProfile));
    localStorage.setItem('sportsense_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      lastLogin: new Date().toISOString()
    }));
    
    console.log('User profile loaded:', userProfile.name);
  } catch (error) {
    console.error('Error handling user sign in:', error);
  }
};

// Handle user signed out
const handleUserSignedOut = function() {
  // Clear local storage
  localStorage.removeItem('sportsense_user');
  localStorage.removeItem('sportsense_session');
  
  // Redirect to welcome page if on protected page
  const protectedPages = ['index.html', 'dashboard.html', 'live-session.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage) || currentPage === '') {
    window.location.href = 'welcome.html';
  }
};

// Get or create user profile in database
const getOrCreateUserProfile = async function(user) {
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingProfile && !fetchError) {
      console.log('Found existing user profile');
      return existingProfile;
    }
    
    // If no profile exists, create one
    console.log('Creating new user profile');
    const newProfile = {
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fitness_level: 'beginner',
      goal: 'general-fitness',
      age: null,
      height: null,
      weight: null,
      preferences: {
        voice_enabled: true,
        difficulty_level: 'beginner',
        workout_duration: 30
      }
    };
    
    const { data: createdProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user profile:', createError);
      return newProfile; // Return local profile if database fails
    }
    
    return createdProfile;
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    // Return basic profile if database operations fail
    return {
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      fitness_level: 'beginner',
      goal: 'general-fitness'
    };
  }
};

/**
 * Update user profile in database
 */
const updateUserProfile = async function(userId, profileData) {
  if (!supabase) {
    console.warn('Supabase not available, storing in localStorage');
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    return { success: false, data: profileData };
  }

  try {
    console.log('Updating user profile in database:', profileData);
    
    // Prepare data for database update
    const updateData = {
      updated_at: new Date().toISOString(),
      age: profileData.personalInfo?.age ? parseInt(profileData.personalInfo.age) : null,
      height: profileData.personalInfo?.height ? parseFloat(profileData.personalInfo.height) : null,
      weight: profileData.personalInfo?.weight ? parseFloat(profileData.personalInfo.weight) : null,
      name: profileData.personalInfo?.fullName || null,
      fitness_level: profileData.fitnessGoals?.fitnessLevel || null,
      goal: profileData.fitnessGoals?.goal || null,
      workout_frequency: profileData.fitnessGoals?.workoutFrequency || null,
      workout_duration: profileData.fitnessGoals?.workoutDuration || null,
      preferences: {
        voice_enabled: profileData.preferences?.voiceEnabled || false,
        email_notifications: profileData.preferences?.emailNotifications || false,
        progress_reminders: profileData.preferences?.progressReminders || false,
        difficulty_level: profileData.preferences?.difficultyLevel || 'beginner'
      }
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      // Fallback to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      return { success: false, error: error.message, data: profileData };
    }

    console.log('User profile updated successfully in database');
    
    // Also update localStorage for quick access
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    return { success: true, data: data };
    
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    // Fallback to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    return { success: false, error: error.message, data: profileData };
  }
};

/**
 * Get user profile from database
 */
const getUserProfile = async function(userId) {
  if (!supabase) {
    console.warn('Supabase not available, getting from localStorage');
    const localProfile = localStorage.getItem('userProfile');
    return localProfile ? JSON.parse(localProfile) : null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to localStorage
      const localProfile = localStorage.getItem('userProfile');
      return localProfile ? JSON.parse(localProfile) : null;
    }

    // Convert database format to frontend format
    const profileData = {
      personalInfo: {
        fullName: data.name,
        email: data.email,
        age: data.age,
        height: data.height,
        weight: data.weight
      },
      fitnessGoals: {
        fitnessLevel: data.fitness_level,
        goal: data.goal,
        workoutFrequency: data.workout_frequency,
        workoutDuration: data.workout_duration
      },
      preferences: {
        voiceEnabled: data.preferences?.voice_enabled || false,
        emailNotifications: data.preferences?.email_notifications || false,
        progressReminders: data.preferences?.progress_reminders || false,
        difficultyLevel: data.preferences?.difficulty_level || 'beginner'
      }
    };

    // Also store in localStorage for quick access
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    return profileData;
    
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    // Fallback to localStorage
    const localProfile = localStorage.getItem('userProfile');
    return localProfile ? JSON.parse(localProfile) : null;
  }
};

// Fallback to localStorage when Supabase is not available
const fallbackToLocalStorage = function() {
  console.log('Using localStorage fallback for authentication');
  window.supabaseAvailable = false;
};

// Check if Supabase is configured (frontend credentials only)
const isSupabaseConfigured = function() {
  return SUPABASE_CONFIG.url && 
         SUPABASE_CONFIG.anonKey && 
         SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
         SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
};

// Export functions for use in other files
window.supabaseAuth = {
  supabase: () => supabase,
  isConfigured: isSupabaseConfigured,
  initialize: initializeSupabase,
  getOrCreateUserProfile: getOrCreateUserProfile,
  updateUserProfile: updateUserProfile,
  getUserProfile: getUserProfile
};

// Auto-initialize if configuration is available
if (isSupabaseConfigured()) {
  initializeSupabase();
} else {
  console.log('Supabase not configured, update SUPABASE_CONFIG in supabase-config.js');
  fallbackToLocalStorage();
}

console.log('Supabase configuration loaded');
