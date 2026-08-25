import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Type, Upload, Loader2 } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';

const TYPES = [
  { key: 'photo', label: 'Foto', icon: Image, accept: 'image/jpeg,image/jpg,image/png,image/webp' },
  { key: 'video', label: 'Vídeo', icon: Video, accept: 'video/mp4,video/webm' },
  { key: 'text', label: 'Texto', icon: Type, accept: '' },
];

export default function CreatePostModal({ onClose, onCreated }) {
  const [type, setType] = useState('photo');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const currentType = TYPES.find((t) => t.key === type);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleTypeChange = (key) => {
    setType(key);
    setFile(null);
    setPreview('');
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (type !== 'text' && !file) {
      setError('Selecione um arquivo para publicar.');
      return;
    }
    if (type === 'text' && !caption.trim()) {
      setError('Escreva algo para publicar.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('caption', caption);
      if (file) formData.append('file', file);
      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      window.dispatchEvent(new CustomEvent('nuvvo:post-created', { detail: data.post }));
      onCreated?.(data.post);
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
            <h3>Criar publicação</h3>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="type-tabs">
            {TYPES.map((t) => (
              <button
                key={t.key}
                className={`type-tab ${type === t.key ? 'active' : ''}`}
                onClick={() => handleTypeChange(t.key)}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="modal-body">
            {type !== 'text' && (
              <>
                {!preview ? (
                  <button className="upload-drop" onClick={() => inputRef.current?.click()}>
                    <Upload size={26} strokeWidth={1.5} />
                    <span>Selecionar {currentType.label.toLowerCase()}</span>
                  </button>
                ) : type === 'photo' ? (
                  <div className="preview-wrap">
                    <img src={preview} alt="preview" className="preview-media" />
                    <button className="preview-remove" onClick={() => inputRef.current?.click()}>
                      Trocar arquivo
                    </button>
                  </div>
                ) : (
                  <div className="preview-wrap">
                    <video src={preview} controls className="preview-media" />
                    <button className="preview-remove" onClick={() => inputRef.current?.click()}>
                      Trocar arquivo
                    </button>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept={currentType.accept}
                  hidden
                  onChange={handleFile}
                />
              </>
            )}

            <textarea
              className="input textarea"
              placeholder={type === 'text' ? 'No que você está pensando?' : 'Adicione uma legenda...'}
              value={caption}
              maxLength={2200}
              onChange={(e) => setCaption(e.target.value)}
              rows={type === 'text' ? 6 : 3}
            />
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 size={18} className="spin-icon" /> : 'Publicar'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
