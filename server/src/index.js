import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import forceRoutes from './routes/forceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/force', forceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ministry: 'وزارة الداخلية - Libya Ministry of Interior',
    serverTime: new Date().toISOString()
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
