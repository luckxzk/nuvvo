import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
const POPULATE_AUTHOR = 'username name avatar verified';

router.get('/feed', protect, async (req, res) => {
  try {
    const ids = [...req.user.following, req.user._id];
    const posts = await Post.find({ author: { $in: ids } })
      .sort({ createdAt: -1 })
      .populate('author', POPULATE_AUTHOR);
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar o feed.' });
  }
});

router.get('/explore', protect, async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(60)
      .populate('author', POPULATE_AUTHOR);
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar explorar.' });
  }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { type, caption } = req.body;
    if (!['photo', 'video', 'text'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de publicação inválido.' });
    }
    let content = '';
    if (type === 'text') {
      if (!caption || !caption.trim()) {
        return res.status(400).json({ message: 'Escreva algo para publicar.' });
      }
      if (caption.length > 2200) {
        return res.status(400).json({ message: 'Texto muito longo.' });
      }
    } else {
      if (!req.file) return res.status(400).json({ message: 'Selecione um arquivo para publicar.' });
      content = `/uploads/${req.file.filename}`;
    }
    const post = await Post.create({
      author: req.user._id,
      type,
      content,
      caption: caption || '',
    });
    const populated = await post.populate('author', POPULATE_AUTHOR);
    res.status(201).json({ post: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erro ao publicar.' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publicação não encontrada.' });
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Você só pode editar suas próprias publicações.' });
    }
    if (typeof req.body.caption === 'string') post.caption = req.body.caption.slice(0, 2200);
    await post.save();
    const populated = await post.populate('author', POPULATE_AUTHOR);
    res.json({ post: populated });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao editar publicação.' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publicação não encontrada.' });
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Você só pode excluir suas próprias publicações.' });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Publicação excluída.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir publicação.' });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publicação não encontrada.' });
    const already = post.likes.some((id) => id.equals(req.user._id));
    if (already) {
      post.likes = post.likes.filter((id) => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
      if (!post.author.equals(req.user._id)) {
        await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id });
      }
    }
    await post.save();
    res.json({ likes: post.likes, liked: !already });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao curtir publicação.' });
  }
});

export default router;
