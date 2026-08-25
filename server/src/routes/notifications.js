import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username name avatar verified')
      .populate('post', 'type content');
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar notificações.' });
  }
});

router.put('/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'Notificações marcadas como lidas.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar notificações.' });
  }
});

export default router;
