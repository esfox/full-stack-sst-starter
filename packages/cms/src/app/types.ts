export type ApiServiceResult<T = unknown> = {
  response: Response;
  data?: T;
};

export type UserType = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  googleId?: string;
  googlePictureUrl?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type RoleType = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type PermissionType = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};
