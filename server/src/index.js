import './config/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/db.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import forceRoutes from './routes/forceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import weaponsRoutes from './routes/weaponsRoutes.js';
import penaltiesRoutes from './routes/penaltiesRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { getDashboardLiveStats } from './controllers/dashboardController.js';

const app = express();
const PORT = process.env.PORT || 5050;
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5050',
  'http://127.0.0.1:5050',
  'https://bika20032003-sudo.github.io',
  'https://ubarighatroad.ly',
  'http://ubarighatroad.ly',
  'https://www.ubarighatroad.ly',
  'http://www.ubarighatroad.ly'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, Electron, mobile)
    if (!origin) return callback(null, true);

    // Check against explicit allowed list or local patterns
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.ts.net') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      callback(new Error('غير مصرح بهذا النطاق للوصول إلى خوادم وزارة الداخلية'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/force', forceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/weapons', weaponsRoutes);
app.use('/api/penalties', penaltiesRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/operations', operationsRoutes);
app.get('/api/dashboard/stats', authenticateToken, getDashboardLiveStats);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ministry: 'وزارة الداخلية - Libya Ministry of Interior',
    serverTime: new Date().toISOString()
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Frontend Assets (Single Page App) if present
const possibleStaticDirs = [
  process.cwd(),
  path.join(__dirname, '..'),
  path.join(__dirname, '../public'),
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../../client/dist'),
  path.join(process.cwd(), 'dist'),
  path.join(process.cwd(), 'public_html')
];

let staticDir = possibleStaticDirs.find((d) => fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html')));

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// 404 Route handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار المطلوب غير موجود في خوادم المنظومة'
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'حدث خطأ داخلي في مخدم المنظومة' : (err.message || 'طلب غير صالح')
  });
});

// Start Server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 خادم منظومة وزارة الداخلية يعمل بنجاح على المنفذ: http://localhost:${PORT}`);
  });
}

startServer();
