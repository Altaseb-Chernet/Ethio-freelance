// server/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const bidRoutes = require('./routes/bids');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/payments');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-freelance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('MongoDB connected successfully'))
.catch(err => logger.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Root route for health or info
app.get('/', (req, res) => {
  res.send('Backend is running! Use /api/... for API routes or /health for status.');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io for real-time features
require('./services/socketService')(io);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
