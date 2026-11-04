import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import productionRoutes from './routes/productionRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];

// Initialize Socket.io with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Store io in express app context for controllers
app.set('io', io);

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

  socket.on('join:room', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', (reason) => {
    // Normal browser lifecycle: page refreshed, navigated, or tab closed
    console.log(`ℹ️ [Socket.io] Client disconnected: ${socket.id} (${reason})`);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'OilSync Enterprise Backend API',
    realTime: 'Socket.io Connected',
    database: 'MongoDB',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Handle server-level errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use by another running instance of the backend.\n   To fix this, close the other terminal or kill the process on port ${PORT}.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

// Connect to MongoDB and then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
  🛢️ ========================================================
  🚀 OilSync Factory Backend API & Real-Time Server running!
  📡 REST API Base:  http://localhost:${PORT}/api
  ⚡ Socket.io URL:  http://localhost:${PORT}
  🌿 Database:       MongoDB (Mongoose ODM)
  🏥 Health Check:   http://localhost:${PORT}/api/health
  ========================================================
    `);
  });
});

export default app;
