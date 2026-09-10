import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { passwordMatchValidator } from '../../../../shared/validators/password-validator';
import { ErrorMessage } from '../../../../shared/components/input-field/models/input';
import { SYSTEM_CONSTANTS } from '../../../../shared/constant/system.constants';
import { ERROR_MESSAGE } from '../../../../shared/constant/error-message.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputFieldComponent,
    ButtonComponent,
  ],
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
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(SYSTEM_CONSTANTS.PASSWORD_REGEX),
      ],
    ],

    confirmPassword: [
      '',
      [Validators.required, passwordMatchValidator('newPassword')],
    ],
  });
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  passwordInvalid: ErrorMessage[] = [
    {
      key: 'pattern',
      error: ERROR_MESSAGE.PASSWORD_INVALID,
    },
  ];
  passwordMismatchError: ErrorMessage[] = [
    {
      key: 'passwordMismatch',
      error: ERROR_MESSAGE.PASSWORD_MISMATCH,
    },
  ];

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
          }, 500);
        } else {
          this.toastr.error(
            response.errorMessages?.join(',') ?? 'Reset password failed'
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
