import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    currentLiters: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacityLiters: {
      type: Number,
      required: true,
      default: 10000,
    },
    minAlert: {
      type: Number,
      required: true,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
