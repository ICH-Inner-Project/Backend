import { verifyToken } from '@utils/jwt';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';
import { Roles } from '@db/models/User';

export function requireSelfOrAdminDirective(directiveName: string) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return {
    SelfOrAdminDirectiveTypeDefs: `directive @${directiveName} on FIELD_DEFINITION`,

    SelfOrAdminDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          // console.log('Processing type:', type.name);
          // console.log('Directives:', type.astNode?.directives);
          const SelfOrAdminDirective = getDirective(
            schema,
            type,
            directiveName
          )?.[0];
          // console.log(SelfOrAdminDirective, 'SelfOrAdminDirective');
          if (SelfOrAdminDirective) {
            typeDirectiveArgumentMaps[type.name] = SelfOrAdminDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const requireSelfOrAdminDirective = getDirective(
            schema,
            fieldConfig,
            directiveName
          )?.[0];
          // console.log(
          //   requireSelfOrAdminDirective,
          //   'requireSelfOrAdminDirective'
          // );
          if (requireSelfOrAdminDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              const token = context.authToken;
              const user = verifyToken(token);

              if (!user) {
                throw new Error('Not authorized. Please log in.');
              }

              if (user.role !== Roles.admin && user.id !== args.id) {
                throw new Error(
                  'Access denied. You can only modify your own data or admin data.'
                );
              }

              if (
                args.role &&
                args.role !== user.role &&
                user.role !== Roles.admin
              ) {
                throw new Error('Access denied. Only admins can change roles.');
              }

              return await resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        },
      }),
  };
}
