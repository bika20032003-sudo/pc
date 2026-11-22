import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import forceRoutes from './routes/forceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import weaponsRoutes from './routes/weaponsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

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

// Basic Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/force', forceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/weapons', weaponsRoutes);

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
    message: err.message || 'حدث خطأ داخلي في مخدم المنظومة'
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
