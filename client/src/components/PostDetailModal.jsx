import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PostCard from './PostCard';

export default function PostDetailModal({ post, onClose, onDeleted }) {
  if (!post) return null;

  const handleDeleted = (id) => {
    onDeleted?.(id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay post-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="post-detail-panel"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="icon-btn post-detail-close" onClick={onClose}>
            <X size={20} />
          </button>
          <PostCard post={post} onDeleted={handleDeleted} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
