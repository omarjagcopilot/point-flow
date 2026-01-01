"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socketHandlers_js_1 = require("./handlers/socketHandlers.js");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Socket.IO setup
const io = new socket_io_1.Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
});
// Setup socket event handlers
(0, socketHandlers_js_1.setupSocketHandlers)(io);
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