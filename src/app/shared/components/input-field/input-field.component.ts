import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { ErrorMessage } from './models/input';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
})
export class InputFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly submitted = input(false);
  readonly customErrorMessage = input<ErrorMessage[]>([]);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly hidePassword = signal(true);

  get showError(): boolean {
    const control = this.control();
    return control.invalid && (control.touched || this.submitted());
  }

  get errorMessage(): string {
    const errors = this.control().errors;

    if (!errors) return '';
    const customError = this.customErrorMessage().find((e) => errors[e.key]);

    if (customError) return customError.error;
    if (!errors) return '';
    if (errors['required']) return `${this.label()} is required`;
    if (errors['email']) return 'Enter a valid email address';
    if (errors['minlength'])
      return `${this.label()} must be at least ${
        errors['minlength'].requiredLength
      } characters`;
    if (errors['maxlength'])
      return `${this.label()} cannot exceed ${
        errors['maxlength'].requiredLength
      } characters`;
    if (errors['pattern']) return `${this.label()} format is invalid`;
    return `${this.label()} is invalid`;
  }

  togglePassword(): void {
    this.hidePassword.update((hidden) => !hidden);
  }
}
