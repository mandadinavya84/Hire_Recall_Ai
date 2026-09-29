const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./data/dbAdapter');
const runSeed = require('./data/seed');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const roleRoutes = require('./routes/roleRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();

// Initialize or auto-seed on clean start
const existingCandidates = db.find('candidates', {});
if (existingCandidates.length === 0) {
  console.log('Database empty on startup. Auto-seeding initial demo dataset...');
  runSeed();
}

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'HireRecall AI',
    version: '1.0.0',
    hindsightStatus: config.hindsight.mode,
    timestamp: new Date().toISOString()
  });
});

// Dedicated Hindsight Health & Status Check
const memoryService = require('./services/hindsight/memoryService');
const hindsightHealthHandler = async (req, res) => {
  const health = await memoryService.getHindsightHealth();
  const statusCode = health.connected ? 200 : 503;
  res.status(statusCode).json({
    success: health.connected,
    ...health
  });
};
app.get('/api/health/hindsight', hindsightHealthHandler);
app.get('/api/hindsight/health', hindsightHealthHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/seed', seedRoutes);

// Error Handling
app.use(errorHandler);

const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🧠 HireRecall AI Backend Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🧬 Hindsight Engine: ${config.hindsight.mode.toUpperCase()}`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
