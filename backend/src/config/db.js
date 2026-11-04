import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedDatabase } from '../seed/seed.js';

dotenv.config();
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oilfactory';

  try {
    const conn = await mongoose.connect(uri);
    const isAtlas = uri.includes('mongodb+srv') || uri.includes('cluster');
    console.log(`🌿 [MongoDB Connected] [${isAtlas ? 'Cloud Atlas' : 'Localhost'}] Host: ${conn.connection.host}, Database: ${conn.connection.name}`);

    // Auto-seed initial datasets if collections are empty
    await seedDatabase();
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    // Don't crash immediately in dev to allow retries
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
