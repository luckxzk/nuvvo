import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      // Requisições sem origin (apps mobile, curl, health checks) são permitidas.
      if (!origin) return callback(null, true);
      if (origin === allowedOrigin) return callback(null, true);
      // Permite qualquer subdomínio da Vercel (produção e previews de deploy).
      if (/\.vercel\.app$/i.test(origin)) return callback(null, true);
      return callback(new Error('Não permitido pelo CORS.'));
    },
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Multer / general error handler
app.use((err, req, res, next) => {
  console.error('ERRO CAPTURADO:', err);
  if (err && err.message) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nuvvo';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado.');
    app.listen(PORT, () => console.log(`NUVVO server rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });
