import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Eye,
  EyeOff,
  User,
  BriefcaseBusiness,
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class Register {
  Eye = Eye;

  EyeOff = EyeOff;
  BriefcaseBusiness = BriefcaseBusiness;

  User = User;

  hidePassword = signal(true);

  isLoading = signal(false);

  submitted = false;

  private fb = inject(FormBuilder);

  registerForm = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],

    email: ['', [Validators.required, Validators.email]],

    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {}

  togglePassword() {
    this.hidePassword.update((v) => !v);
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const payload = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.success) {
          this.toastr.success('Account created successfully');

          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(
            response.errorMessages?.join(',') ?? 'Registration failed',
          );
        }
      },

      error: (error) => {
        this.isLoading.set(false);

        this.toastr.error(error?.error?.message || 'Registration failed');
      },
    });
  }
}
