import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import practiceRoutes from './routes/practices';
import lessonRoutes from './routes/lessons';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Duolingo Coding Backend running smoothly!' });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for FRONTEND_URL: ${FRONTEND_URL}`);
});
