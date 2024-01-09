import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BaseFormNewComponent,
  injectionTokens,
} from '../../../../components/base-form-new/base-form-new.component';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { PermissionsService } from '../../../../services/permissions.service';
import { PermissionType } from '../../../../types';

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './permission-form.component.html',
  styleUrl: './permission-form.component.scss',
  providers: [{ provide: injectionTokens.service, useExisting: PermissionsService }],
})
export class PermissionFormComponent extends BaseFormNewComponent<PermissionType> {}
