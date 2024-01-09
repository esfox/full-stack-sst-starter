import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { PermissionFormComponent } from './pages/permissions/components/permission-form/permission-form.component';
import { PermissionsTableComponent } from './pages/permissions/components/permissions-table/permissions-table.component';
import { PermissionsComponent } from './pages/permissions/permissions.component';
import { RoleFormComponent } from './pages/roles/components/role-form/role-form.component';
import { RolesTableComponent } from './pages/roles/components/roles-table/roles-table.component';
import { RolesComponent } from './pages/roles/roles.component';
import { UsersComponent } from './pages/users/users.component';

type RouteData = { data?: { label?: string; icon?: string } };

export const routes: (Omit<Route, 'data'> & RouteData)[] = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: DashboardComponent,
    data: {
      label: 'Dashboard',
      icon: 'fa fa-gauge',
    },
  },
  {
    path: 'users',
    component: UsersComponent,
    data: {
      label: 'Users',
      icon: 'fa fa-users',
    },
  },
  {
    path: 'roles',
    component: RolesComponent,
    children: [
      {
        path: '',
        component: RolesTableComponent,
      },
      {
        path: 'add',
        component: RoleFormComponent,
        data: {
          navTitle: 'Add Role',
        },
      },
      {
        path: 'edit/:id',
        component: RoleFormComponent,
        data: {
          navTitle: 'Edit Role',
        },
      },
    ],
    data: {
      label: 'Roles',
      icon: 'fa fa-user-gear',
    },
  },
  {
    path: 'permissions',
    component: PermissionsComponent,
    children: [
      {
        path: '',
        component: PermissionsTableComponent,
      },
      {
        path: 'add',
        component: PermissionFormComponent,
        data: {
          navTitle: 'Add Permission',
        },
      },
      {
        path: 'edit/:id',
        component: PermissionFormComponent,
        data: {
          navTitle: 'Edit Permission',
        },
      },
    ],
    data: {
      label: 'Permissions',
      icon: 'fa-solid fa-key',
    },
  },
];
