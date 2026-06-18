import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ['checkbox', 'rating', 'yesno'], default: 'checkbox' },
    options: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const productLineSchema = new mongoose.Schema(
  {
    lineId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Aarong Earth', 'Aarong Dairy', 'Other'],
      required: true,
    },
    description: { type: String, default: '' },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('ProductLine', productLineSchema);
