import { verifyToken } from '@utils/jwt';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';

export function requireAuthDirective(directiveName: string) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return {
    authDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          // console.log('Processing type:', type.name);
          // console.log('Directives:', type.astNode?.directives);
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          // console.log(authDirective, 'authDirective');
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          // console.log(`Processing field: ${_fieldName} in type: ${typeName}`);
          // console.log(schema, 'schema');
          // console.log(fieldConfig, 'fieldConfig');
          // console.log(directiveName, 'directiveName');
          // const fieldDirectives = fieldConfig.astNode?.directives;
          // console.log(`Directives on field ${_fieldName}:`, fieldDirectives);
          const requireAuthDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          // console.log('requireAuthDirective', requireAuthDirective);
          if (requireAuthDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              const token = context.authToken;
              // console.log(token, 'token');
              const user = verifyToken(token);
              // console.log('Verified user:', user);
              if (!user) {
                throw new Error('Not authorized. Please log in.');
              }

              return await resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        },
      }),
  };
}
