import { verifyToken } from '../../utils/jwt';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';

export function requireAuthDirective(directiveName: string) {
  return {
    authDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const requireAuthDirective = getDirective(
            schema,
            fieldConfig,
            directiveName
          )?.[0];

          if (requireAuthDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = function (source, args, context, info) {
              const token = context.headers.authToken;
              const user = verifyToken(token);

              if (!user) {
                throw new Error('Not authorized. Please log in.');
              }

              return resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        },
      }),
  };
}
