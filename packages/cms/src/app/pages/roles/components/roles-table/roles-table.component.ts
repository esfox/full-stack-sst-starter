import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  BaseDataTableComponent,
  injectionTokens,
} from '../../../../components/base-data-table/base-data-table.component';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { PromptDialogComponent } from '../../../../components/prompt-dialog/prompt-dialog.component';
import { RolesService } from '../../../../services/roles.service';
import { RoleType } from '../../../../types';
import { RolesTableRowComponent } from '../roles-table-row/roles-table-row.component';

@Component({
  selector: 'app-roles-table',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterLink,
    RouterLinkActive,
    RolesTableRowComponent,
    PromptDialogComponent,
  ],
  templateUrl: './roles-table.component.html',
  styleUrl: './roles-table.component.scss',
  providers: [{ provide: injectionTokens.service, useExisting: RolesService }],
})
export class RolesTableComponent extends BaseDataTableComponent<RoleType> {
  override recordToDeleteLabel = () => this.recordToDelete?.name;
}
