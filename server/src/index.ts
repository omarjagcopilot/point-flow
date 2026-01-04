import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupSocketHandlers } from './handlers/socketHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// CORS configuration - allow same-origin in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

const corsOptions = {
  origin: true, // Allow all origins - same server serves frontend
  credentials: true,
  methods: ['GET', 'POST'],
};

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Port:', process.env.PORT || 3001);

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO setup with transports - BEFORE static files
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket'], // Polling first for better compatibility
  allowEIO3: true, // Allow Engine.IO v3 clients
});

// Setup socket event handlers
setupSocketHandlers(io);

// Serve static files from the React app build AFTER socket.io is set up
const clientDistPath = path.join(__dirname, '../../client/dist');
console.log('Static files path:', clientDistPath);

// Don't serve static files for socket.io paths
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) {
    return next();
  }
  express.static(clientDistPath)(req, res, next);
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO status endpoint
app.get('/socket-status', (_req, res) => {
  res.json({ 
    status: 'ok', 
    engine: 'socket.io',
    connections: io.engine.clientsCount 
  });
});

// Serve React app for all other routes (SPA support)
// Exclude socket.io path
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🎯  POINT FLOW SERVER                          ║
  ║                                                   ║
  ║   Server running on port ${PORT}                    ║
  ║   Waiting for connections...                      ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});
