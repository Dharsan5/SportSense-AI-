# Supabase Setup Guide for SportSense AI

## 📋 Overview
This guide will help you set up Supabase as the backend for SportSense AI authentication and user data management.

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: SportSense AI
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
6. Click "Create new project"

### 2. Get Project Credentials
Once your project is created:
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure SportSense AI
1. Open `assets/js/supabase-config.js`
2. Replace the placeholder values:
```javascript
const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co', // Your Project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Your Anon Key
  // NOTE: NEVER include service_role key in frontend code!
};
```

⚠️ **SECURITY WARNING**: 
- **ONLY use the `anon` key** in frontend applications
- **NEVER expose the `service_role` key** in client-side code
- The service role key has admin privileges and should only be used server-side

### 4. Set Up Database Tables

#### Create User Profiles Table
1. Go to **SQL Editor** in your Supabase dashboard
2. Run this SQL to create the user profiles table:

```sql
-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    fitness_level TEXT DEFAULT 'beginner',
    goal TEXT DEFAULT 'general-fitness',
    age INTEGER,
    height DECIMAL,
    weight DECIMAL,
    preferences JSONB DEFAULT '{
        "voice_enabled": true,
        "difficulty_level": "beginner",
        "workout_duration": 30
    }'::jsonb
);

-- Create unique index on user_id
CREATE UNIQUE INDEX user_profiles_user_id_idx ON public.user_profiles(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

#### Create Workout Sessions Table (Optional)
```sql
-- Create workout_sessions table for tracking user workouts
CREATE TABLE public.workout_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    exercise_type TEXT NOT NULL,
    duration_seconds INTEGER,
    reps_completed INTEGER DEFAULT 0,
    sets_completed INTEGER DEFAULT 0,
    calories_burned DECIMAL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_data JSONB DEFAULT '{}'::jsonb
);

-- Set up RLS for workout sessions
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout sessions" ON public.workout_sessions
    USING (auth.uid() = user_id);
```

### 5. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/index.html`
   - `http://localhost:3000/welcome.html`
   - Add your production URLs when deploying

### 6. Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the email templates to match SportSense AI branding
3. Update the confirmation email template

## 🧪 Testing the Integration

### Test Authentication Flow:
1. Open `welcome.html` in your browser
2. Click "Sign Up" and create a new account
3. Check your email for confirmation (if email confirmation is enabled)
4. Try logging in with your credentials
5. Verify you can access the protected home page

### Verify Database:
1. Go to **Table Editor** in Supabase dashboard
2. Check the `user_profiles` table
3. Verify your user data is being stored correctly

## 🔧 Troubleshooting

### Common Issues:

1. **"Supabase not configured" message**
   - Ensure you've updated the credentials in `supabase-config.js`
   - Check that the URL and keys are correct

2. **Authentication not working**
   - Verify your Supabase project is active
   - Check browser console for error messages
   - Ensure RLS policies are set up correctly

3. **Database errors**
   - Make sure the `user_profiles` table exists
   - Verify RLS policies are enabled
   - Check that the user has proper permissions

### Fallback Mode:
If Supabase isn't configured, the app automatically falls back to localStorage for development/testing.

## 🚀 Production Deployment

When deploying to production:
1. Update the Site URL in Supabase Authentication settings
2. Add production redirect URLs
3. Consider upgrading to a paid Supabase plan for better performance
4. Set up database backups
5. Monitor usage in the Supabase dashboard

## 📊 Features Enabled

With Supabase integration, SportSense AI now supports:
- ✅ **Secure Authentication** - Email/password with optional 2FA
- ✅ **User Profiles** - Persistent user data and preferences
- ✅ **Email Confirmation** - Optional email verification
- ✅ **Password Reset** - Built-in password recovery
- ✅ **Session Management** - Automatic token refresh
- ✅ **Real-time Data** - Live updates across devices
- ✅ **Scalable Backend** - Supports thousands of users
- ✅ **Data Security** - Row-level security and encryption

## 🔗 Useful Links
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/auth-signup)
- [SQL Reference](https://supabase.com/docs/guides/database)

Happy coding! 🚀
