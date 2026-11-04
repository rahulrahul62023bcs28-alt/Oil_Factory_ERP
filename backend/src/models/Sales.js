import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['Retail Customer', 'Wholesale Supplier'],
      default: 'Retail Customer',
    },
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    oilType: {
      type: String,
      required: true,
      trim: true,
    },
    quantityLiters: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
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

export const Sales = mongoose.model('Sales', salesSchema);
export default Sales;
