import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['photo', 'video', 'text'], required: true },
    content: { type: String, default: '' },
    caption: { type: String, default: '', maxlength: 2200 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
