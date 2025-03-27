import mongoose from "mongoose";
import 'dotenv/config'
const uri = process.env.MONGO_URI || 'mongodb://mongo.edu.itcareerhub.de:27017';
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri || '', {
      user: process.env.DB_USER || 'ich_editor',
      pass: process.env.DB_PASS || 'verystrongpassword',
      dbName: process.env.DB_NAME || 'ich_edit',
      authSource: 'ich_edit',
      readPreference: 'primary',
      ssl: false,
      authMechanism: 'DEFAULT',
    });
    console.log('Connected to Mongo DB');
  } catch (error) {
    console.error('Error connectiong to database: ', {
      error: (error as Error).message,
    });
  }
}
export default connectDB;