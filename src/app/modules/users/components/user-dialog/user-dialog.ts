import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatFormFieldModule,
  ],
})
export class UserDialogComponent {

  private fb = inject(FormBuilder);
  isEditMode = false;
  form = this.fb.group({
    username: [
      '',
      Validators.required,
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
      ],
    ],
    password: ['',Validators.required],
    roleId: [2],
    isActive: [true],
  });

  constructor(
    private dialogRef:
      MatDialogRef<UserDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any,
  ) {

    if (data) {
      this.isEditMode = true;
      this.form.patchValue(data);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}