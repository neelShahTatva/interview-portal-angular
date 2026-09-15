import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { UserProfile } from '../../models/user-profile.model';
import { UsersService } from '../../../users/services/users.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
})
export class ProfileHeaderComponent {
  @Input() user!: UserProfile;
  @Output() pictureUploaded = new EventEmitter<string>();

  isUploading = false;
  imageLoadError = false;

  private readonly maxFileSize = 5 * 1024 * 1024; // 5 MB
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  constructor(
    private readonly usersService: UsersService,
    private readonly toastr: ToastrService
  ) {}

  get displayAvatarUrl(): string | null {
    if (this.imageLoadError || !this.user?.profilePictureUrl) {
      return null;
    }
    const url = this.user.profilePictureUrl;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${environment.baseUrl}${url}`;
    }
    return `${environment.baseUrl}/uploads/profile-pictures/${url}`;
  }

  onImageError(): void {
    this.imageLoadError = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    input.value = '';

    // Check for empty file
    if (file.size === 0) {
      this.toastr.error('Selected file is empty. Please select a valid image.');
      return;
    }

    //  Check max file size (5MB)
    if (file.size > this.maxFileSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      this.toastr.error(`Image size (${sizeMb} MB) exceeds the maximum limit of 5 MB.`);
      return;
    }

    // Check MIME type
    if (!this.allowedTypes.includes(file.type.toLowerCase())) {
      this.toastr.error('Invalid image type. Only JPEG, PNG, and WEBP images are allowed.');
      return;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      this.toastr.error('Invalid file extension. Please select a .jpg, .jpeg, .png, or .webp image.');
      return;
    }

    // All validations passed -> upload
    this.isUploading = true;
    this.usersService.uploadProfilePicture(file).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        const newUrl = response?.result || response?.data || response;
        if (typeof newUrl === 'string') {
          this.imageLoadError = false;
          this.user.profilePictureUrl = newUrl;
          this.pictureUploaded.emit(newUrl);
          this.toastr.success('Profile picture updated successfully!');
        } else {
          this.toastr.success('Profile picture updated successfully!');
          this.pictureUploaded.emit('');
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        const msg =
          err?.error?.errorMessages?.[0] ||
          err?.error?.message ||
          'Failed to upload profile picture. Please try again.';
        this.toastr.error(msg);
      },
    });
  }
}
