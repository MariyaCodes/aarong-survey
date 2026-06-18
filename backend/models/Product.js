import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true },
    productLineId: { type: String, required: true, ref: 'ProductLine' },
    category: {
      type: String,
      enum: ['Aarong Earth', 'Aarong Dairy', 'Other'],
      required: true,
    },
    price: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
