class VoiceService {
  constructor() {
    this.isInitialized = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.alexVoice = null;
    this.onVoiceCommand = null;
    this.conversationState = 'idle'; // idle, listening, processing, responding
  }

  async initialize() {
    try {
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          this.handleSpeechResult(event);
        };

        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.conversationState = 'idle';
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            // Restart recognition if we're still supposed to be listening
            setTimeout(() => {
              if (this.isListening) {
                this.recognition.start();
              }
            }, 100);
          }
        };
      }

      // Initialize Alex voice
      this.initializeAlexVoice();
      
      this.isInitialized = true;
      console.log('Voice service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      return false;
    }
  }

  initializeAlexVoice() {
    // Find the best available voice for Alex (coach)
    const voices = this.synthesis.getVoices();
    
    // Prefer male voices with clear pronunciation
    const preferredVoices = [
      'Alex', 'Daniel', 'Fred', 'Oliver', 'Samantha'
    ];

    for (const voiceName of preferredVoices) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) {
        this.alexVoice = voice;
        break;
      }
    }

    // Fallback to default voice
    if (!this.alexVoice && voices.length > 0) {
      this.alexVoice = voices[0];
    }
  }

  startListening(onVoiceCommand) {
    if (!this.isInitialized || !this.recognition) {
      console.warn('Voice service not properly initialized');
      return false;
    }

    this.onVoiceCommand = onVoiceCommand;
    this.isListening = true;
    this.conversationState = 'listening';
    
    try {
      this.recognition.start();
      console.log('Started listening for voice commands');
      return true;
    } catch (error) {
      console.error('Failed to start listening:', error);
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    this.conversationState = 'idle';
    
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  handleSpeechResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript && this.onVoiceCommand) {
      this.conversationState = 'processing';
      this.onVoiceCommand(finalTranscript.trim());
    }
  }

  async speakAsAlex(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Stop any current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure Alex's voice characteristics
      utterance.voice = this.alexVoice;
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 0.8; // Lower pitch for authority
      utterance.volume = options.volume || 0.8;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.conversationState = 'responding';
        console.log('Alex started speaking:', text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.conversationState = 'listening';
        console.log('Alex finished speaking');
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.conversationState = 'idle';
        console.error('Speech synthesis error:', event.error);
        reject(new Error(event.error));
      };

      this.synthesis.speak(utterance);
    });
  }

  // Predefined Alex responses for different scenarios
  async provideWorkoutFeedback(feedbackType, data = {}) {
    const responses = {
      encouragement: [
        "Great form! Keep it up!",
        "You're doing excellent! Focus on your breathing.",
        "Perfect technique! I can see the improvement.",
        "That's the way! Maintain that pace."
      ],
      
      formCorrection: [
        "Let's adjust your form. Keep your knees aligned over your toes.",
        "Remember to engage your core and keep your back straight.",
        "I notice your shoulders are rolling forward. Pull them back.",
        "Focus on controlling the movement. Quality over speed."
      ],
      
      restTime: [
        "Take a 60-second rest. Focus on your breathing.",
        "Rest time! Shake out those muscles and prepare for the next set.",
        "Good work! Use this time to hydrate and reset your form.",
        "Rest period. Let your heart rate come down."
      ],
      
      setComplete: [
        "Excellent set! You completed {reps} reps with great form.",
        "Set complete! That was {reps} solid reps. Ready for the next one?",
        "Nice work on that set! I saw consistent form throughout.",
        "Well done! {reps} reps completed. How are you feeling?"
      ],
      
      workoutComplete: [
        "Outstanding workout! You've completed all exercises with excellent form.",
        "Workout complete! You should be proud of that effort.",
        "That's a wrap! Great job pushing through today's session.",
        "Fantastic work today! Your consistency is paying off."
      ],
      
      readinessCheck: [
        "Your readiness score is {score}. You're looking good for today's workout!",
        "Based on your metrics, I'd say you're at {score}% readiness. Let's have a great session!",
        "Your body is telling me you're {score}% ready. Perfect for what we have planned.",
        "Readiness check shows {score}%. Your recovery looks excellent."
      ]
    };

    const messages = responses[feedbackType] || responses.encouragement;
    let message = messages[Math.floor(Math.random() * messages.length)];
    
    // Replace placeholders with actual data
    if (data.reps) message = message.replace('{reps}', data.reps);
    if (data.score) message = message.replace('{score}', data.score);

    await this.speakAsAlex(message);
  }

  // Process natural language commands
  processVoiceCommand(command) {
    const lowercaseCommand = command.toLowerCase();
    
    // Intent recognition (simplified)
    if (lowercaseCommand.includes('start') || lowercaseCommand.includes('begin')) {
      return { intent: 'start_workout', confidence: 0.9 };
    }
    
    if (lowercaseCommand.includes('stop') || lowercaseCommand.includes('pause')) {
      return { intent: 'pause_workout', confidence: 0.9 };
    }
    
    if (lowercaseCommand.includes('next') || lowercaseCommand.includes('continue')) {
      return { intent: 'next_exercise', confidence: 0.8 };
    }
    
    if (lowercaseCommand.includes('help') || lowercaseCommand.includes('form')) {
      return { intent: 'form_help', confidence: 0.8 };
    }
    
    if (lowercaseCommand.includes('rest') || lowercaseCommand.includes('break')) {
      return { intent: 'take_rest', confidence: 0.7 };
    }
    
    if (lowercaseCommand.includes('how') && lowercaseCommand.includes('doing')) {
      return { intent: 'progress_check', confidence: 0.7 };
    }

    // Default response for unclear commands
    return { intent: 'clarification_needed', confidence: 0.3, originalCommand: command };
  }

  // Emergency stop for all voice activities
  emergencyStop() {
    this.stopListening();
    this.synthesis.cancel();
    this.isSpeaking = false;
    this.conversationState = 'idle';
  }

  // Get current state for UI updates
  getState() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      conversationState: this.conversationState
    };
  }
}

export default new VoiceService();
