import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/search', protect, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ users: [] });
    const regex = new RegExp(q, 'i');
    const users = await User.find({ $or: [{ username: regex }, { name: regex }] })
      .limit(20)
      .select('username name avatar verified');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao pesquisar usuários.' });
  }
});

router.get('/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const postsCount = await Post.countDocuments({ author: user._id });
    res.json({ user: { ...user.toSafeObject(), postsCount } });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
});

router.get('/:username/posts', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username name avatar verified');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar publicações.' });
  }
});

router.get('/:username/followers', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).populate(
      'followers',
      'username name avatar verified'
    );
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ users: user.followers });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar seguidores.' });
  }
});

router.get('/:username/following', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).populate(
      'following',
      'username name avatar verified'
    );
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ users: user.following });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar usuários seguidos.' });
  }
});

router.put('/me', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username.toLowerCase() !== user.username) {
      const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
      if (clean.length < 3) return res.status(400).json({ message: 'Username inválido.' });
      const taken = await User.findOne({ username: clean, _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ message: 'Este username já está em uso.' });
      user.username = clean;
    }
    if (name) user.name = name.trim();
    if (typeof bio === 'string') user.bio = bio.slice(0, 160);
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

router.post('/:username/follow', protect, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!target) return res.status(404).json({ message: 'Usuário não encontrado.' });
    if (target._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'Você não pode seguir a si mesmo.' });
    }
    const me = await User.findById(req.user._id);
    if (me.following.includes(target._id)) {
      return res.status(400).json({ message: 'Você já segue este usuário.' });
    }
    me.following.push(target._id);
    target.followers.push(me._id);
    await me.save();
    await target.save();
    await Notification.create({ recipient: target._id, sender: me._id, type: 'follow' });
    res.json({ user: target.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao seguir usuário.' });
  }
});

router.post('/:username/unfollow', protect, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!target) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const me = await User.findById(req.user._id);
    me.following = me.following.filter((id) => !id.equals(target._id));
    target.followers = target.followers.filter((id) => !id.equals(me._id));
    await me.save();
    await target.save();
    res.json({ user: target.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deixar de seguir usuário.' });
  }
});

export default router;
