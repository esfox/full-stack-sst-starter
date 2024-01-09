import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseFormComponent } from '../../../../components/base-form/base-form.component';
import { RolesService } from '../../../../services/_roles.service';
import { UsersService } from '../../../../services/users.service';
import { RoleType } from '../../../../types';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent extends BaseFormComponent {
  rolesService = inject(RolesService);
  usersService = inject(UsersService);

  isLoadingRoleOptions = this.rolesService.isLoading;
  isLoadingRoles = false;
  selectedRoles: RoleType[] = [];

  override save() {
    this.onSave.emit({ user: this.form.value, roles: Array.from(this.selectedRoles) });
  }

  override reset() {
    super.reset();
    this.selectedRoles = [];
  }

  override async setValues(role: Partial<RoleType>) {
    this.selectedRoles = [];
    super.setValues(role);

    if (!role || !role.id) {
      return;
    }

    this.isLoadingRoles = true;
    const roles = await this.usersService.getRoles(role.id);
    this.isLoadingRoles = false;
    if (!roles) {
      return;
    }

    this.selectedRoles = [...roles];
  }

  getRoleOptions() {
    const roleOptions = [];
    for (const role of this.rolesService.records()) {
      if (!this.selectedRoles.some(selected => selected.id === role.id)) {
        roleOptions.push(role);
      }
    }

    return roleOptions;
  }

  addRole(event: Event) {
    const select = event.target as HTMLSelectElement;
    const permissionId = select.value;
    for (const permission of this.getRoleOptions()) {
      if (permission.id === permissionId) {
        this.selectedRoles.push(permission);
        break;
      }
    }

    select.value = '';
  }

  removeRole(role: RoleType) {
    const newSelected = [];
    for (const selected of this.selectedRoles) {
      if (selected.id !== role.id) {
        newSelected.push(selected);
      }
    }

    this.selectedRoles = newSelected;
  }
}
