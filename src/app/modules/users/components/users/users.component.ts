
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '@core/auth/services';
import { UserDialogComponent } from '@modules/users/components';
import { UsersService } from '@modules/users/services';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog';
import { ButtonComponent } from '@shared/components';
import { GridComponent } from '@shared/components/grid';
import {
  GridAction,
  GridColumn,
  GridConfig,
} from '@shared/components/grid/models';

interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ButtonComponent,
    GridComponent,
  ],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];

  searchText = '';
  roleFilter = '';
  role = '';
  isLoading = false;

  private pageIndex = 0;
  private pageSize = 5;

  readonly columns: readonly GridColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      type: 'title',
      secondaryKey: 'email',
      showSecondaryIcon: false,
      leadingIcon: 'person',
      width: '40%',
      formatter: (value) => this.formatUsername(value),
    },
    {
      key: 'roleId',
      header: 'Role',
      type: 'badge',
      width: '25%',
      formatter: (value) => this.getRoleName(Number(value)),
      badgeClass: 'grid-badge--primary',
    },
    {
      key: 'isActive',
      header: 'Status',
      type: 'badge',
      width: '25%',
      formatter: (value) =>
        Boolean(value) ? 'Active' : 'Inactive',
      badgeClass: (row) =>
        row.isActive
          ? 'grid-badge--success'
          : 'grid-badge--danger',
    },
  ];

  readonly actions: readonly GridAction<User>[] = [
    {
      id: 'edit',
      icon: 'edit',
      tooltip: 'Edit user',
    },
    {
      id: 'delete',
      icon: 'delete',
      tooltip: 'Delete user',
      class: 'delete-action',
    },
  ];

  gridConfig: GridConfig = {
    pagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    emptyMessage: 'No users found.',
    actionColumnHeader: 'Actions',
    actionColumnWidth: '120px',
    loading: false,
    showActions: false,
    totalRecords: 0,
  };

  constructor(
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user) {
      this.role = user.roleName;
    }

    this.updateGridConfig();
    this.getUsers();
  }

  getUsers(): void {
    this.isLoading = true;
    this.updateGridConfig();

    this.usersService.getUsers().subscribe({
      next: (response: any) => {
        this.users = Array.isArray(response?.result)
          ? response.result
          : [];

        this.isLoading = false;

        this.applyFilters();
      },

      error: () => {
        this.users = [];
        this.filteredUsers = [];
        this.pagedUsers = [];

        this.isLoading = false;

        this.updateGridConfig();

        this.toastr.error('Failed to load users');
      },
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;

    const search = this.searchText
      .trim()
      .toLowerCase();

    const selectedRoleId = this.roleFilter
      ? Number(this.roleFilter)
      : null;

    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !search ||
        user.username
          ?.toLowerCase()
          .includes(search) ||
        user.email
          ?.toLowerCase()
          .includes(search);

      const matchesRole =
        selectedRoleId === null ||
        user.roleId === selectedRoleId;

      return matchesSearch && matchesRole;
    });

    this.updatePagedUsers();
    this.updateGridConfig();
  }

  onPageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.updatePagedUsers();
    this.updateGridConfig();
  }

  onGridAction(event: {
    action: GridAction<User>;
    row: User;
  }): void {
    switch (event.action.id) {
      case 'edit':
        this.openEditDialog(event.row);
        break;

      case 'delete':
        this.deleteUser(event.row);
        break;
    }
  }

  private updatePagedUsers(): void {
    const start = this.pageIndex * this.pageSize;
  

    this.pagedUsers = this.filteredUsers.slice(
      start,
      start + this.pageSize
    );
  }

  private updateGridConfig(): void {
    this.gridConfig = {
      pagination: true,
      pageSize: this.pageSize,
      pageSizeOptions: [5, 10, 20],
      emptyMessage: 'No users found.',
      actionColumnHeader: 'Actions',
      actionColumnWidth: '120px',

      loading: this.isLoading,

      showActions: this.role === 'ADMIN',

      totalRecords: this.filteredUsers.length,
    };
  }

  private formatUsername(value: unknown): string {
    if (value == null) {
      return '';
    }

    return String(value)
      .toLowerCase()
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  }

  private getRoleName(roleId: number): string {
    switch (roleId) {
      case 1:
        return 'Admin';

      case 2:
        return 'Interviewer';

      default:
        return 'Unknown';
    }
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '420px',
        disableClose: true,
        data: {
          title: 'User',
          name: user.username,
        },
      }
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastr.success(
            'User deleted successfully'
          );

          this.getUsers();
        },

        error: () => {
          this.toastr.error(
            'Failed to delete user'
          );
        },
      });
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(
      UserDialogComponent,
      {
        width: '520px',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const payload = {
        username: result.username,
        email: result.email,
        password: result.password,
        roleId: result.roleId,
        isActive: result.isActive,
      };

      this.usersService.createUser(payload).subscribe({
        next: () => {
          this.toastr.success(
            'User created successfully'
          );

          this.getUsers();
        },

        error: () => {
          this.toastr.error(
            'Failed to create user'
          );
        },
      });
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(
      UserDialogComponent,
      {
        width: '520px',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          roleId: user.roleId,
          isActive: user.isActive,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const payload = {
        username: result.username,
        email: result.email,
        password: result.password,
        roleId: result.roleId,
        isActive: result.isActive,
      };

      this.usersService
        .updateUser(user.id, payload)
        .subscribe({
          next: () => {
            this.toastr.success(
              'User updated successfully'
            );

            this.getUsers();
          },

          error: () => {
            this.toastr.error(
              'Failed to update user'
            );
          },
        });
    });
  }
}
