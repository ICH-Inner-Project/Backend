import { gql } from 'graphql-tag';
import fs from 'fs';
import path from 'path';

const schema = fs.readFileSync(path.join(__dirname, 'user.gql'), 'utf-8');
export default gql(schema);
