import mongoose from "mongoose";
import 'dotenv/config'
const uri = process.env.MONGO_URI;
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri || '', {
      user: process.env.DB_USER || 'root',
      pass: process.env.DB_PASS || '666777lyly',
      dbName: process.env.DB_NAME || 'ich_prod',
    });
    console.log('Connected to Mongo DB');
  } catch (error) {
    console.error('Error connectiong to database: ', {
      error: (error as Error).message,
    });
  }
}
export default connectDB;