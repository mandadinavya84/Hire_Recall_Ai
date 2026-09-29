require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'hirerecall_super_secret_jwt_key_hackathon_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Database configuration
  mongoUri: process.env.MONGODB_URI || null,
  
  // Hindsight configuration (Persistent Experiential Memory)
  hindsight: {
    mode: process.env.HINDSIGHT_MODE || 'remote', // Default: 'remote' (Official Vectorize Hindsight API)
    baseUrl: process.env.HINDSIGHT_BASE_URL || process.env.HINDSIGHT_API_URL || 'https://api.hindsight.vectorize.io',
    apiKey: process.env.HINDSIGHT_API_KEY || '',
    bankId: process.env.HINDSIGHT_BANK_ID || 'hirerecall_recruitment'
  },
  
  // AI Provider configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini', // 'gemini' | 'openai' | 'embedded'
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || ''
  },
  
  // Recruiter persona defaults
  recruiterDefaults: {
    name: process.env.DEFAULT_RECRUITER_NAME || 'Priya Sharma',
    role: process.env.DEFAULT_RECRUITER_ROLE || 'Senior Tech Recruiter & Bar Raiser',
    focus: process.env.DEFAULT_RECRUITER_FOCUS || 'Practical coding, System Design, Communication',
    style: process.env.DEFAULT_RECRUITER_STYLE || 'Scenario-based, Real-world architecture problems'
  }
};
