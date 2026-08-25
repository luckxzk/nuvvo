import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
const USER_FIELDS = 'username name avatar verified';

router.get('/conversations', protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const results = await Message.aggregate([
      { $match: { $or: [{ sender: myId }, { recipient: myId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', myId] }, '$recipient', '$sender'],
          },
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$recipient', myId] }, { $eq: ['$read', false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const userIds = results.map((r) => r._id);
    const users = await User.find({ _id: { $in: userIds } }).select(USER_FIELDS);
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const conversations = results
      .filter((r) => userMap.has(r._id.toString()))
      .map((r) => ({
        user: userMap.get(r._id.toString()),
        lastMessage: r.lastMessage,
        unread: r.unread,
      }));

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar conversas.' });
  }
});

router.get('/thread/:username', protect, async (req, res) => {
  try {
    const other = await User.findOne({ username: req.params.username.toLowerCase() }).select(USER_FIELDS);
    if (!other) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: other._id },
        { sender: other._id, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany({ sender: other._id, recipient: req.user._id, read: false }, { read: true });

    res.json({ user: other, messages });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar conversa.' });
  }
});

router.post('/thread/:username', protect, upload.single('file'), async (req, res) => {
  try {
    const other = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!other) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (other._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'Você não pode enviar mensagens para si mesmo.' });
    }

    const { type, text } = req.body;
    let content = '';

    if (type === 'text') {
      if (!text || !text.trim()) return res.status(400).json({ message: 'Escreva uma mensagem.' });
      content = text.trim().slice(0, 2000);
    } else if (type === 'image' || type === 'audio' || type === 'video') {
      if (!req.file) return res.status(400).json({ message: 'Selecione um arquivo.' });
      content = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Tipo de mensagem inválido.' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: other._id,
      type,
      content,
    });

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erro ao enviar mensagem.' });
  }
});

export default router;
