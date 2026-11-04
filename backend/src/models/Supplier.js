import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    materialItem: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
  }
);

export const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
