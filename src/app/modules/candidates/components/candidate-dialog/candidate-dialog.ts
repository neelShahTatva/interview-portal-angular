import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '@shared/components';

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
    ButtonComponent,
  ],
})
export class CandidateDialogComponent {
  private fb = inject(FormBuilder);

  isEditMode = false;
  submitted = false;

  readonly designations: string[] = [
    'TSE',
    'ASE',
    'SE',
    'SSE',
    'TL',
    'STL',
    'APM',
    'PM',
    'PPM',
  ];

  form = this.fb.group({
    firstName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],

    lastName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],

    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(100)],
    ],

    experience: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(50)],
    ],

    designation: ['', Validators.required],

    isActive: [true],
  });

  constructor(
    private dialogRef: MatDialogRef<CandidateDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: any
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

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.submitted = false;

    this.submitted = false;

    this.dialogRef.close(this.form.getRawValue());
  }
}
