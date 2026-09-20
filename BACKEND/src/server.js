import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { initDB } from './config/db.js';
import { initSocketService } from './services/socketService.js';
import eventRoutes from './routes/eventRoutes.js';
import agendaRoutes from './routes/agendaRoutes.js';
import speakerRoutes from './routes/speakerRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import logRoutes from './routes/logRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  transports: ['websocket', 'polling']
});

initSocketService(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Smart Anchor & Stage Flow Management System',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 Catch-All
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Start Database & Server
const startServer = async () => {
  try {
    await initDB();
    server.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🎙️  Smart Anchor Backend Online on http://localhost:${PORT}`);
      console.log(`⚡  Socket.IO Real-time Hub active`);
      console.log(`🤖  Gemini AI Synthesis Service initialized`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('[Startup Error] Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
