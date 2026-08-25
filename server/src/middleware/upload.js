import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const ALLOWED = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
  audio: ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/aac'],
};

const resourceTypeFor = (mimetype) => {
  if (ALLOWED.image.includes(mimetype)) return 'image';
  // Cloudinary trata vídeo E áudio como "video" (não tem tipo "audio" próprio)
  return 'video';
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'nuvvo',
    resource_type: resourceTypeFor(file.mimetype),
    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

const fileFilter = (req, file, cb) => {
  const allAllowed = [...ALLOWED.image, ...ALLOWED.video, ...ALLOWED.audio];
  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
