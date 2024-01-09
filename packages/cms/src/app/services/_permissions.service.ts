import { Injectable } from '@angular/core';
import { PermissionType } from '../types';
import { ApiService } from './_api.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService extends ApiService<PermissionType> {
  constructor() {
    super({
      basePath: '/permissions',
      dataMapping: [
        { apiField: 'id', mappedField: 'id' },
        { apiField: 'name', mappedField: 'name' },
        { apiField: 'created_at', mappedField: 'createdAt' },
        { apiField: 'updated_at', mappedField: 'updatedAt' },
        { apiField: 'deleted_at', mappedField: 'deletedAt' },
      ],
    });
  }
}
