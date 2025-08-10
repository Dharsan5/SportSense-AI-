
  <br />

  <h2 align="center">SportSense AI - AI-Powered Fitness Platform</h2>

  SportSense AI is a revolutionary fitness platform that combines artificial intelligence with workout training. Built using HTML, CSS, JavaScript, and Supabase backend with real-time form analysis, personalized coaching, and comprehensive user profile management.


</div>

<br />


## Features

✨ **AI-Powered Form Analysis** - Real-time movement tracking and form correction
🎯 **Smart Dashboard** - Comprehensive fitness metrics and progress tracking
🔴 **Live Session Monitoring** - Interactive workout sessions with instant feedback
📊 **Post-Session Analytics** - Detailed performance analysis and improvement suggestions
🤖 **Personalized Coaching** - AI-driven recommendations based on your performance
👤 **Complete Profile System** - Comprehensive user profile with age, height, weight, fitness goals
💾 **Database Integration** - All user data persisted with Supabase backend
🔐 **Authentication System** - Secure user accounts with email/password login
📱 **Responsive Design** - Optimized for all devices and screen sizes
⚡ **Real-time Updates** - Auto-save profile changes with instant feedback

## New Features Added

🆕 **Profile Management**
- Complete user profile with personal information
- Fitness goals and preferences configuration
- Real-time profile summary with clickable cards
- Auto-save functionality with database persistence

🆕 **Authentication & Security**
- Supabase authentication integration
- Secure user registration and login
- Row-level security for data protection
- Session management across pages

🆕 **Enhanced User Experience**
- Interactive profile cards that navigate to edit sections
- Smooth scrolling navigation
- Toast notifications for user feedback
- Responsive design improvements

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Design**: Modern glassmorphism UI with orange accent theme
- **AI Integration**: Motion capture and form analysis simulation
- **Authentication**: Email/password with session management
- **Responsive**: Mobile-first design approach
- **Storage**: Real-time database sync with localStorage fallback

## Architecture

```
Frontend (HTML/CSS/JS) ↔ Supabase Backend ↔ PostgreSQL Database
                      ↕
            localStorage (offline fallback)
```

## Pages & Functionality

- **`index.html`** - Home page with user authentication and profile overview
- **`dashboard.html`** - Comprehensive fitness dashboard with metrics
- **`live-session.html`** - Real-time workout session with AI feedback
- **`post-session.html`** - Detailed post-workout analysis
- **`profile.html`** - Complete user profile management system
- **`login.html`** & **`signup.html`** - Authentication pages

### Prerequisites

Before you begin, ensure you have met the following requirements:

* [Git](https://git-scm.com/downloads "Download Git") must be installed on your operating system
* A modern web browser (Chrome, Firefox, Safari, or Edge)
* **Supabase Account** (for database functionality) - [Create free account](https://supabase.com)
* Basic knowledge of HTML/CSS/JavaScript (for development)

### Quick Start

**Option 1: Live Demo**
Visit the live application: [SportSense AI Demo](https://dharsan5.github.io/SportSense-AI-/)

**Option 2: Local Development**

**Option 2: Local Development**

To run **SportSense AI** locally, follow these steps:

**1. Clone the repository:**

```bash
# Linux and macOS:
sudo git clone https://github.com/Dharsan5/SportSense-AI-.git

# Windows:
git clone https://github.com/Dharsan5/SportSense-AI-.git
```

**2. Navigate to project directory:**

```bash
cd SportSense-AI-
```

**3. Set up Supabase (Required for full functionality):**
- Create a Supabase project at [supabase.com](https://supabase.com)
- Run the SQL schema from `DATABASE_SCHEMA.sql` in your Supabase SQL editor
- Update `assets/js/supabase-config.js` with your Supabase URL and anon key

**4. Launch the application:**

```bash
# Option A: Using Python (recommended)
python -m http.server 8000

# Option B: Using Node.js
npx http-server

# Option C: Using PHP
php -S localhost:8000

# Then open: http://localhost:8000
```

### Database Setup

For full functionality including user profiles and data persistence:

1. **Create Supabase Project** - [Get started free](https://supabase.com)
2. **Run Database Schema** - Execute `DATABASE_SCHEMA.sql` in Supabase SQL editor
3. **Configure Authentication** - Enable email/password auth in Supabase dashboard
4. **Update Config** - Add your Supabase credentials to `supabase-config.js`

See `DATABASE_INTEGRATION.md` for detailed setup instructions.

### Project Structure

```
SportSense-AI/
├── index.html                    # Authenticated home page with profile overview
├── welcome.html                  # Landing page for new users
├── dashboard.html                # User dashboard with fitness metrics
├── live-session.html             # Real-time workout session interface
├── post-session.html             # Post-workout analysis and feedback
├── profile.html                  # Complete user profile management
├── login.html & signup.html      # Authentication pages
├── DATABASE_SCHEMA.sql           # Database setup for Supabase
├── DATABASE_INTEGRATION.md       # Database setup documentation
├── SUPABASE_SETUP.md            # Supabase configuration guide
├── assets/
│   ├── css/
│   │   ├── style.css            # Main stylesheet
│   │   ├── pages.css            # Page-specific styles
│   │   ├── auth.css             # Authentication styles
│   │   └── dashboard.css        # Dashboard styles
│   ├── js/
│   │   ├── supabase-config.js   # Database configuration
│   │   ├── profile.js           # Profile management
│   │   ├── auth.js              # Authentication logic
│   │   ├── dashboard.js         # Dashboard functionality
│   │   ├── home-auth.js         # Home page authentication
│   │   └── script.js            # Main application logic
│   └── images/                  # Project assets and icons
└── README.md
```

## User Experience Flow

1. **🚀 Welcome** - New users land on welcome page
2. **🔐 Authentication** - Sign up or log in securely
3. **🏠 Home Dashboard** - Personalized home with profile overview
4. **👤 Profile Management** - Complete profile setup with real-time updates
5. **📊 Fitness Dashboard** - Track progress and view analytics
6. **🔴 Live Sessions** - Interactive AI-powered workouts
7. **📈 Post-Session** - Detailed analysis and recommendations

## Key Features in Detail

### 🔒 Authentication System
- Secure email/password registration and login
- Session management across all pages
- Automatic redirection based on auth status
- Row-level security for data protection

### 👤 Profile Management
- **Personal Info**: Name, email, age, height, weight
- **Fitness Goals**: Level, objectives, workout frequency
- **Preferences**: Voice settings, notifications, difficulty
- **Real-time Updates**: Auto-save with visual feedback
- **Interactive Cards**: Click to edit specific sections

### 💾 Database Integration
- **Supabase Backend**: PostgreSQL with real-time sync
- **Auto-save**: Changes saved automatically after 2s
- **Offline Fallback**: localStorage backup when offline
- **Cross-device Sync**: Access data from any device

## Screenshots

### Home Page with Profile Overview
![Home Page](readme-images/desktop.png)

*Authenticated users see personalized home page with profile overview, fitness stats, and quick access to all features*

### Key Highlights

- ✅ **Production Ready** - Emoji-free codebase optimized for Vercel deployment
- ✅ **Full Authentication** - Complete user registration and login system
- ✅ **Database Persistence** - All user data saved to Supabase PostgreSQL
- ✅ **Real-time Updates** - Profile changes reflect instantly across pages
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Professional UI** - Modern glassmorphism design with smooth animations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables for Supabase
3. Deploy with automatic builds on git push

### Other Platforms
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Static hosting for frontend
- **Heroku**: Full-stack deployment option

### Contact

If you want to contact me, you can reach me at:
- **GitHub**: [Dharsan5](https://github.com/Dharsan5)
- **Email**: dharsansp.23cse@kongu.edu
- **Institution**: KEC, Erode
- **LinkedIn**: [Connect with me](https://linkedin.com/in/dharsan5)

### License

This project is **free to use** and does not contain any license. Feel free to use it for educational purposes and personal projects.

### Acknowledgments

- 🏆 **MIT Hackathon Project** - Developed as part of prestigious hackathon
- 🏫 **KEC, Erode** - Academic institution support
- 🚀 **Supabase** - Backend infrastructure and database
- 🎨 **Modern Web Technologies** - HTML5, CSS3, JavaScript ES6+
- 💡 **AI Integration** - Form analysis and motion detection concepts

### Version History

- **v2.0** - Complete profile system with database integration
- **v1.5** - Authentication system and user management
- **v1.0** - Initial release with AI-powered fitness tracking

---

<div align="center">
  <h3>🔥 SportSense AI - Where Technology Meets Fitness 🔥</h3>
  <p><strong>Made by Dharshan</strong></p>
  <p>
    <a href="https://github.com/Dharsan5/SportSense-AI-">⭐ Star this repo</a> • 
    <a href="https://github.com/Dharsan5/SportSense-AI-/issues">🐛 Report Bug</a> • 
    <a href="https://github.com/Dharsan5/SportSense-AI-/pulls">🚀 Request Feature</a>
  </p>
</div>
