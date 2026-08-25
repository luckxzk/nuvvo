import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/post/:postId', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username name avatar verified');
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar comentários.' });
  }
});

router.post('/post/:postId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Escreva um comentário.' });
    }
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Publicação não encontrada.' });

    const comment = await Comment.create({
      author: req.user._id,
      post: post._id,
      content: content.trim().slice(0, 500),
    });
    post.commentsCount += 1;
    await post.save();

    if (!post.author.equals(req.user._id)) {
      await Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id });
    }

    const populated = await comment.populate('author', 'username name avatar verified');
    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao comentar.' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comentário não encontrado.' });
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Você só pode excluir seus próprios comentários.' });
    }
    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    res.json({ message: 'Comentário excluído.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir comentário.' });
  }
});

export default router;
