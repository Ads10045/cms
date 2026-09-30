const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const { startupLogger, appLogger, frontendLogger } = require('./logger');
require('./config/db'); // Initialize DB
const swaggerSpec = require('./config/swagger');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: config.security.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket.io authentication middleware
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.match(/token=([^;]+)/)?.[1];
  if (!token) return next(new Error('Unauthorized: no token'));
  try {
    socket.user = jwt.verify(token, config.security.jwtSecret);
    next();
  } catch (e) {
    next(new Error('Unauthorized: invalid token'));
  }
});

io.on('connection', (socket) => {
  appLogger.info(`New client connected: ${socket.id} (user: ${socket.user?.username})`);
  socket.on('disconnect', () => {
    appLogger.info(`Client disconnected: ${socket.id}`);
  });
});

app.set('trust proxy', 1);

// Security: HTTP headers with CSP enabled
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", `wss://${new URL(config.server.url).hostname}`],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Security: Rate Limiting — general API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: config.security.rateLimitMax,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: Rate Limiting — auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// General Middleware
// Note: credentials: true is required for cookies to be sent across domains (if applicable)
app.use(cors({ origin: config.security.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const swaggerAuth = require('./middleware/swaggerAuth');

// Swagger Configuration - Only accessible in development mode
if (config.isDev) {
  app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  startupLogger.info('Swagger UI enabled at /api-docs (development only, protected by Basic Auth)');
} else {
  app.use('/api-docs', (req, res) => {
    res.status(404).json({ error: 'Documentation not available in this environment.' });
  });
}

// Middleware to log API requests
app.use((req, res, next) => {
  if (req.url !== '/api/logs' && !req.url.startsWith('/api-docs')) {
    appLogger.info(`[REQ] ${req.method} ${req.url}`);
  }
  next();
});

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Routes — Frontend logs (rate-limited, input truncated)
const logsLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.post('/api/logs', logsLimiter, (req, res) => {
  const { level, message, stack } = req.body;
  const safeMsg = String(message || '').slice(0, 500);
  const safeStack = stack ? String(stack).slice(0, 1000) : '';
  if (level === 'error') {
    frontendLogger.error(`[FRONTEND] ${safeMsg}${safeStack ? ' - ' + safeStack : ''}`);
  } else {
    frontendLogger.info(`[FRONTEND] ${safeMsg}`);
  }
  res.status(200).send({ success: true });
});

// Import and apply messages routes, passing the Socket.io instance
const messagesRoutes = require('./routes/messages')(io);
app.use('/api/messages', messagesRoutes);

const PORT = config.server.port;
server.listen(PORT, () => {
  startupLogger.info(`[${config.env.toUpperCase()}] Backend server & Socket.io running on port ${PORT}`);
});
