import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './handlers/socketHandlers.js';
const app = express();
const httpServer = createServer(app);
// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://pointflowio.vercel.app',
    process.env.CLIENT_URL,
].filter(Boolean);
console.log('Allowed origins:', allowedOrigins);
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
            return callback(null, true);
        }
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
// Socket.IO setup
const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
});
// Setup socket event handlers
setupSocketHandlers(io);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🎯  POINT FLOW SERVER                          ║
  ║                                                   ║
  ║   Server running on http://localhost:${PORT}        ║
  ║   Waiting for connections...                      ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});
//# sourceMappingURL=index.js.map