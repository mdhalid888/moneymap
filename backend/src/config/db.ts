import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI || '';
    if (!connStr) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    await mongoose.connect(connStr);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
