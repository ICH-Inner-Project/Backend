import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from '../src/db/init';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
