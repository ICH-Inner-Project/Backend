import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import postSchema from './schemas/post';
import userSchema from './schemas/user';
import { requireAuthDirective } from '@graphql/directives/requireAuth';
import { requireAdminDirective } from '@graphql/directives/requireAdmin';
import { requireSelfOrAdminDirective } from '@graphql/directives/requireSelfOrAdmin';
import { userResolver } from '@graphql/resolvers/user';
import { postResolver } from './resolvers/post';
import { Request } from 'express';
import { verifyToken } from '@utils/jwt';

const typeDefs = mergeTypeDefs([
  /* Here will be all of the schemas */
  `directive @requireAdmin on FIELD_DEFINITION`,
  `directive @requireAuth on FIELD_DEFINITION`,
  `directive @requireSelfOrAdmin on FIELD_DEFINITION`,
  postSchema,
  userSchema,
]);
// console.log('Type Definitions:', typeDefs);

const resolvers = mergeResolvers([
  /* Here will be all of the resolvers */
  postResolver,
  userResolver,
]);
// console.log('Resolvers:', resolvers);
let fullSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const directiveTransformers = [
  requireAuthDirective('requireAuth').authDirectiveTransformer,
  requireAdminDirective('requireAdmin').adminDirectiveTransformer,
  requireSelfOrAdminDirective('requireSelfOrAdmin')
    .SelfOrAdminDirectiveTransformer,
];
// console.log('[DEBUG] Before applying directive transformers:', fullSchema);
fullSchema = directiveTransformers.reduce((curSchema, transformer) => {
  // console.log(`[DEBUG] Applying transformer: ${transformer.name}`);
  return transformer(curSchema);
}, fullSchema);

// console.log('[DEBUG] After applying directive transformers:', fullSchema);

const fullHandler = createHandler({
  schema: fullSchema,
  context: async (req: Request): Promise<any> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;
    console.log(token, 'token');
    // console.log(token, 'token');
    let user = null;
    if (token) {
      try {
        user = verifyToken(token);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
    //console.log(req.headers, token, user);
    return { headers: req.headers, authToken: token, user };
  },
});

export default fullHandler;
