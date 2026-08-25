import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (cleanUsername.length < 3) {
      return res.status(400).json({ message: 'Username inválido.' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: cleanUsername }] });
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(409).json({ message: 'Este e-mail já está em uso.' });
      }
      return res.status(409).json({ message: 'Este username já está em uso.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username: cleanUsername, name, email: email.toLowerCase(), password: hashed });

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar conta. Tente novamente.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Informe usuário/e-mail e senha.' });
    }
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciais inválidas.' });

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer login. Tente novamente.' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

export default router;
