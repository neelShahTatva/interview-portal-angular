import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UsersService } from '../../../../core/auth/services/users.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from '../user-dialog/user-dialog';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
})
export class UsersComponent implements OnInit {

  displayedColumns = ['username', 'email', 'role', 'status', 'actions'];
  users: any[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  searchText = '';
  roleFilter = '';
  isLoading = false;
  role = '';

  constructor(
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.getUsers();

    const user = this.authService.getUser();
    if (user) { this.role = user.roleName; }

    this.displayedColumns = [
      'username',
      'email',
      'role',
      'status',
    ];

    if (this.role === 'ADMIN') {
      this.displayedColumns.push('actions');
    }
  }

  getUsers(): void {
    this.isLoading = true;

    this.usersService.getUsers().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.users = response.result;
        this.dataSource.data = response.result;
        this.dataSource.paginator = this.paginator;
      },

      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.dataSource.filterPredicate =
      (data: any, filter: string) => {
        const parsedFilter = JSON.parse(filter);
        const search = parsedFilter.search;
        const role = parsedFilter.role;

        // SEARCH
        const matchesSearch =
          !search ||
          data.username
            ?.toLowerCase()
            .includes(search) ||
          data.email
            ?.toLowerCase()
            .includes(search);

        // ROLE
        const matchesRole = !role || data.roleId === Number(role);

        return matchesSearch && matchesRole;
      };

    this.dataSource.filter = JSON.stringify({
      search:
        this.searchText
          .trim()
          .toLowerCase(),

      role:
        this.roleFilter,
    });

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  deleteUser(user: any): void {
    const dialogRef = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '420px',
        disableClose: true,
        data: {
          title:"User",
          name: user.username,
        },
      }
    );

    dialogRef.afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.usersService
          .deleteUser(user.id)
          .subscribe({
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

    dialogRef.afterClosed()
      .subscribe((result) => {
        if (!result) return;

        const payload = {
          username: result.username,
          email: result.email,
          password: result.password,
          roleId: result.roleId,
          isActive: result.isActive,
        };

        this.usersService
          .createUser(payload)
          .subscribe({
            next: () => {
              this.getUsers();
              this.toastr.success(
                'User created successfully'
              );
            },

            error: () => {
              this.toastr.error(
                'Failed to create user'
              );
            },
          });
      });
  }

  openEditDialog(user: any): void {
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

    dialogRef.afterClosed()
      .subscribe((result) => {

        if (!result) return;

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
              this.getUsers();
              this.toastr.success(
                'User updated successfully'
              );
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