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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-candidate-dialog',
  standalone: true,
  templateUrl: './candidate-dialog.html',
  styleUrl: './candidate-dialog.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
  ],
})
export class CandidateDialogComponent {

  private fb = inject(FormBuilder);

  isEditMode = false;

  form = this.fb.group({

    firstName: [
      '',
      Validators.required,
    ],

    lastName: [
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

    experience: [
      0,
      Validators.required,
    ],

    designation: [
      '',
      Validators.required,
    ],

    isActive: [true],
  });

  constructor(
    private dialogRef:
      MatDialogRef<CandidateDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any,
  ) {

    if (data) {

      this.isEditMode = true;

      this.form.patchValue({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        experience: data.experience,
        designation: data.designation,
        isActive: data.isActive,
      });
    }
  }

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.dialogRef.close(
      this.form.getRawValue()
    );
  }
}