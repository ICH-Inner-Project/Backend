import { createHandler } from 'graphql-http/lib/use/express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

const typeDefs = mergeTypeDefs([
    /* Here will be all defined schemas */
]);

const resolvers = mergeResolvers([
    /* Here will be all defined resolvers */
]);

const fullSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const fullHandler = createHandler({
    schema: fullSchema,
});

export default fullHandler;
