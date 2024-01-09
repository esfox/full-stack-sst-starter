import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  BaseDataTableComponent,
  injectionTokens,
} from '../../../../components/base-data-table/base-data-table.component';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { PromptDialogComponent } from '../../../../components/prompt-dialog/prompt-dialog.component';
import { PermissionsService } from '../../../../services/permissions.service';
import { PermissionType } from '../../../../types';
import { PermissionsTableRowComponent } from '../permissions-table-row/permissions-table-row.component';

@Component({
  selector: 'app-permissions-table',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterLink,
    RouterLinkActive,
    PermissionsTableRowComponent,
    PromptDialogComponent,
  ],
  templateUrl: './permissions-table.component.html',
  styleUrl: './permissions-table.component.scss',
  providers: [{ provide: injectionTokens.service, useExisting: PermissionsService }],
})
export class PermissionsTableComponent extends BaseDataTableComponent<PermissionType> {
  override recordToDeleteLabel = () => this.recordToDelete?.name;
}
