import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Avatar, VerifiedBadge, EmptyState } from './UI';
import { useAuth } from '../services/AuthContext';
import { timeAgo } from '../services/format';

export default function CommentsModal({ post, onClose, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get(`/comments/post/${post._id}`)
      .then(({ data }) => setComments(data.comments))
      .finally(() => setLoading(false));
  }, [post._id]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/comments/post/${post._id}`, { content: text });
      setComments((prev) => [...prev, data.comment]);
      onCountChange?.(1);
      setText('');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
      onCountChange?.(-1);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="modal-panel comments-panel"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Comentários</h3>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="comments-list">
            {loading ? (
              <div className="center-pad">
                <Loader2 className="spin-icon" size={22} />
              </div>
            ) : comments.length === 0 ? (
              <EmptyState title="Nenhum comentário ainda." subtitle="Seja o primeiro a comentar." />
            ) : (
              comments.map((c) => (
                <div className="comment-row" key={c._id}>
                  <Avatar src={c.author?.avatar} name={c.author?.name} size={32} />
                  <div className="comment-body">
                    <p>
                      <span className="comment-username">
                        {c.author?.username}
                        {c.author?.verified && <VerifiedBadge size={12} />}
                      </span>{' '}
                      {c.content}
                    </p>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                  {c.author?._id === user?.id && (
                    <button className="icon-btn small" onClick={() => handleDelete(c._id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="comment-input-row">
            <input
              className="input"
              placeholder="Adicionar um comentário..."
              value={text}
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="icon-btn primary" onClick={handleSend} disabled={sending || !text.trim()}>
              {sending ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
