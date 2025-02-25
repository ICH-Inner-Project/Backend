import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const { ruruHTML } = require('ruru/server');

import fullHandler from "@graphql/handler";
import connectDB from '@db/init';

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.all('/graphql', fullHandler);

app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

