import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { UserProfile } from '../../models/user-profile.model';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UsersService } from '../../../users/services/users.service';
import { UserDialogComponent } from '../../../users/components/user-dialog/user-dialog';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';
import { PersonalInfoComponent } from '../personal-info/personal-info.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    ProfileHeaderComponent,
    PersonalInfoComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  user!: UserProfile;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const authUser = this.authService.getUser();
    const claims = this.authService.getClaims();

    const userId = claims?.UserId || authUser?.id || 1;
    const username = authUser?.userName || claims?.Name || 'User';
    const email = authUser?.email || '';
    const roleName = (authUser?.roleName || claims?.RoleName || 'INTERVIEWER').toUpperCase();
    const roleId = claims?.RoleId || authUser?.roleId || (roleName === 'ADMIN' ? 1 : 2);
    const isActive = authUser?.isActive !== undefined ? authUser.isActive : true;

    // Set initial profile directly from authenticated session
    this.user = {
      id: userId,
      username: username,
      email: email,
      roleId: roleId,
      roleName: roleName,
      isActive: isActive,
      profilePictureUrl: authUser?.profilePictureUrl || authUser?.profilePicture,
    };

    // Fetch live profile from backend
    this.usersService.getProfile().subscribe({
      next: (response: any) => {
        const p = response?.result || response?.data || response;
        if (p) {
          this.user = {
            id: p.id,
            username: p.username,
            email: p.email,
            roleId: p.roleId,
            roleName: (p.roleName || (p.roleId === 1 ? 'ADMIN' : 'INTERVIEWER')).toUpperCase(),
            isActive: p.isActive ?? true,
            profilePictureUrl: p.profilePictureUrl,
          };
          const storedUser = this.authService.getUser() || {};
          storedUser.profilePictureUrl = p.profilePictureUrl;
          this.authService.updateUser(storedUser);
        }
      },
      error: () => {
        // Fallback to getUsers if needed
        this.usersService.getUsers().subscribe({
          next: (response: any) => {
            const usersList: any[] = response?.result || response || [];
            const found = usersList.find(
              (u: any) => u.id === userId || (email && u.email?.toLowerCase() === email.toLowerCase())
            );

            if (found) {
              this.user = {
                id: found.id,
                username: found.username,
                email: found.email,
                roleId: found.roleId,
                roleName: found.roleId === 1 ? 'ADMIN' : 'INTERVIEWER',
                isActive: found.isActive ?? true,
                profilePictureUrl: found.profilePicture || found.profilePictureUrl,
              };
            }
          },
        });
      },
    });
  }

  onPictureUploaded(newUrl: string): void {
    if (this.user) {
      this.user.profilePictureUrl = newUrl;
    }
    const storedUser = this.authService.getUser() || {};
    storedUser.profilePictureUrl = newUrl;
    this.authService.updateUser(storedUser);
  }

  openEditDialog(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '520px',
      data: {
        id: this.user.id,
        username: this.user.username,
        email: this.user.email,
        roleId: this.user.roleId,
        isActive: this.user.isActive,
        isSelfProfile: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: any = {
        username: result.username,
        email: result.email,
        roleId: Number(result.roleId),
        isActive: Boolean(result.isActive),
      };
      if (result.password && result.password.trim()) {
        payload.password = result.password;
      }

      this.usersService.updateProfile(payload).subscribe({
        next: (response: any) => {
          this.toastr.success('Profile updated successfully');
          const updated = response?.result || response?.data || response;

          // If backend generated a fresh token with the new username, update it in localStorage
          if (updated?.token) {
            localStorage.setItem('token', updated.token);
          }

          const newRoleId = updated?.roleId ?? payload.roleId;
          const newRoleName = updated?.roleName ?? (newRoleId === 1 ? 'ADMIN' : 'INTERVIEWER');
          const newIsActive = updated?.isActive ?? payload.isActive;

          // Update local state with updated role and status
          this.user = {
            ...this.user,
            username: updated?.username || payload.username,
            email: updated?.email || payload.email,
            roleId: newRoleId,
            roleName: newRoleName,
            isActive: newIsActive,
          };

          // Update user in auth service (updates localStorage and emits to layout header)
          const storedUser = this.authService.getUser() || {};
          storedUser.userName = this.user.username;
          storedUser.email = this.user.email;
          storedUser.roleId = this.user.roleId;
          storedUser.roleName = this.user.roleName;
          storedUser.isActive = this.user.isActive;
          this.authService.updateUser(storedUser);
        },
        error: (err: any) => {
          const msg =
            err?.error?.errorMessages?.[0] ||
            err?.error?.message ||
            'Failed to update profile';
          this.toastr.error(msg);
        },
      });
    });
  }
}
