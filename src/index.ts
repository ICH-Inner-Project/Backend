import express from 'express';

import cors from 'cors';
import 'dotenv/config';
import { graphqlUploadExpress } from 'graphql-upload-ts';

const { ruruHTML } = require('ruru/server');

import fullHandler from '@graphql/handler';
import connectDB from '@db/init';

connectDB();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.all(
  '/graphql',
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }),
  (req, res, next) => {
    // Если запрос с типом multipart/form-data, меняем его на application/json
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      req.headers['content-type'] = 'application/json';
    }
    next();
  },
  fullHandler
);

app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
