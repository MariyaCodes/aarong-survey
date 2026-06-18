import mongoose from 'mongoose';

const hostSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Host', hostSchema);
