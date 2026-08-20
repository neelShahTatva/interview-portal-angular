import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPassword {
  hidePassword = signal(true);

  isLoading = signal(false);

  token = '';

  private route = inject(ActivatedRoute);

  private fb = inject(FormBuilder);

  resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],

    confirmPassword: ['', [Validators.required]],
  });
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
  ) { }

 ngOnInit() {
  this.token = this.route.snapshot.paramMap.get('token') || '';


  this.authService.validateResetToken(this.token).subscribe({
    next: (response: any) => {

      if (!response.success) {
        this.toastr.error('Invalid or expired reset link');

        this.router.navigate(['/auth/login']);
      }
    },

    error: (error) => {

      this.toastr.error('Invalid or expired reset link');

      this.router.navigate(['/auth/login']);
    },
  });
}
  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();

      return;
    }

    const payload = {
      token: this.token,

      ...this.resetForm.getRawValue(),
    };

    this.isLoading.set(true);

    this.authService.resetPassword(payload).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.success) {
          this.toastr.success('Password updated successfully');

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1500);
        } else {
          this.toastr.error(
            response.errorMessages?.join(',') ?? 'Reset password failed',
          );
        }
      },

      error: (error) => {
        this.isLoading.set(false);

        this.toastr.error(error?.error?.message || 'Reset password failed');
      },
    });
  }
}
