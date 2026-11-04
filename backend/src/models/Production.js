import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    oilType: {
      type: String,
      required: true,
      trim: true,
    },
    rawSeedWeightKg: {
      type: Number,
      required: true,
      default: 1000,
      min: 1,
    },
    quantityLiters: {
      type: Number,
      required: true,
      min: 1,
    },
    details: {
      type: String,
      default: 'Standard Extraction Batch',
      trim: true,
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

export const Production = mongoose.model('Production', productionSchema);
export default Production;
