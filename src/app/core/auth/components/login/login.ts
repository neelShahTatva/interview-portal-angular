import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BriefcaseBusiness, LucideAngularModule } from 'lucide-angular';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { LoginResponse } from '../../models/login-response.model';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  BriefcaseBusiness = BriefcaseBusiness;

  isLoading = signal(false);

  submitted = false;

  private formBuilder = inject(FormBuilder);

  private destroyRef = inject(DestroyRef);

  loginForm = this.formBuilder.nonNullable.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)],
    ],

    password: ['', [Validators.required]],
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

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
              response.errorMessages?.join(',') ?? 'Login failed'
            );
          }
        },

        error: (error) => {
          this.isLoading.set(false);
          this.toastr.error(error?.error?.errorMessages?.[0] || 'Login failed');
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
