import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseFormComponent } from '../../../../components/base-form/base-form.component';
import { PermissionsService } from '../../../../services/_permissions.service';
import { RolesService } from '../../../../services/_roles.service';
import { PermissionType, RoleType } from '../../../../types';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './_role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent extends BaseFormComponent {
  permissionsService = inject(PermissionsService);
  rolesService = inject(RolesService);

  isLoadingPermissionOptions = this.permissionsService.isLoading;
  isLoadingPermissions = false;
  selectedPermissions: PermissionType[] = [];

  override save() {
    this.onSave.emit({ role: this.form.value, permissions: Array.from(this.selectedPermissions) });
  }

  override reset() {
    super.reset();
    this.selectedPermissions = [];
  }

  override async setValues(role: Partial<RoleType>) {
    this.selectedPermissions = [];
    super.setValues(role);

    if (!role || !role.id) {
      return;
    }

    this.isLoadingPermissions = true;
    const permissions = await this.rolesService.getPermissions(role.id);
    this.isLoadingPermissions = false;
    if (!permissions) {
      return;
    }

    this.selectedPermissions = [...permissions];
  }

  getPermissionOptions() {
    const permissionOptions = [];
    for (const permission of this.permissionsService.records()) {
      if (!this.selectedPermissions.some(selected => selected.id === permission.id)) {
        permissionOptions.push(permission);
      }
    }

    return permissionOptions;
  }

  addPermission(event: Event) {
    const select = event.target as HTMLSelectElement;
    const permissionId = select.value;
    for (const permission of this.getPermissionOptions()) {
      if (permission.id === permissionId) {
        this.selectedPermissions.push(permission);
        break;
      }
    }

    select.value = '';
  }

  removePermission(permission: PermissionType) {
    const newSelected = [];
    for (const selected of this.selectedPermissions) {
      if (selected.id !== permission.id) {
        newSelected.push(selected);
      }
    }

    this.selectedPermissions = newSelected;
  }
}
