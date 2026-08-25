import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 160 },
    verified: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    verified: this.verified,
    followers: this.followers,
    following: this.following,
    followersCount: this.followers.length,
    followingCount: this.following.length,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
