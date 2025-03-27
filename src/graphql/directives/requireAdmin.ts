import { verifyToken } from '@utils/jwt';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';
import { Roles } from '@db/models/User';

export function requireAdminDirective(directiveName: string) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return {
    adminDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,

    adminDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          // console.log('Processing type:', type.name);
          // console.log('Directives:', type.astNode?.directives);
          const adminDirective = getDirective(schema, type, directiveName)?.[0];
          // console.log(adminDirective, 'adminDirective');
          if (adminDirective) {
            typeDirectiveArgumentMaps[type.name] = adminDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const requireAdminDirective = getDirective(
            schema,
            fieldConfig,
            directiveName
          )?.[0];
          // console.log(requireAdminDirective, 'requireAdminDirective');
          if (requireAdminDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              const token = context.authToken;
              const user = verifyToken(token);

              if (!user) {
                throw new Error('Not authorized. Please log in.');
              }

              if (user.role !== Roles.admin) {
                throw new Error('Access denied. Admin role required.');
              }

              return await resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        },
      }),
  };
}
