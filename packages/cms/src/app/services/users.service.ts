import { Injectable, inject, signal } from '@angular/core';
import { ApiServiceResult, RoleType, UserType } from '../types';
import { ApiService, RecordResponse, RecordsResponse } from './_api.service';
import { RolesService } from './_roles.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends ApiService<UserType> {
  private rolesService = inject(RolesService);

  currentUser = signal<UserType | undefined>(undefined);
  isLoadingCurrentUser = signal(false);

  userRolesMap: { [userId: string]: RoleType[] } = {};

  isSavingWithRoles = signal(false);

  constructor() {
    super({
      basePath: '/users',
      dataMapping: [
        { apiField: 'id', mappedField: 'id' },
        { apiField: 'email', mappedField: 'email' },
        { apiField: 'username', mappedField: 'username' },
        { apiField: 'first_name', mappedField: 'firstName' },
        { apiField: 'last_name', mappedField: 'lastName' },
        { apiField: 'google_id', mappedField: 'googleId' },
        { apiField: 'google_picture_url', mappedField: 'googlePictureUrl' },
        { apiField: 'created_at', mappedField: 'createdAt' },
        { apiField: 'updated_at', mappedField: 'updatedAt' },
        { apiField: 'deleted_at', mappedField: 'deletedAt' },
      ],
    });
  }

  private getUserRolesUrl(userId: string) {
    return `${this.url}/${userId}/roles`;
  }

  async getCurrentUser() {
    this.isLoadingCurrentUser.set(true);

    try {
      const response = await this.fetch('/me');
      const { record }: RecordResponse = await response.json();
      const data = this.mapFromApi(record);
      this.currentUser.set(data);
      this.isLoadingCurrentUser.set(false);
    } catch (error) {
      //  TODO: handle error
      console.error(error);
    }
  }

  async getRoles(userId: string) {
    let roles = this.userRolesMap[userId];
    if (roles) {
      return roles;
    }

    let roleRecords;
    try {
      const response = await this.fetch(this.getUserRolesUrl(userId));
      const { records }: RecordsResponse = await response.json();
      roleRecords = records;
    } catch (error) {
      // TODO: handle error
    }

    if (!roleRecords) {
      return;
    }

    roles = roleRecords.map(record => this.rolesService.mapFromApi(record));
    if (!this.userRolesMap[userId]) {
      this.userRolesMap[userId] = roles;
    }

    return roles;
  }

  async saveWithRoles(data: { user: Partial<UserType>; roles: RoleType[]; userId?: string }) {
    const { user, roles, userId } = data;

    this.isSavingWithRoles.set(true);

    let result: ApiServiceResult<UserType>;
    if (userId) {
      result = await this.edit(userId, user);
    } else {
      result = await this.create(user);
    }

    if (!result.data) {
      return;
    }

    const savedUserId = result.data.id;
    const roleIds = roles.map(role => role.id);
    await this.fetchWithBody(this.getUserRolesUrl(savedUserId), 'PUT', roleIds);

    this.isSavingWithRoles.set(false);
    delete this.userRolesMap[savedUserId];
  }
}
