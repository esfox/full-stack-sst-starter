import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import {
  BaseResourceComponent,
  injectionTokens,
} from '../../components/base-resource/base-resource.component';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { PromptDialogComponent } from '../../components/prompt-dialog/prompt-dialog.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { PermissionsService } from '../../services/_permissions.service';
import { RolesService } from '../../services/_roles.service';
import { PermissionType, RoleType } from '../../types';
import { RoleFormComponent } from './components/role-form/role-form.component';
import { RolesTableRowComponent } from './components/roles-table-row/roles-table-row.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    RolesTableRowComponent,
    RoleFormComponent,
    DialogComponent,
    PromptDialogComponent,
  ],
  templateUrl: './_roles.component.html',
  styleUrl: './roles.component.scss',
  providers: [{ provide: injectionTokens.service, useExisting: RolesService }],
})
export class RolesComponent extends BaseResourceComponent<RoleType> implements OnInit {
  permissionsService = inject(PermissionsService);
  rolesService = this.service as RolesService;

  recordFormDialogTitle = computed(() => `${this.recordToSave() ? 'Edit' : 'Create'} Role`);
  recordToDeleteName = computed(() => this.recordToDelete()?.name);

  isSavingWithPermissions = this.rolesService.isSavingWithPermissions;

  async saveWithPermissions(data: { role: Partial<RoleType>; permissions: PermissionType[] }) {
    const { role, permissions } = data;
    const recordToSave = this.recordToSave();

    try {
      await this.rolesService.saveWithPermissions({
        role,
        permissions,
        roleId: recordToSave?.id,
      });
    } catch (error) {
      //  TODO: handle error
      console.error(error);
      return;
    }

    this.recordFormDialog.hide();
    this.recordForm.reset();
    this.service.get();
  }

  override async showRecordForm(role?: Partial<RoleType> | undefined) {
    super.showRecordForm(role);
    if (this.permissionsService.records().length !== 0) {
      return;
    }

    try {
      await this.permissionsService.get();
    } catch (error) {
      //  TODO: handle error
      console.error(error);
      return;
    }
  }
}
