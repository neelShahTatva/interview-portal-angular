import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LucideAngularModule,
} from 'lucide-angular';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';
import { LoginResponse } from '../../interfaces/login-response.interface';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  Eye = Eye;
  EyeOff = EyeOff;
  BriefcaseBusiness = BriefcaseBusiness;

  hidePassword = signal(true);

  isLoading = signal(false);

  submitted = false;

  private formBuilder = inject(FormBuilder);

  private destroyRef = inject(DestroyRef);

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],

    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
  ) { }

  togglePassword() {
    this.hidePassword.update((v) => !v);
  }
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const payload = this.loginForm.getRawValue();

    this.authService
      .login(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponse<LoginResponse>) => {
          this.isLoading.set(false);

          if (response.success && response.result) {
            const accessToken = response.result.accessToken;

            const refreshToken = response.result.refreshToken;

            const user = {
              userName: response.result.user?.username,
              email: response.result.user?.email,
              isActive: response.result.user?.isActive,
              roleId: response.result.user?.role?.id,
              roleName: response.result.user?.role?.roleName,
            };

            this.authService.setToken(accessToken, refreshToken, user);

            // this.toastr.success('Login successful');

            this.router.navigate(['/dashboard']);
          } else {
            this.toastr.error(
              response.errorMessages?.join(',') ?? 'Login failed',
            );
          }
        },

        error: (error) => {
          this.isLoading.set(false);
          this.toastr.error(error?.error?.errorMessages[0] || 'Login failed');
        },
      });
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }
}
