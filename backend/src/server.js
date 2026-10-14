require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Route imports
const transactionsRouter = require('./routes/transactions');
const dashboardRouter = require('./routes/dashboard');
const friendsRouter = require('./routes/friends');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/transactions', transactionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/friends', friendsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Database Connection & Server Start ───────────────────────────────────────
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log(`🚀 OweMate API running at http://localhost:${PORT}`);
      console.log(`   Health:       GET  http://localhost:${PORT}/health`);
      console.log(`   Dashboard:    GET  http://localhost:${PORT}/api/dashboard`);
      console.log(`   Transactions: GET  http://localhost:${PORT}/api/transactions`);
      console.log(`   Friends:      GET  http://localhost:${PORT}/api/friends`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('   Make sure PostgreSQL is running and DATABASE_URL in .env is correct.');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
