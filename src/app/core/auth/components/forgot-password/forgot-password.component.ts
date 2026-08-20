import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPassword {
  isLoading = signal(false);
  ArrowLeft = ArrowLeft;
  submitted = false;

  private fb = inject(FormBuilder);

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
  ) { }

  onSubmit() {
    this.submitted = true;

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const payload = this.forgotForm.getRawValue();

    this.authService.forgotPassword(payload).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.success) {
          this.toastr.success('Reset link sent to your email');
        } else {
          this.toastr.error(
            response.errorMessages?.join(',') ?? 'Failed to send reset link',
          );
        }
      },

      error: (error) => {
        this.isLoading.set(false);

        this.toastr.error(error?.error?.message || 'Something went wrong');
      },
    });
  }
}
