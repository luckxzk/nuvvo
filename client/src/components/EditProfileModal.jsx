import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Avatar } from './UI';
import { useAuth } from '../services/AuthContext';

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleAvatar = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      const { data } = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Editar perfil</h3>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div className="avatar-edit-wrap">
              <div className="avatar-edit" onClick={() => inputRef.current?.click()}>
                <Avatar src={preview} name={name} size={84} />
                <div className="avatar-edit-overlay">
                  <Camera size={20} />
                </div>
              </div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" hidden onChange={handleAvatar} />
            </div>

            <label className="field-label">Nome</label>
            <input className="input" value={name} maxLength={50} onChange={(e) => setName(e.target.value)} />

            <label className="field-label">Username</label>
            <input className="input" value={username} maxLength={30} onChange={(e) => setUsername(e.target.value)} />

            <label className="field-label">Bio</label>
            <textarea className="input textarea" rows={3} value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} />

            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 size={18} className="spin-icon" /> : 'Salvar alterações'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
