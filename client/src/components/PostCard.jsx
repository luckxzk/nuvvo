import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Pencil, Check, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Avatar, VerifiedBadge } from './UI';
import { useAuth } from '../services/AuthContext';
import { timeAgo, formatCount } from '../services/format';
import CommentsModal from './CommentsModal';
import VideoPlayer from './VideoPlayer';

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || '');
  const [busy, setBusy] = useState(false);

  const isOwner = post.author?._id === user?.id;
  const liked = likes.includes(user?.id);

  const handleLike = async () => {
    const wasLiked = liked;
    setLikes((prev) => (wasLiked ? prev.filter((id) => id !== user.id) : [...prev, user.id]));
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLikes((prev) => (wasLiked ? [...prev, user.id] : prev.filter((id) => id !== user.id)));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir esta publicação?')) return;
    setBusy(true);
    try {
      await api.delete(`/posts/${post._id}`);
      onDeleted?.(post._id);
    } catch (err) {
      alert(getErrorMessage(err));
      setBusy(false);
    }
  };

  const handleEditSave = async () => {
    setBusy(true);
    try {
      await api.put(`/posts/${post._id}`, { caption });
      setEditing(false);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.article
      className="card post-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="post-header">
        <Link to={`/profile/${post.author?.username}`} className="post-author">
          <Avatar src={post.author?.avatar} name={post.author?.name} size={40} />
          <div>
            <span className="post-username">
              {post.author?.username}
              {post.author?.verified && <VerifiedBadge />}
            </span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </Link>

        {isOwner && (
          <div className="post-menu-wrap">
            <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)}>
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <div className="post-menu" onMouseLeave={() => setMenuOpen(false)}>
                <button
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                >
                  <Pencil size={14} /> Editar
                </button>
                <button className="danger" onClick={handleDelete} disabled={busy}>
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.type === 'photo' && <img src={post.content} alt="" className="post-media" loading="lazy" />}
      {post.type === 'video' && <VideoPlayer src={post.content} className="post-media" />}
      {post.type === 'text' && !editing && <p className="post-text-content">{post.caption}</p>}

      <div className="post-actions">
        <button className={`icon-btn action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
        <button className="icon-btn action-btn" onClick={() => setCommentsOpen(true)}>
          <MessageCircle size={22} strokeWidth={2} />
        </button>
      </div>

      <div className="post-meta">
        <span className="post-likes">{formatCount(likes.length)} curtidas</span>

        {editing ? (
          <div className="edit-caption-row">
            <input className="input" value={caption} maxLength={2200} onChange={(e) => setCaption(e.target.value)} />
            <button className="icon-btn small" onClick={handleEditSave} disabled={busy}>
              <Check size={16} />
            </button>
            <button className="icon-btn small" onClick={() => setEditing(false)}>
              <X size={16} />
            </button>
          </div>
        ) : (
          post.type !== 'text' &&
          post.caption && (
            <p className="post-caption">
              <span className="post-username">{post.author?.username}</span> {post.caption}
            </p>
          )
        )}

        {commentsCount > 0 && (
          <button className="post-comments-link" onClick={() => setCommentsOpen(true)}>
            Ver {commentsCount === 1 ? 'o comentário' : `todos os ${commentsCount} comentários`}
          </button>
        )}
      </div>

      {commentsOpen && (
        <CommentsModal
          post={post}
          onClose={() => setCommentsOpen(false)}
          onCountChange={(d) => setCommentsCount((c) => c + d)}
        />
      )}
    </motion.article>
  );
}
