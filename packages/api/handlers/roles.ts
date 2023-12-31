import { StatusCodes } from 'http-status-codes';
import { DatabaseError } from 'pg';
import { z } from 'zod';
import { PostgresErrorCode } from '../constants';
import { Permission } from '../constants/permissions';
import { RoleField } from '../database/constants';
import { createHandler } from '../helpers/handler.helper';
import { rolesPermissionsService } from '../services/roles-permissions.service';
import { rolesService } from '../services/roles.service';
import {
  createArchiveHandler,
  createDestroyHandler,
  createGetHandler,
  createListHandler,
  createPatchHandler,
  createPostHandler,
} from './common';

export const list = createListHandler(rolesService, Permission.ReadRoles);
export const get = createGetHandler(rolesService, Permission.ReadRoles);
export const post = createPostHandler(
  rolesService,
  z.object({
    [RoleField.Name]: z.string().trim(),
  }),
  Permission.AddRoles
);
export const patch = createPatchHandler(
  rolesService,
  z.object({
    [RoleField.Name]: z.string().trim().optional(),
  }),
  Permission.EditRoles
);
export const destroy = createDestroyHandler(rolesService, Permission.DeleteRoles);
export const archive = createArchiveHandler(rolesService, Permission.DeleteRoles);

export const getPermissions = createHandler({
  requiredPermission: Permission.ReadRoles,
  validationSchema: {
    pathParameters: z.object({ [RoleField.Id]: z.string().uuid() }),
  },
  handler: async ({ pathParameters }) => {
    const id = pathParameters[RoleField.Id];
    const records = await rolesPermissionsService.getRolePermissions(id);

    return {
      statusCode: StatusCodes.OK,
      body: { records },
    };
  },
});

export const setPermissions = createHandler({
  requiredPermission: Permission.EditRoles,
  validationSchema: {
    pathParameters: z.object({ [RoleField.Id]: z.string().uuid() }),
    body: z.string().uuid().array(),
  },
  handler: async ({ pathParameters, body }) => {
    const roleId = pathParameters[RoleField.Id];
    const permissionIds = body;

    try {
      const records = await rolesPermissionsService.setRolePermissions(roleId, permissionIds);
      return {
        statusCode: StatusCodes.OK,
        body: { records },
      };
    } catch (error) {
      if (!(error instanceof DatabaseError)) {
        throw error;
      }

      switch (error.code) {
        case PostgresErrorCode.ForeignKeyViolation:
        case PostgresErrorCode.UniqueViolation:
          return { statusCode: StatusCodes.BAD_REQUEST };

        default:
          console.error(error);
          return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR };
      }
    }
  },
});

export const removePermissions = createHandler({
  requiredPermission: Permission.EditRoles,
  validationSchema: {
    pathParameters: z.object({ [RoleField.Id]: z.string().uuid() }),
    queryStringParameters: z.object({
      permissionIds: z.union([z.string().uuid().array(), z.string().uuid()]),
    }),
  },
  handler: async ({ pathParameters, queryStringParameters }) => {
    const roleId = pathParameters[RoleField.Id];
    const permissionIds = queryStringParameters.permissionIds;

    const records = await rolesPermissionsService.deleteByIds(roleId, permissionIds);
    return {
      statusCode: StatusCodes.OK,
      body: { records },
    };
  },
});
